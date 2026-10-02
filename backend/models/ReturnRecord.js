const mongoose = require('mongoose');

const returnRecordSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  returnedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  returnedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  returnDate: { type: Date, default: Date.now },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ReturnRecord', returnRecordSchema);
