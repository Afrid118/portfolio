const express = require('express');
const router = express.Router();
const { getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const User = require('../models/User');

router.get('/profile', protect, getMe);
router.put('/profile', protect, updateProfile);

router.put('/profile/image', protect, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
    
    const user = await User.findById(req.user._id);
    user.profileImage = req.file.filename;
    await user.save();
    
    res.status(200).json({ success: true, data: user.profileImage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
