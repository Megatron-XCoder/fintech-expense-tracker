const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
  },
  rowCount: {
    type: Number,
    default: 0,
  },
  newTransactions: {
    type: Number,
    default: 0,
  },
  duplicateTransactions: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Upload', uploadSchema);
