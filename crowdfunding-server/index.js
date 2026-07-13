// server/index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB, getDB } = require("./db");
const { auth } = require("./auth");
const { toNodeHandler } = require("better-auth/node");
const { ObjectId } = require("mongodb");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON middleware
app.use(express.json());

// Better Auth handler - auth routes
app.all("/api/auth/*splat", toNodeHandler(auth));

// Auth middleware - protected routes এর জন্য
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    const session = await auth.api.getSession({
      headers: {
        authorization: `Bearer ${token}`
      }
    });
    
    if (!session) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = session.user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

// ===================== API Routes =====================

// 1. Get user credits
app.get('/api/user/credits', authMiddleware, async (req, res) => {
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

// 2. Purchase credits (dummy payment)
app.post('/api/credits/purchase', authMiddleware, async (req, res) => {
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
      newCredits: result.value.credits || 0,
      message: `Successfully purchased ${credits} credits`
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Create checkout session
app.post('/api/create-checkout-session', authMiddleware, async (req, res) => {
  try {
    const { credits, amount, packageId } = req.body;
    const userId = req.user.id;

    if (!credits || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Credits and amount are required'
      });
    }

    const db = getDB();
    
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $inc: { credits: parseInt(credits) } },
      { returnDocument: 'after' }
    );

    await db.collection('payments').insertOne({
      userId: userId,
      type: 'purchase',
      credits: parseInt(credits),
      amount: amount / 100,
      date: new Date(),
      status: 'completed',
      packageId: packageId
    });

    res.json({
      success: true,
      newCredits: result.value.credits || 0,
      message: `Successfully purchased ${credits} credits`
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Get supporter dashboard
app.get('/api/supporter/dashboard', authMiddleware, async (req, res) => {
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

// 5. Get supporter contributions
app.get('/api/supporter/contributions', authMiddleware, async (req, res) => {
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

// 6. Get supporter payment history
app.get('/api/supporter/payments', authMiddleware, async (req, res) => {
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

// 7. Get approved campaigns
app.get('/api/campaigns/approved', authMiddleware, async (req, res) => {
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

// 8. Get single campaign details
app.get('/api/campaigns/:id', authMiddleware, async (req, res) => {
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

// 9. Contribute to campaign
app.post('/api/campaigns/contribute', authMiddleware, async (req, res) => {
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

// Test route
app.get("/", (req, res) => {
  res.send("Crowdfunding server running");
});

const PORT = process.env.PORT || 5000;

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});