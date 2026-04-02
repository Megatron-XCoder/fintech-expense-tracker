const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    trim: true,
  },
  color: {
    type: String,
    default: '#3b82f6', // Default blue
  },
  icon: {
    type: String,
    default: 'Tag', // Lucide icon name
  },
  isDefault: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

// Ensure unique category names per user
categorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
