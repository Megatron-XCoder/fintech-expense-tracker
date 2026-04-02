const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  upload: {
    type: mongoose.Schema.ObjectId,
    ref: 'Upload',
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
  },
  date: {
    type: Date,
    required: [true, 'Please add a date'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
  },
  type: {
    type: String,
    enum: ['Debit', 'Credit'],
    required: true,
  },
  balance: {
    type: Number,
  },
  refNo: {
    type: String,
  },
  merchantName: {
    type: String,
    default: '',
  },
  hash: {
    type: String,
    required: true,
  }
}, { timestamps: true });

// Index for duplicate detection
transactionSchema.index({ user: 1, hash: 1 }, { unique: true });

module.exports = mongoose.model('Transaction', transactionSchema);
