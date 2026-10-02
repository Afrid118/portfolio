const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, adminRegister } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');
const { loginValidation } = require('../middleware/validate');

// No server-side ID format validation on register — the controller handles uniqueness checks.
// Client-side format validation is enforced in register.html.
// This keeps the route flexible for both student and faculty registration.
router.post('/register', register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/admin/register', protect, adminOnly, adminRegister);

module.exports = router;
