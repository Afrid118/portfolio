const Item = require('../models/Item');
const User = require('../models/User');
const Claim = require('../models/Claim');
const { createNotification } = require('../utils/notifications');

const createItem = async (req, res) => {
  try {
    if (!req.body.type || !req.body.itemName || !req.body.category || !req.body.date || !req.body.location) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const itemData = { 
      ...req.body, 
      reporter: req.user._id,
      status: 'approved'
    };
    if (req.file) {
      itemData.photo = req.file.filename;
    }

    const item = await Item.create(itemData);

    // Return response immediately for snappy UI
    res.status(201).json({ success: true, data: item });
    
    // Background notifications without blocking response
    setImmediate(async () => {
      try {
        await createNotification(req.user._id, 'Report Published', `Your ${item.type} item report for "${item.itemName}" is now live!`, 'report_approved', item._id);
        const admins = await User.find({ userType: 'admin' }).select('_id');
        for (const admin of admins) {
          await createNotification(admin._id, 'New Report Live', `A new ${item.type} item "${item.itemName}" was posted.`, 'general', item._id);
        }
      } catch (err) {
        console.error('Background notification error:', err);
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getItems = async (req, res) => {
  try {
    const { type, category, location, search, page = 1, limit = 10, sort } = req.query;
    let query = { status: 'approved' };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (location) query.location = location;
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let sortOpt = { createdAt: -1 };
    if (sort === 'oldest') sortOpt = { createdAt: 1 };
    if (sort === 'date_desc') sortOpt = { date: -1 };
    if (sort === 'date_asc') sortOpt = { date: 1 };
    if (search) {
      sortOpt = { score: { $meta: "textScore" } };
    }

    const items = await Item.find(query)
      .sort(sortOpt)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reporter', 'name department year'); // no contact info
    
    const total = await Item.countDocuments(query);

    res.status(200).json({ success: true, count: items.length, total, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('reporter', 'name department year email phone');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    
    let isOwner = false;
    let isAdmin = false;
    let isClaimant = false;
    
    if (req.user) {
      if (item.reporter._id.toString() === req.user._id.toString()) isOwner = true;
      if (req.user.userType === 'admin') isAdmin = true;
      if (!isOwner && !isAdmin) {
        isClaimant = Boolean(await Claim.exists({
          itemId: item._id,
          claimantId: req.user._id,
          status: { $in: ['pending', 'approved'] }
        }));
      }
    }

    const itemObj = item.toObject();
    if (!isOwner && !isAdmin && !isClaimant && itemObj.status !== 'approved') {
       return res.status(403).json({ success: false, message: 'Cannot access this item' });
    }

    if (!isOwner && !isAdmin && !isClaimant) {
       delete itemObj.reporter.email;
       delete itemObj.reporter.phone;
    }
    
    res.status(200).json({ success: true, data: itemObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (item.reporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (item.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending items can be updated' });
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (item.reporter.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await item.deleteOne();
    res.status(200).json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ reporter: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMatchingItems = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (item.reporter.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const targetType = item.type === 'lost' ? 'found' : 'lost';
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const minDate = new Date(item.date.getTime() - thirtyDays);
    const maxDate = new Date(item.date.getTime() + thirtyDays);

    const matches = await Item.find({
      _id: { $ne: item._id },
      type: targetType,
      category: item.category,
      status: { $in: ['approved'] },
      date: { $gte: minDate, $lte: maxDate }
    }).populate('reporter', 'name');

    // basic location text match filter
    const itemLocationWords = item.location.toLowerCase().split(/\W+/);
    const filteredMatches = matches.filter(match => {
      const matchLocationWords = match.location.toLowerCase().split(/\W+/);
      return itemLocationWords.some(word => word.length > 3 && matchLocationWords.includes(word));
    });

    res.status(200).json({ success: true, data: filteredMatches.length > 0 ? filteredMatches : matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const adminGetItems = async (req, res) => {
  try {
    const query = {};
    if (['pending', 'approved', 'lost', 'found', 'claim_requested', 'claim_approved', 'returned', 'closed', 'rejected'].includes(req.query.status)) {
      query.status = req.query.status;
    }
    if (['lost', 'found'].includes(req.query.type)) query.type = req.query.type;
    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const itemsQuery = Item.find(query).sort('-createdAt').populate('reporter', 'name email phone studentId facultyId department');
    if (Number.isInteger(parsedLimit) && parsedLimit > 0) itemsQuery.limit(parsedLimit);
    const items = await itemsQuery;
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const adminUpdateItemStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const item = await Item.findById(req.params.id);
    
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    
    item.status = status;
    if (adminNote) item.adminNote = adminNote;
    await item.save();

    createNotification(item.reporter, 'Status Updated', `Your report for ${item.itemName} status updated to ${status}.`, 'report_approved', item._id);

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createItem, getItems, getItemById, updateItem, deleteItem, getMyItems, getMatchingItems, adminGetItems, adminUpdateItemStatus
};
