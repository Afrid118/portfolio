const express = require('express');
const router = express.Router();
const { createClaim, getMyClaims, getClaimsForMyItem, adminGetClaims, adminUpdateClaimStatus } = require('../controllers/claimController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createClaim);
router.get('/my', protect, getMyClaims);
router.get('/item/:itemId', protect, getClaimsForMyItem);
router.get('/admin/all', protect, adminOnly, adminGetClaims);
router.put('/admin/:id/status', protect, adminOnly, adminUpdateClaimStatus);

module.exports = router;
