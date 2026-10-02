const Notification = require('../models/Notification');

const createNotification = async (userId, title, message, type, relatedItemId = null) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      relatedItemId
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = { createNotification };
