// server/routes/credits.js
const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

// Purchase credits (dummy payment)
router.post('/credits/purchase', async (req, res) => {
  try {
    const db = getDB();
    const { credits, amount } = req.body;
    const userId = req.user.id;

    if (!credits || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Credits and amount are required'
      });
    }

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $inc: { credits: parseInt(credits) } },
      { returnDocument: 'after' }
    );

    await db.collection('payments').insertOne({
      userId: userId,
      type: 'purchase',
      credits: parseInt(credits),
      amount: amount,
      date: new Date(),
      status: 'completed'
    });

    res.json({
      success: true,
      newCredits: result.value.credits || credits,
      message: `Successfully purchased ${credits} credits`
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user credits
router.get('/user/credits', async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.id;

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { credits: 1 } }
    );

    res.json({
      success: true,
      credits: user?.credits || 0
    });
  } catch (error) {
    console.error('Get credits error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;