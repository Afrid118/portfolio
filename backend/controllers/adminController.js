const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const ReturnRecord = require('../models/ReturnRecord');
const { createNotification } = require('../utils/notifications');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLost = await Item.countDocuments({ type: 'lost' });
    const totalFound = await Item.countDocuments({ type: 'found' });
    const pendingReports = await Item.countDocuments({ status: 'pending' });
    const claimRequests = await Claim.countDocuments({ status: 'pending' });
    const returnedItems = await Item.countDocuments({ status: 'returned' });
    const unclaimed = await Item.countDocuments({ status: 'approved' });

    res.status(200).json({ success: true, data: {
      totalUsers, totalLost, totalFound, pendingReports, claimRequests, returnedItems, unclaimed
    }});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = ['name', 'email', 'studentId', 'facultyId', 'department'].map(field => ({
        [field]: { $regex: escapedSearch, $options: 'i' }
      }));
    }
    
    const users = await User.find(query).select('-password').skip(skip).limit(parseInt(limit)).sort('-createdAt');
    const total = await User.countDocuments(query);

    res.status(200).json({ success: true, data: users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markItemReturned = async (req, res) => {
  try {
    const { returnedToId, notes } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const approvedClaim = await Claim.findOne({ itemId: item._id, status: 'approved' });
    const recipientId = returnedToId || (approvedClaim && approvedClaim.claimantId) || item.reporter;

    item.status = 'returned';
    await item.save();

    await ReturnRecord.create({
      itemId: item._id,
      returnedTo: recipientId,
      returnedBy: req.user._id,
      notes
    });

    createNotification(item.reporter, 'Item Returned', `Your reported item ${item.itemName} has been returned.`, 'item_returned', item._id);
    createNotification(recipientId, 'Item Returned', `You have received the item ${item.itemName}.`, 'item_returned', item._id);

    res.status(200).json({ success: true, message: 'Item marked as returned' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats, getAllUsers, getUserById, deleteUser, markItemReturned };
