// server/routes/supporter.js
const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

// Get supporter dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();

    const contributions = await db.collection('contributions')
      .find({ supporterId: userId })
      .toArray();

    const approvedContributions = contributions.filter(c => c.status === 'approved');
    const pendingContributions = contributions.filter(c => c.status === 'pending');

    const stats = {
      totalContributions: contributions.length,
      pendingContributions: pendingContributions.length,
      totalAmount: approvedContributions.reduce((sum, c) => sum + (c.amount || 0), 0)
    };

    const approvedWithDetails = await Promise.all(approvedContributions.map(async (c) => {
      try {
        const campaign = await db.collection('campaigns')
          .findOne({ _id: new ObjectId(c.campaignId) });
        return {
          ...c,
          campaignTitle: campaign ? campaign.title : 'Unknown Campaign',
          creatorName: campaign ? campaign.creatorName : 'Unknown'
        };
      } catch (err) {
        return { ...c, campaignTitle: 'Unknown Campaign', creatorName: 'Unknown' };
      }
    }));

    res.json({
      success: true,
      stats,
      approvedContributions: approvedWithDetails
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's contributions
router.get('/contributions', async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();

    const contributions = await db.collection('contributions')
      .find({ supporterId: userId })
      .sort({ date: -1 })
      .toArray();

    const contributionsWithDetails = await Promise.all(contributions.map(async (c) => {
      try {
        const campaign = await db.collection('campaigns')
          .findOne({ _id: new ObjectId(c.campaignId) });
        return {
          ...c,
          campaignTitle: campaign ? campaign.title : 'Unknown Campaign',
          creatorName: campaign ? campaign.creatorName : 'Unknown'
        };
      } catch (err) {
        return { ...c, campaignTitle: 'Unknown Campaign', creatorName: 'Unknown' };
      }
    }));

    res.json({
      success: true,
      contributions: contributionsWithDetails
    });
  } catch (error) {
    console.error('Contributions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's payment history
router.get('/payments', async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();

    const payments = await db.collection('payments')
      .find({ userId: userId })
      .sort({ date: -1 })
      .toArray();

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Payments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;