const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');


router.get('/approved', async (req, res) => {
  try {
    const db = getDB();
    
    const campaigns = await db.collection('campaigns')
      .find({ 
        status: 'approved',
        deadline: { $gt: new Date() }
      })
      .sort({ createdAt: -1 })
      .toArray();

    const campaignsWithDetails = await Promise.all(campaigns.map(async (campaign) => {
      try {
        const contributions = await db.collection('contributions')
          .find({ 
            campaignId: campaign._id.toString(),
            status: 'approved'
          })
          .toArray();
        
        return {
          ...campaign,
          contributors: contributions.length,
          raised: contributions.reduce((sum, c) => sum + (c.amount || 0), 0)
        };
      } catch (err) {
        return {
          ...campaign,
          contributors: 0,
          raised: 0
        };
      }
    }));

    res.json({
      success: true,
      campaigns: campaignsWithDetails
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single campaign details
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const campaignId = req.params.id;

    const campaign = await db.collection('campaigns')
      .findOne({ _id: new ObjectId(campaignId) });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const contributions = await db.collection('contributions')
      .find({ 
        campaignId: campaignId,
        status: 'approved'
      })
      .toArray();

    const campaignWithDetails = {
      ...campaign,
      contributors: contributions.length,
      raised: contributions.reduce((sum, c) => sum + (c.amount || 0), 0)
    };

    res.json({
      success: true,
      campaign: campaignWithDetails
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Contribute to campaign
router.post('/contribute', async (req, res) => {
  try {
    const db = getDB();
    const { campaignId, amount } = req.body;
    const userId = req.user.id;

    if (!campaignId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Campaign ID and amount are required'
      });
    }

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if ((user.credits || 0) < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient credits. Please purchase more credits.'
      });
    }

    const campaign = await db.collection('campaigns').findOne(
      { _id: new ObjectId(campaignId) }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (new Date(campaign.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Campaign deadline has passed'
      });
    }

    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { credits: -amount } }
    );

    const contribution = {
      campaignId: campaignId,
      campaignTitle: campaign.title,
      supporterId: userId,
      supporterName: user.name,
      supporterEmail: user.email,
      creatorName: campaign.creatorName || 'Unknown',
      creatorEmail: campaign.creatorEmail || '',
      amount: amount,
      date: new Date(),
      status: 'pending'
    };

    const result = await db.collection('contributions').insertOne(contribution);

    await db.collection('payments').insertOne({
      userId: userId,
      type: 'contribution',
      credits: -amount,
      amount: amount,
      campaignId: campaignId,
      campaignTitle: campaign.title,
      date: new Date(),
      status: 'pending'
    });

    res.json({
      success: true,
      message: 'Contribution submitted successfully',
      contributionId: result.insertedId
    });
  } catch (error) {
    console.error('Contribute error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;