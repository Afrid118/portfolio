const { check, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

const registerStudent = [
  check('name', 'Name is required').not().isEmpty(),
  check('studentId', 'Valid Student ID is required (e.g. 24UECS1383)').matches(/^\d{2}[A-Z]{2,5}\d{3,4}$/),
  check('department', 'Department is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('phone', 'Valid Indian phone number required').matches(/^[6-9][0-9]{9}$/),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  handleValidation
];

const registerFaculty = [
  check('name', 'Name is required').not().isEmpty(),
  check('facultyId', 'Valid Faculty ID is required (e.g. TTS3321)').matches(/^[A-Z]{2,4}\d{3,5}$/),
  check('department', 'Department is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('phone', 'Valid Indian phone number required').matches(/^[6-9][0-9]{9}$/),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  handleValidation
];

const loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
  handleValidation
];

const itemValidation = [
  check('itemName', 'Item name is required').not().isEmpty(),
  check('category', 'Category is required').not().isEmpty(),
  check('date', 'Date is required').not().isEmpty(),
  check('location', 'Location is required').not().isEmpty(),
  handleValidation
];

module.exports = {
  registerStudent,
  registerFaculty,
  loginValidation,
  itemValidation
};
