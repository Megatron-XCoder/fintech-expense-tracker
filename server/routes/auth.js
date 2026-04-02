const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', color: '#f87171', icon: 'Utensils', isDefault: true },
  { name: 'Shopping', color: '#60a5fa', icon: 'ShoppingBag', isDefault: true },
  { name: 'Housing', color: '#fb923c', icon: 'Home', isDefault: true },
  { name: 'Transportation', color: '#a78bfa', icon: 'Car', isDefault: true },
  { name: 'Bills & Utilities', color: '#fbbf24', icon: 'Zap', isDefault: true },
  { name: 'Entertainment', color: '#34d399', icon: 'Film', isDefault: true },
  { name: 'Income', color: '#10b981', icon: 'Banknote', isDefault: true },
  { name: 'Transfer', color: '#9ca3af', icon: 'ArrowRightLeft', isDefault: true },
  { name: 'Other', color: '#6b7280', icon: 'Tag', isDefault: true }
];

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({ firstName, lastName, email, password });

    // Seed default categories
    const categoriesToSeed = DEFAULT_CATEGORIES.map(cat => ({
      ...cat,
      user: user._id
    }));
    await Category.insertMany(categoriesToSeed);

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
