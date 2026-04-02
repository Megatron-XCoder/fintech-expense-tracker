const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Transaction = require('../models/Transaction');
const Upload = require('../models/Upload');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');
const { parseSBIStatement, CATEGORIES } = require('../utils/csvParser');

router.use(protect);

// ────────────────────────────────────────────
// Ensure default categories exist for a user
// ────────────────────────────────────────────
const ensureDefaultCategories = async (userId) => {
  const categoryMap = {};
  for (const [name, { color }] of Object.entries(CATEGORIES)) {
    let cat = await Category.findOne({ user: userId, name });
    if (!cat) {
      cat = await Category.create({ user: userId, name, color, isDefault: true });
    } else if (cat.color !== color) {
      // Update color to match spec
      cat.color = color;
      await cat.save();
    }
    categoryMap[name] = cat._id;
  }
  return categoryMap;
};

// ────────────────────────────────────────────
// @route   GET /api/transactions/analytics
// ────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate('category')
      .sort({ date: -1, _id: -1 });

    const totalSpent = transactions.filter(t => t.type === 'Debit').reduce((acc, t) => acc + t.amount, 0);
    const totalIncome = transactions.filter(t => t.type === 'Credit').reduce((acc, t) => acc + t.amount, 0);
    
    // Net balance from actual last transaction's balance field (if available)
    const currentBalance = transactions.length > 0 ? transactions[0].balance : 0;

    // Category Breakdown (expenses only, excluding transfers for cleaner view)
    const categoryBreakdown = {};
    transactions.forEach(t => {
      if (t.type === 'Debit' && t.category) {
        const catName = t.category.name;
        if (!categoryBreakdown[catName]) {
          categoryBreakdown[catName] = { value: 0, color: t.category.color, count: 0 };
        }
        categoryBreakdown[catName].value += t.amount;
        categoryBreakdown[catName].count += 1;
      }
    });

    const pieData = Object.keys(categoryBreakdown)
      .filter(name => name !== 'Income' && name !== 'Transfer & Investments' && name !== 'Personal Transfers')
      .map(name => ({
        name,
        value: Math.round(categoryBreakdown[name].value * 100) / 100,
        fill: categoryBreakdown[name].color,
        count: categoryBreakdown[name].count,
      }))
      .sort((a, b) => b.value - a.value);

    // ── INSIGHTS ENGINE ──

    // Monthly breakdown
    const monthlyData = {};
    transactions.forEach(t => {
      const monthKey = new Date(t.date).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) monthlyData[monthKey] = { income: 0, spent: 0 };
      if (t.type === 'Credit') monthlyData[monthKey].income += t.amount;
      else monthlyData[monthKey].spent += t.amount;
    });

    const monthlyTrend = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        label: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        income: Math.round(data.income),
        spent: Math.round(data.spent),
        net: Math.round(data.income - data.spent),
      }));

    // Coffee/Snack factor: small F&D hits < ₹500
    const smallFoodHits = transactions.filter(t => 
      t.type === 'Debit' && 
      t.category?.name === 'Food & Dining' && 
      t.amount < 500
    );
    const coffeeSnackFactor = {
      count: smallFoodHits.length,
      totalSpent: Math.round(smallFoodHits.reduce((s, t) => s + t.amount, 0)),
    };

    // Subscription leaks: recurring amounts to Google, Zee5, Airtel
    const subscriptionKeywords = ['GOOGLE', 'ZEE5', 'AIRTEL', 'MYJIO', 'NETFLIX', 'SPOTIFY'];
    const subscriptions = {};
    transactions.filter(t => t.type === 'Debit').forEach(t => {
      const merchant = (t.merchantName || '').toUpperCase();
      for (const kw of subscriptionKeywords) {
        if (merchant.includes(kw)) {
          if (!subscriptions[kw]) subscriptions[kw] = { total: 0, count: 0 };
          subscriptions[kw].total += t.amount;
          subscriptions[kw].count += 1;
          break;
        }
      }
    });

    // Investment ratio
    const investmentCategories = ['Transfer & Investments'];
    const investmentTotal = transactions
      .filter(t => t.type === 'Debit' && investmentCategories.includes(t.category?.name))
      .reduce((s, t) => s + t.amount, 0);
    const investmentRatio = totalIncome > 0 ? Math.round((investmentTotal / totalIncome) * 100) : 0;

    // Top spending categories
    const topSpending = pieData.slice(0, 5);

    res.json({
      success: true,
      data: {
        totalSpent,
        totalIncome,
        currentBalance,
        netBalance: totalIncome - totalSpent,
        transactionCount: transactions.length,
        categoryBreakdown: pieData,
        insights: {
          monthlyTrend,
          coffeeSnackFactor,
          subscriptions,
          investmentRatio,
          investmentTotal: Math.round(investmentTotal),
          topSpending,
        }
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Setup multer
const upload = multer({ dest: 'uploads/' });

// ────────────────────────────────────────────
// @route   POST /api/transactions/upload
// ────────────────────────────────────────────
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;

    // Parse file with new SBI parser
    const parsedTransactions = await parseSBIStatement(filePath, originalName);
    
    if (!parsedTransactions || parsedTransactions.length === 0) {
       fs.unlinkSync(filePath);
       return res.status(400).json({ success: false, message: 'No valid transactions found in file' });
    }

    // Ensure all categories exist
    const categoryMap = await ensureDefaultCategories(req.user.id);

    // Create Upload record
    const uploadRecord = await Upload.create({
      user: req.user.id,
      fileName: originalName,
      fileSize: req.file.size,
      rowCount: parsedTransactions.length,
    });

    const docs = parsedTransactions.map(t => ({
      user: req.user.id,
      upload: uploadRecord._id,
      category: categoryMap[t.categoryName] || categoryMap['Other'],
      date: t.date,
      description: t.description,
      merchantName: t.merchantName,
      amount: t.amount,
      type: t.type,
      balance: t.balance,
      refNo: t.refNo,
      hash: t.hash
    }));

    let newTransactionsCount = 0;
    let duplicateTransactionsCount = 0;

    try {
      const result = await Transaction.insertMany(docs, { ordered: false });
      newTransactionsCount = result.length;
    } catch (err) {
      if (err.code === 11000 || err.writeErrors) {
        newTransactionsCount = err.insertedDocs ? err.insertedDocs.length : 0;
        duplicateTransactionsCount = parsedTransactions.length - newTransactionsCount;
      } else {
        throw err;
      }
    }

    // Update upload record
    uploadRecord.newTransactions = newTransactionsCount;
    uploadRecord.duplicateTransactions = duplicateTransactionsCount;
    await uploadRecord.save();

    // Cleanup temp file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: `File processed. ${newTransactionsCount} new, ${duplicateTransactionsCount} duplicates.`,
      data: {
        totalParsed: parsedTransactions.length,
        newAdded: newTransactionsCount,
        duplicates: duplicateTransactionsCount
      }
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload error:', error);
    const statusCode = error.message && error.message.includes('MALFORMED_CSV') ? 400 : 500;
    res.status(statusCode).json({ success: false, message: error.message.replace('MALFORMED_CSV: ', '') });
  }
});

// ────────────────────────────────────────────
// @route   GET /api/transactions
// ────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate('category', 'name color icon')
      .sort({ date: -1, _id: -1 });
    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ────────────────────────────────────────────
// @route   PATCH /api/transactions/:id
// ────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    
    if (transaction.user.toString() !== req.user.id) {
       return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { categoryId } = req.body;
    if (categoryId) {
      transaction.category = categoryId;
      await transaction.save();
    }

    const updated = await Transaction.findById(req.params.id).populate('category', 'name color icon');
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ────────────────────────────────────────────
// @route   DELETE /api/transactions (clear all for user)
// ────────────────────────────────────────────
router.delete('/all', async (req, res) => {
  try {
    await Transaction.deleteMany({ user: req.user.id });
    res.json({ success: true, message: 'All transactions deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
