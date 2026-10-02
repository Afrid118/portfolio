const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, getUserById, deleteUser, markItemReturned } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:id', protect, adminOnly, getUserById);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.put('/items/:id/return', protect, adminOnly, markItemReturned);

module.exports = router;
