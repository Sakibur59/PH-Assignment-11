// server/routes/stripe.js
const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

// Create checkout session (Dummy payment for now)
router.post('/', async (req, res) => {
  try {
    const { credits, amount, packageId } = req.body;
    const userId = req.user.id;

    if (!credits || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Credits and amount are required'
      });
    }

    // For now, just process the payment directly (dummy payment)
    const db = getDB();
    
    // Update user credits
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $inc: { credits: parseInt(credits) } },
      { returnDocument: 'after' }
    );

    // Add to payments
    await db.collection('payments').insertOne({
      userId: userId,
      type: 'purchase',
      credits: parseInt(credits),
      amount: amount / 100, // Convert cents to dollars
      date: new Date(),
      status: 'completed',
      packageId: packageId
    });

    res.json({
      success: true,
      newCredits: result.value.credits,
      message: `Successfully purchased ${credits} credits`
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;