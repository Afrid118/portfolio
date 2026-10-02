const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['report_approved', 'match_found', 'claim_submitted', 'item_returned', 'general'], default: 'general' },
  read: { type: Boolean, default: false },
  relatedItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
