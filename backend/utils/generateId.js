const Counter = require('../models/Counter');

const generateItemId = async () => {
  const seq = await Counter.getNextSequence('item_id');
  const year = new Date().getFullYear();
  return `LF${year}${String(seq).padStart(4, '0')}`;
};

module.exports = generateItemId;
