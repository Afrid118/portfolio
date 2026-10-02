const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, userType, name) => {
  return jwt.sign({ id, userType, name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const register = async (req, res) => {
  try {
    const { name, userType, studentId, facultyId, department, year, email, phone, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    if (userType === 'student') {
      const idExists = await User.findOne({ studentId });
      if (idExists) return res.status(400).json({ success: false, message: 'Student ID already exists' });
    } else if (userType === 'faculty') {
      const idExists = await User.findOne({ facultyId });
      if (idExists) return res.status(400).json({ success: false, message: 'Faculty ID already exists' });
    }

    const user = await User.create({
      name, userType, studentId, facultyId, department, year, email, phone, password
    });

    const token = generateToken(user._id, user.userType, user.name);
    const userData = await User.findById(user._id).select('-password').lean();

    res.status(201).json({ success: true, token, data: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.userType, user.name);
    const userData = await User.findById(user._id).select('-password').lean();

    res.status(200).json({ success: true, token, data: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, department, phone, email, year } = req.body;
    const user = await User.findById(req.user._id);

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ success: false, message: 'Email already in use' });
      user.email = email;
    }

    if (name) user.name = name;
    if (department) user.department = department;
    if (phone) user.phone = phone;
    if (year && user.userType === 'student') user.year = year;

    await user.save();
    const updatedUser = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect old password' });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const adminRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      userType: 'admin'
    });

    const userData = await User.findById(user._id).select('-password').lean();
    res.status(201).json({ success: true, data: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword, adminRegister };
