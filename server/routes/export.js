const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/export/csv
router.get('/csv', async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate('category', 'name')
      .sort({ date: -1 });

    // Build CSV with all relevant columns
    let csv = 'Date,Merchant,Description,Category,Type,Amount,Balance,Ref No\n';
    
    transactions.forEach(t => {
      const date = new Date(t.date).toLocaleDateString('en-IN');
      const merchant = `"${(t.merchantName || '').replace(/"/g, '""')}"`;
      const desc = `"${(t.description || '').replace(/"/g, '""')}"`;
      const cat = t.category?.name || 'Uncategorized';
      const sign = t.type === 'Credit' ? '' : '-';
      const line = [date, merchant, desc, cat, t.type, `${sign}${t.amount}`, t.balance, t.refNo || ''].join(',');
      csv += line + '\n';
    });

    // Add summary at the bottom
    const totalSpent = transactions.filter(t => t.type === 'Debit').reduce((acc, t) => acc + t.amount, 0);
    const totalIncome = transactions.filter(t => t.type === 'Credit').reduce((acc, t) => acc + t.amount, 0);
    csv += '\n';
    csv += `Summary,,,,,,\n`;
    csv += `Total Income,,,,,${totalIncome},\n`;
    csv += `Total Spent,,,,,${totalSpent},\n`;
    csv += `Net,,,,,${totalIncome - totalSpent},\n`;
    csv += `Transactions,,,,,${transactions.length},\n`;

    // Category breakdown
    const catBreakdown = {};
    transactions.filter(t => t.type === 'Debit').forEach(t => {
      const catName = t.category?.name || 'Uncategorized';
      catBreakdown[catName] = (catBreakdown[catName] || 0) + t.amount;
    });
    csv += '\nCategory Breakdown,,,,,,\n';
    for (const [cat, amount] of Object.entries(catBreakdown).sort((a, b) => b[1] - a[1])) {
      csv += `${cat},,,,,${Math.round(amount * 100) / 100},\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=fintrack_categorized_export.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/export/pdf  
router.get('/pdf', async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate('category', 'name')
      .sort({ date: -1 });

    const totalSpent = transactions.filter(t => t.type === 'Debit').reduce((acc, t) => acc + t.amount, 0);
    const totalIncome = transactions.filter(t => t.type === 'Credit').reduce((acc, t) => acc + t.amount, 0);

    res.json({
      success: true,
      data: {
        transactions: transactions.map(t => ({
          date: new Date(t.date).toLocaleDateString('en-IN'),
          merchant: t.merchantName || '',
          description: t.description,
          category: t.category?.name || 'Uncategorized',
          type: t.type,
          amount: t.amount,
          balance: t.balance
        })),
        summary: {
          totalSpent,
          totalIncome,
          netBalance: totalIncome - totalSpent,
          count: transactions.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
