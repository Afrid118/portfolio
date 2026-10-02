const express = require('express');
const router = express.Router();
const {
  createItem, getItems, getItemById, updateItem, deleteItem,
  getMyItems, getMatchingItems, adminGetItems, adminUpdateItemStatus
} = require('../controllers/itemController');
const { markItemReturned } = require('../controllers/adminController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { itemValidation } = require('../middleware/validate');

// Public routes
router.get('/', getItems);

// Protected user routes - MUST be before /:id to avoid conflicts
router.get('/my', protect, getMyItems);

// Admin routes - MUST be before /:id to avoid conflicts
router.get('/admin/all', protect, adminOnly, adminGetItems);
router.put('/admin/:id/status', protect, adminOnly, adminUpdateItemStatus);
router.put('/admin/:id/return', protect, adminOnly, markItemReturned);

// Dynamic ID routes - MUST come after specific named routes
router.get('/:id', optionalAuth, getItemById);
router.get('/:id/matches', protect, getMatchingItems);
router.post('/', protect, upload.single('photo'), itemValidation, createItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;
