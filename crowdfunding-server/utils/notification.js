const { getDB } = require('../db');

const createNotification = async (data) => {
  try {
    const db = getDB();
    const notification = {
      message: data.message,
      toEmail: data.toEmail,
      actionRoute: data.actionRoute || '/dashboard',
      time: new Date(),
      read: false,
      type: data.type || 'info', // 'success', 'error', 'info', 'warning'
      metadata: data.metadata || {}
    };

    const result = await db.collection('notifications').insertOne(notification);
    return result;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

module.exports = { createNotification };