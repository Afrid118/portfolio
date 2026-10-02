const Claim = require('../models/Claim');
const Item = require('../models/Item');
const { createNotification } = require('../utils/notifications');

const createClaim = async (req, res) => {
  try {
    const { itemId, reason, additionalInfo, contactEmail, contactPhone } = req.body;
    
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    
    if (item.status !== 'approved' && item.status !== 'found') {
      return res.status(400).json({ success: false, message: 'Item is not available for claiming' });
    }

    if (item.reporter.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot claim your own report' });
    }

    const existingClaim = await Claim.findOne({ itemId, claimantId: req.user._id });
    if (existingClaim) {
      return res.status(400).json({ success: false, message: 'You have already claimed this item' });
    }

    const claim = await Claim.create({
      itemId,
      claimantId: req.user._id,
      reason,
      additionalInfo,
      contactEmail: contactEmail || req.user.email,
      contactPhone
    });

    item.status = 'claim_requested';
    await item.save();

    // Notify item reporter
    createNotification(item.reporter, 'Item Claimed', `Someone has requested to claim your report: ${item.itemName}`, 'claim_submitted', item._id);

    res.status(201).json({ success: true, data: claim });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimantId: req.user._id })
      .populate('itemId', 'itemName category status photo location')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: claims });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getClaimsForMyItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    
    if (item.reporter.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const claims = await Claim.find({ itemId: req.params.itemId })
      .populate('claimantId', 'name email phone')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: claims });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const adminGetClaims = async (req, res) => {
  try {
    const query = {};
    if (['pending', 'approved', 'rejected'].includes(req.query.status)) query.status = req.query.status;
    const claimsQuery = Claim.find(query)
      .populate('itemId', 'itemName itemId type status')
      .populate('claimantId', 'name email phone')
      .sort('-createdAt');
    const parsedLimit = Number.parseInt(req.query.limit, 10);
    if (Number.isInteger(parsedLimit) && parsedLimit > 0) claimsQuery.limit(parsedLimit);
    const claims = await claimsQuery;
    res.status(200).json({ success: true, data: claims });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const adminUpdateClaimStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const claim = await Claim.findById(req.params.id).populate('itemId');
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });

    claim.status = status;
    if (adminNote) claim.adminNote = adminNote;
    await claim.save();

    const item = await Item.findById(claim.itemId._id);
    if (status === 'approved') {
      item.status = 'claim_approved';
      await item.save();
      createNotification(claim.claimantId, 'Claim Approved', `Your claim for ${item.itemName} has been approved.`, 'general', item._id);
      createNotification(item.reporter, 'Claim Approved', `The claim for your report ${item.itemName} has been approved.`, 'general', item._id);
    } else if (status === 'rejected') {
      item.status = 'approved';
      await item.save();
      createNotification(claim.claimantId, 'Claim Rejected', `Your claim for ${item.itemName} has been rejected.`, 'general', item._id);
    }

    res.status(200).json({ success: true, data: claim });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createClaim, getMyClaims, getClaimsForMyItem, adminGetClaims, adminUpdateClaimStatus };
