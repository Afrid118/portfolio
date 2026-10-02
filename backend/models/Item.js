const mongoose = require('mongoose');
const generateItemId = require('../utils/generateId');

const itemSchema = new mongoose.Schema({
  itemId: { type: String, unique: true },
  type: { type: String, enum: ['lost', 'found'], required: true },
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String },
  color: { type: String },
  description: { type: String },
  photo: { type: String },
  date: { type: Date, required: true },
  time: { type: String },
  location: { type: String, required: true },
  specificLocation: { type: String },
  additionalDetails: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'lost', 'found', 'claim_requested', 'claim_approved', 'returned', 'closed', 'rejected'],
    default: 'pending'
  },
  adminNote: { type: String }
}, { timestamps: true });

// Text index for search
itemSchema.index({ itemName: 'text', description: 'text', brand: 'text', color: 'text', location: 'text' });

itemSchema.pre('save', async function(next) {
  if (this.isNew && !this.itemId) {
    this.itemId = await generateItemId();
  }
  next();
});

module.exports = mongoose.model('Item', itemSchema);
