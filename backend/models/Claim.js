const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  claimId: { type: String },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  claimantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  additionalInfo: { type: String },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String }
}, { timestamps: true });

claimSchema.pre('save', function(next) {
  if (this.isNew && !this.claimId) {
    this.claimId = `CLM${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Claim', claimSchema);
