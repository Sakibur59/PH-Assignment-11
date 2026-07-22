const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB, getDB } = require("./db");
const { auth } = require("./auth");
const { toNodeHandler } = require("better-auth/node");
const { ObjectId } = require("mongodb");

const { createNotification } = require("./utils/notification");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// JSON middleware
app.use(express.json());

// Better Auth handler - auth routes
app.all("/api/auth/*splat", toNodeHandler(auth));

// Auth middleware -
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const session = await auth.api.getSession({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (!session) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    req.user = session.user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Authentication failed" });
  }
};

// ===================== API Routes =====================

// 1. Get user credits
app.get("/api/user/credits", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.id;
    const userEmail = req.user.email;
    let user = await db.collection("user").findOne({ _id: userId });

    if (!user) {
      console.log("User not found by ID, trying by email...");
      user = await db.collection("user").findOne({ email: userEmail });
    }

    if (!user) {
      console.log("User not found!");
      return res.json({
        success: true,
        credits: 0,
      });
    }

    res.json({
      success: true,
      credits: user?.credits || 0,
    });
  } catch (error) {
    console.error("Get credits error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Purchase credits (dummy payment)
app.post("/api/credits/purchase", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const { credits, amount } = req.body;
    const userId = req.user.id;

    if (!credits || !amount) {
      return res.status(400).json({
        success: false,
        message: "Credits and amount are required",
      });
    }

    const user = await db.collection("user").findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update using userId directly
    const result = await db
      .collection("user")
      .findOneAndUpdate(
        { _id: userId },
        { $inc: { credits: parseInt(credits) } },
        { returnDocument: "after" },
      );

    await db.collection("payments").insertOne({
      userId: userId,
      type: "purchase",
      credits: parseInt(credits),
      amount: amount,
      date: new Date(),
      status: "completed",
    });

    res.json({
      success: true,
      newCredits: result?.value?.credits || 0,
      message: `Successfully purchased ${credits} credits`,
    });
  } catch (error) {
    console.error("Purchase error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Create checkout session
app.post("/api/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    const { credits, amount, packageId } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;
    const db = getDB();

    if (!credits || !amount) {
      return res.status(400).json({
        success: false,
        message: "Credits and amount are required",
      });
    }
    let user = await db.collection("user").findOne({ _id: userId });

    if (!user) {
      console.log("User not found by ID, trying by email...");
      user = await db.collection("user").findOne({ email: userEmail });
    }

    if (!user) {
      // If user doesn't exist, create one
      console.log("User not found, creating new user...");
      const newUser = {
        _id: userId,
        name: req.user.name,
        email: userEmail,
        emailVerified: req.user.emailVerified || false,
        image: req.user.image || "",
        createdAt: new Date(),
        updatedAt: new Date(),
        role: req.user.role || "supporter",
        credits: 50, // Starting credits
      };

      await db.collection("user").insertOne(newUser);
      user = newUser;
      console.log("New user created with credits: 50");
    }
    const updateResult = await db
      .collection("user")
      .updateOne({ _id: user._id }, { $inc: { credits: parseInt(credits) } });

    console.log("Update result:", updateResult);

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found during update",
      });
    }
    const updatedUser = await db.collection("user").findOne({
      _id: user._id,
    });

    console.log("Updated credits:", updatedUser?.credits || 0);

    await db.collection("payments").insertOne({
      userId: user._id,
      type: "purchase",
      credits: parseInt(credits),
      amount: amount / 100,
      date: new Date(),
      status: "completed",
      packageId: packageId,
    });

    res.json({
      success: true,
      newCredits: updatedUser?.credits || 0,
      message: `Successfully purchased ${credits} credits`,
    });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// 7. Get approved campaigns
app.get("/api/campaigns/approved", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const { search, category } = req.query;

    console.log("=== GET APPROVED CAMPAIGNS ===");
    console.log("Search:", search);
    console.log("Category:", category);

    // Build query
    const query = {
      status: "approved",
      deadline: { $gt: new Date() },
    };

    // Add category filter
    if (category && category !== "all") {
      query.category = category;
    }

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { story: { $regex: search, $options: "i" } },
        { creatorName: { $regex: search, $options: "i" } },
      ];
    }

    const campaigns = await db
      .collection("campaigns")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    console.log("Campaigns found:", campaigns.length);

    const campaignsWithDetails = await Promise.all(
      campaigns.map(async (campaign) => {
        try {
          const contributions = await db
            .collection("contributions")
            .find({
              campaignId: campaign._id.toString(),
              status: "approved",
            })
            .toArray();

          return {
            ...campaign,
            contributors: contributions.length,
            raised: contributions.reduce((sum, c) => sum + (c.amount || 0), 0),
          };
        } catch (err) {
          return {
            ...campaign,
            contributors: 0,
            raised: 0,
          };
        }
      }),
    );

    res.json({
      success: true,
      campaigns: campaignsWithDetails,
    });
  } catch (error) {
    console.error("Get campaigns error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// 8. Get single campaign details
app.get("/api/campaigns/:id", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const campaignId = req.params.id;

    const campaign = await db
      .collection("campaigns")
      .findOne({ _id: new ObjectId(campaignId) });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    const contributions = await db
      .collection("contributions")
      .find({
        campaignId: campaignId,
        status: "approved",
      })
      .toArray();

    const campaignWithDetails = {
      ...campaign,
      contributors: contributions.length,
      raised: contributions.reduce((sum, c) => sum + (c.amount || 0), 0),
    };

    res.json({
      success: true,
      campaign: campaignWithDetails,
    });
  } catch (error) {
    console.error("Get campaign error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// Creator Dashboard
app.get("/api/creator/dashboard", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();

    console.log('=== CREATOR DASHBOARD ===');
    console.log('User ID:', userId);

    // Convert userId to ObjectId
    const userObjectId = new ObjectId(userId);
    
    // Get campaigns
    const campaigns = await db
      .collection("campaigns")
      .find({ creatorId: userId })
      .toArray();

    console.log('Campaigns found:', campaigns.length);

    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(
      (c) => new Date(c.deadline) > new Date()
    ).length;

    // Calculate total raised
    let totalRaised = 0;
    for (const campaign of campaigns) {
      const contributions = await db
        .collection("contributions")
        .find({
          campaignId: campaign._id.toString(),
          status: "approved",
        })
        .toArray();
      totalRaised += contributions.reduce((sum, c) => sum + (c.amount || 0), 0);
    }

    // Get pending contributions
    const pendingContributions = [];
    for (const campaign of campaigns) {
      const contributions = await db
        .collection("contributions")
        .find({
          campaignId: campaign._id.toString(),
          status: "pending",
        })
        .toArray();
      pendingContributions.push(
        ...contributions.map((c) => ({
          ...c,
          campaignTitle: campaign.title,
        }))
      );
    }

    console.log('Total raised:', totalRaised);
    console.log('Pending contributions:', pendingContributions.length);

    res.json({
      success: true,
      stats: {
        totalCampaigns,
        activeCampaigns,
        totalRaised,
      },
      pendingContributions,
    });
  } catch (error) {
    console.error("Creator dashboard error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// 9. Contribute to campaign
app.post("/api/campaigns/contribute", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const { campaignId, amount } = req.body;
    const userId = req.user.id;

    console.log('=== CONTRIBUTE ===');
    console.log('User ID:', userId);
    console.log('Campaign ID:', campaignId);
    console.log('Amount:', amount);

    if (!campaignId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Campaign ID and amount are required",
      });
    }

    // ★★★ Convert userId to ObjectId ★★★
    const userObjectId = new ObjectId(userId);
    const user = await db.collection("user").findOne({ _id: userObjectId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log('User found:', user.name);
    console.log('User credits:', user.credits || 0);

    if ((user.credits || 0) < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient credits",
      });
    }

    const campaign = await db.collection("campaigns").findOne({ _id: new ObjectId(campaignId) });
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    if (new Date(campaign.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Campaign deadline has passed",
      });
    }

    // Deduct credits - use ObjectId
    await db.collection("user").updateOne(
      { _id: userObjectId },
      { $inc: { credits: -amount } }
    );

    // Create contribution
    const contribution = {
      campaignId: campaignId,
      campaignTitle: campaign.title,
      supporterId: userId,
      supporterName: user.name,
      supporterEmail: user.email,
      creatorName: campaign.creatorName || "Unknown",
      creatorEmail: campaign.creatorEmail || "",
      amount: amount,
      date: new Date(),
      status: "pending",
    };

    const result = await db.collection("contributions").insertOne(contribution);
    const contributionId = result.insertedId.toString();

    // Create payment
    await db.collection("payments").insertOne({
      userId: userId,
      type: "contribution",
      credits: -amount,
      amount: amount,
      campaignId: campaignId,
      campaignTitle: campaign.title,
      date: new Date(),
      status: "pending",
      contributionId: contributionId,
    });

    // ★★★ CREATE NOTIFICATION FOR CREATOR ★★★
    await createNotification({
      message: `💰 New contribution of $${amount} from ${user.name} to "${campaign.title}"`,
      toEmail: campaign.creatorEmail,
      actionRoute: `/dashboard/creator/dashboard`,
      type: "info",
      metadata: {
        contributionId: contributionId,
        campaignId: campaignId,
        amount: amount,
        supporterId: userId,
        supporterName: user.name,
      },
    });

    // ★★★ CREATE NOTIFICATION FOR SUPPORTER (self) ★★★
    await createNotification({
      message: `💰 You contributed $${amount} to "${campaign.title}". Waiting for creator approval.`,
      toEmail: user.email,
      actionRoute: `/dashboard/supporter/contributions`,
      type: "info",
      metadata: {
        contributionId: contributionId,
        campaignId: campaignId,
        amount: amount,
      },
    });

    console.log('Contribution successful!');

    res.json({
      success: true,
      message: "Contribution submitted successfully",
      contributionId: contributionId,
    });
  } catch (error) {
    console.error("Contribute error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// 10. Get creator dashboard data
app.post(
  "/api/creator/contribution/approve",
  authMiddleware,
  async (req, res) => {
    try {
      const { contributionId } = req.body;
      const db = getDB();

      if (!contributionId) {
        return res
          .status(400)
          .json({ success: false, message: "Contribution ID required" });
      }

      const contribution = await db
        .collection("contributions")
        .findOne({ _id: new ObjectId(contributionId) });

      if (!contribution) {
        return res
          .status(404)
          .json({ success: false, message: "Contribution not found" });
      }

      // Update contribution
      await db
        .collection("contributions")
        .updateOne(
          { _id: new ObjectId(contributionId) },
          { $set: { status: "approved" } },
        );

      // Update campaign raised
      await db
        .collection("campaigns")
        .updateOne(
          { _id: new ObjectId(contribution.campaignId) },
          { $inc: { raised: contribution.amount } },
        );

      // Update payment
      await db
        .collection("payments")
        .updateOne(
          { contributionId: contributionId, type: "contribution" },
          { $set: { status: "completed" } },
        );

      // ★★★ CREATE NOTIFICATION FOR SUPPORTER ★★★
      await createNotification({
        message: `✅ Your Contribution of $${contribution.amount} to "${contribution.campaignTitle}" was approved by ${contribution.creatorName}`,
        toEmail: contribution.supporterEmail,
        actionRoute: `/dashboard/supporter/contributions`,
        type: "success",
        metadata: {
          contributionId: contributionId,
          campaignId: contribution.campaignId,
          amount: contribution.amount,
        },
      });

      // ★★★ CREATE NOTIFICATION FOR CREATOR (self) ★★★
      await createNotification({
        message: `✅ You approved a contribution of $${contribution.amount} from ${contribution.supporterName} for "${contribution.campaignTitle}"`,
        toEmail: contribution.creatorEmail,
        actionRoute: `/dashboard/creator`,
        type: "success",
        metadata: {
          contributionId: contributionId,
          campaignId: contribution.campaignId,
          amount: contribution.amount,
        },
      });

      res.json({
        success: true,
        message: "Contribution approved successfully",
      });
    } catch (error) {
      console.error("Approve contribution error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// 11. Approve contribution
app.post(
  "/api/creator/contribution/reject",
  authMiddleware,
  async (req, res) => {
    try {
      const { contributionId } = req.body;
      const db = getDB();

      if (!contributionId) {
        return res
          .status(400)
          .json({ success: false, message: "Contribution ID required" });
      }

      const contribution = await db
        .collection("contributions")
        .findOne({ _id: new ObjectId(contributionId) });

      if (!contribution) {
        return res
          .status(404)
          .json({ success: false, message: "Contribution not found" });
      }

      // Update contribution
      await db
        .collection("contributions")
        .updateOne(
          { _id: new ObjectId(contributionId) },
          { $set: { status: "rejected" } },
        );

      // Refund credits
      await db
        .collection("user")
        .updateOne(
          { _id: contribution.supporterId },
          { $inc: { credits: contribution.amount } },
        );

      // Update payment
      await db
        .collection("payments")
        .updateOne(
          { contributionId: contributionId, type: "contribution" },
          { $set: { status: "rejected" } },
        );

      // ★★★ CREATE NOTIFICATION FOR SUPPORTER ★★★
      await createNotification({
        message: `❌ Your Contribution of $${contribution.amount} to "${contribution.campaignTitle}" was rejected by ${contribution.creatorName}. Credits have been refunded.`,
        toEmail: contribution.supporterEmail,
        actionRoute: `/dashboard/supporter/contributions`,
        type: "error",
        metadata: {
          contributionId: contributionId,
          campaignId: contribution.campaignId,
          amount: contribution.amount,
        },
      });

      // ★★★ CREATE NOTIFICATION FOR CREATOR (self) ★★★
      await createNotification({
        message: `❌ You rejected a contribution of $${contribution.amount} from ${contribution.supporterName} for "${contribution.campaignTitle}"`,
        toEmail: contribution.creatorEmail,
        actionRoute: `/dashboard/creator`,
        type: "warning",
        metadata: {
          contributionId: contributionId,
          campaignId: contribution.campaignId,
          amount: contribution.amount,
        },
      });

      res.json({
        success: true,
        message: "Contribution rejected and credits refunded",
      });
    } catch (error) {
      console.error("Reject contribution error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// 12. Reject contribution
app.post(
  "/api/creator/contribution/reject",
  authMiddleware,
  async (req, res) => {
    try {
      const { contributionId } = req.body;
      const db = getDB();

      if (!contributionId) {
        return res
          .status(400)
          .json({ success: false, message: "Contribution ID required" });
      }

      const contribution = await db
        .collection("contributions")
        .findOne({ _id: new ObjectId(contributionId) });

      if (!contribution) {
        return res
          .status(404)
          .json({ success: false, message: "Contribution not found" });
      }

      console.log("=== REJECT CONTRIBUTION ===");
      console.log("Contribution ID:", contributionId);

      // Update contribution status
      await db
        .collection("contributions")
        .updateOne(
          { _id: new ObjectId(contributionId) },
          { $set: { status: "rejected" } },
        );

      // Refund credits to supporter
      await db
        .collection("user")
        .updateOne(
          { _id: new ObjectId(contribution.supporterId) },
          { $inc: { credits: contribution.amount } },
        );

      // ★★★ Update payment by contributionId ★★★
      const paymentUpdate = await db.collection("payments").updateOne(
        {
          contributionId: contributionId,
          type: "contribution",
        },
        { $set: { status: "rejected" } },
      );

      console.log("Payment update result:", paymentUpdate);

      // If no payment found, create one
      if (paymentUpdate.matchedCount === 0) {
        console.log("No payment found, creating new...");
        await db.collection("payments").insertOne({
          userId: contribution.supporterId,
          type: "contribution",
          credits: -contribution.amount,
          amount: contribution.amount,
          campaignId: contribution.campaignId,
          campaignTitle: contribution.campaignTitle,
          date: new Date(),
          status: "rejected",
          contributionId: contributionId,
        });
      }

      res.json({
        success: true,
        message: "Contribution rejected and credits refunded",
      });
    } catch (error) {
      console.error("Reject contribution error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// 13. Add new campaign
app.post("/api/creator/campaign", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      story,
      category,
      goal,
      minContribution,
      deadline,
      rewardInfo,
      imageUrl,
    } = req.body;

    const userId = req.user.id;
    const db = getDB();

    if (
      !title ||
      !story ||
      !category ||
      !goal ||
      !minContribution ||
      !deadline
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const campaign = {
      title,
      story,
      category,
      goal: parseFloat(goal),
      minContribution: parseFloat(minContribution),
      deadline: new Date(deadline),
      rewardInfo: rewardInfo || "",
      imageUrl: imageUrl || "",
      creatorId: userId,
      creatorName: req.user.name,
      creatorEmail: req.user.email,
      status: "pending",
      raised: 0,
      createdAt: new Date(),
    };

    const result = await db.collection("campaigns").insertOne(campaign);

    res.json({
      success: true,
      message: "Campaign created successfully. Waiting for admin approval.",
      campaignId: result.insertedId,
    });
  } catch (error) {
    console.error("Add campaign error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 14. Get creator's campaigns
app.get("/api/creator/campaigns", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();

    const campaigns = await db
      .collection("campaigns")
      .find({ creatorId: userId })
      .sort({ deadline: -1 })
      .toArray();

    // Get raised amount for each campaign
    const campaignsWithRaised = await Promise.all(
      campaigns.map(async (campaign) => {
        const contributions = await db
          .collection("contributions")
          .find({
            campaignId: campaign._id.toString(),
            status: "approved",
          })
          .toArray();
        return {
          ...campaign,
          raised: contributions.reduce((sum, c) => sum + (c.amount || 0), 0),
          supporters: contributions.length,
        };
      }),
    );

    res.json({
      success: true,
      campaigns: campaignsWithRaised,
    });
  } catch (error) {
    console.error("Get creator campaigns error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 15. Update campaign
app.put("/api/creator/campaign/:id", authMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { title, story, rewardInfo } = req.body;
    const userId = req.user.id;
    const db = getDB();

    const campaign = await db.collection("campaigns").findOne({
      _id: new ObjectId(campaignId),
      creatorId: userId,
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found or unauthorized",
      });
    }

    await db.collection("campaigns").updateOne(
      { _id: new ObjectId(campaignId) },
      {
        $set: {
          title: title || campaign.title,
          story: story || campaign.story,
          rewardInfo: rewardInfo || campaign.rewardInfo,
        },
      },
    );

    res.json({
      success: true,
      message: "Campaign updated successfully",
    });
  } catch (error) {
    console.error("Update campaign error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 16. Delete campaign
app.delete("/api/creator/campaign/:id", authMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const userId = req.user.id;
    const db = getDB();

    const campaign = await db.collection("campaigns").findOne({
      _id: new ObjectId(campaignId),
      creatorId: userId,
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found or unauthorized",
      });
    }

    // Get all approved contributions for this campaign
    const contributions = await db
      .collection("contributions")
      .find({
        campaignId: campaignId,
        status: "approved",
      })
      .toArray();

    // Refund all supporters
    for (const contribution of contributions) {
      await db
        .collection("user")
        .updateOne(
          { _id: new ObjectId(contribution.supporterId) },
          { $inc: { credits: contribution.amount } },
        );
    }

    // Delete campaign
    await db
      .collection("campaigns")
      .deleteOne({ _id: new ObjectId(campaignId) });

    // Delete all contributions for this campaign
    await db.collection("contributions").deleteMany({ campaignId: campaignId });

    res.json({
      success: true,
      message: "Campaign deleted and all supporters refunded",
    });
  } catch (error) {
    console.error("Delete campaign error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 17. Create withdrawal request
app.post("/api/creator/withdraw", authMiddleware, async (req, res) => {
  try {
    const { creditsToWithdraw, paymentSystem, accountNumber } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;
    const db = getDB();

    if (!creditsToWithdraw || !paymentSystem || !accountNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Find user
    let user = await db.collection("user").findOne({ _id: userId });
    if (!user) {
      user = await db.collection("user").findOne({ email: userEmail });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const campaigns = await db
      .collection("campaigns")
      .find({ creatorId: userId })
      .toArray();

    let totalRaised = 0;
    for (const campaign of campaigns) {
      const contributions = await db
        .collection("contributions")
        .find({
          campaignId: campaign._id.toString(),
          status: "approved",
        })
        .toArray();
      totalRaised += contributions.reduce((sum, c) => sum + (c.amount || 0), 0);
    }

    if (totalRaised < 200) {
      return res.status(400).json({
        success: false,
        message: "Minimum 200 credits required for withdrawal",
      });
    }

    if (parseFloat(creditsToWithdraw) > totalRaised) {
      return res.status(400).json({
        success: false,
        message: `Insufficient credits. Available: ${totalRaised} credits`,
      });
    }

    const pendingWithdrawals = await db
      .collection("withdrawals")
      .find({
        creatorId: userId,
        status: "pending",
      })
      .toArray();

    const pendingCredits = pendingWithdrawals.reduce(
      (sum, w) => sum + w.withdrawalCredits,
      0,
    );

    if (pendingCredits + parseFloat(creditsToWithdraw) > totalRaised) {
      return res.status(400).json({
        success: false,
        message: `You already have ${pendingCredits} credits pending. Available: ${totalRaised}`,
      });
    }

    const withdrawAmount = parseFloat(creditsToWithdraw) / 20;

    const withdrawal = {
      creatorId: userId,
      creatorName: user.name,
      creatorEmail: user.email,
      withdrawalCredits: parseFloat(creditsToWithdraw),
      withdrawalAmount: withdrawAmount,
      paymentSystem,
      accountNumber,
      date: new Date(),
      status: "pending",
    };

    await db.collection("withdrawals").insertOne(withdrawal);

    console.log(
      "Withdrawal request saved. Pending:",
      pendingCredits + parseFloat(creditsToWithdraw),
    );

    res.json({
      success: true,
      message: `Withdrawal request submitted. Pending: ${pendingCredits + parseFloat(creditsToWithdraw)} credits`,
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// 18. Get creator's withdrawal history
app.get("/api/creator/withdrawals", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();

    const withdrawals = await db
      .collection("withdrawals")
      .find({ creatorId: userId })
      .sort({ date: -1 })
      .toArray();

    res.json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    console.error("Get withdrawals error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user profile
app.put("/api/user/profile", authMiddleware, async (req, res) => {
  try {
    const { name, image } = req.body;
    const db = getDB();

    console.log("Updating profile for user:", req.user.email);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }
    let user = await db.collection("user").findOne({
      email: req.user.email,
    });
    if (!user) {
      user = await db.collection("user").findOne({
        _id: req.user.id,
      });
    }
    if (!user) {
      try {
        const objectId = new ObjectId(req.user.id);
        user = await db.collection("user").findOne({
          _id: objectId,
        });
      } catch (err) {
        console.log("ObjectId conversion failed");
      }
    }

    if (!user) {
      const newUser = {
        _id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        emailVerified: req.user.emailVerified || false,
        image: req.user.image || "",
        createdAt: new Date(),
        updatedAt: new Date(),
        role: req.user.role || "supporter",
        credits: req.user.credits || 50,
      };

      await db.collection("user").insertOne(newUser);
      user = newUser;
      console.log("Created new user in DB:", user);
    }

    const updateData = {
      name: name,
      updatedAt: new Date(),
    };

    if (image) {
      updateData.image = image;
    }

    const result = await db
      .collection("user")
      .updateOne({ _id: user._id }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found during update",
      });
    }

    const updatedUser = await db.collection("user").findOne({ _id: user._id });

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/supporter/dashboard", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();

    console.log("Fetching supporter dashboard for user:", userId);

    // Get all contributions by this user
    const contributions = await db
      .collection("contributions")
      .find({ supporterId: userId })
      .toArray();

    console.log("Found contributions:", contributions.length);

    const approvedContributions = contributions.filter(
      (c) => c.status === "approved",
    );
    const pendingContributions = contributions.filter(
      (c) => c.status === "pending",
    );

    const stats = {
      totalContributions: contributions.length,
      pendingContributions: pendingContributions.length,
      totalAmount: approvedContributions.reduce(
        (sum, c) => sum + (c.amount || 0),
        0,
      ),
    };

    // Get campaign details for approved contributions
    const approvedWithDetails = await Promise.all(
      approvedContributions.map(async (c) => {
        try {
          const campaign = await db
            .collection("campaigns")
            .findOne({ _id: new ObjectId(c.campaignId) });
          return {
            ...c,
            campaignTitle: campaign ? campaign.title : "Unknown Campaign",
            creatorName: campaign ? campaign.creatorName : "Unknown",
          };
        } catch (err) {
          return {
            ...c,
            campaignTitle: "Unknown Campaign",
            creatorName: "Unknown",
          };
        }
      }),
    );

    res.json({
      success: true,
      stats,
      approvedContributions: approvedWithDetails,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get supporter contributions - FIXED
app.get("/api/supporter/contributions", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();

    const contributions = await db
      .collection("contributions")
      .find({ supporterId: userId })
      .sort({ date: -1 })
      .toArray();

    const contributionsWithDetails = await Promise.all(
      contributions.map(async (c) => {
        try {
          const campaign = await db
            .collection("campaigns")
            .findOne({ _id: new ObjectId(c.campaignId) });
          return {
            ...c,
            campaignTitle: campaign ? campaign.title : "Unknown Campaign",
            creatorName: campaign ? campaign.creatorName : "Unknown",
          };
        } catch (err) {
          return {
            ...c,
            campaignTitle: "Unknown Campaign",
            creatorName: "Unknown",
          };
        }
      }),
    );

    res.json({
      success: true,
      contributions: contributionsWithDetails,
    });
  } catch (error) {
    console.error("Contributions error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get supporter payment history
app.get("/api/supporter/payments", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();

    const userObjectId = new ObjectId(userId);

    const payments = await db
      .collection("payments")
      .find({
        $or: [{ userId: userId }, { userId: userObjectId }],
      })
      .sort({ date: -1 })
      .toArray();

    const contributions = await db
      .collection("contributions")
      .find({
        $or: [{ supporterId: userId }, { supporterId: userObjectId }],
      })
      .toArray();

    // Create map of contribution status
    const contributionMap = {};
    for (const c of contributions) {
      contributionMap[c._id.toString()] = c.status;
      // Also map by campaignId if needed
      if (c.campaignId) {
        contributionMap[c.campaignId] = c.status;
      }
    }

    for (const payment of payments) {
      console.log(
        `Processing payment: ${payment._id}, type: ${payment.type}, status: ${payment.status}`,
      );

      if (payment.type === "contribution") {
        if (payment.contributionId && contributionMap[payment.contributionId]) {
          const contributionStatus = contributionMap[payment.contributionId];
          let paymentStatus = contributionStatus;

          if (contributionStatus === "approved") {
            paymentStatus = "completed";
          } else if (contributionStatus === "pending") {
            paymentStatus = "pending";
          } else if (contributionStatus === "rejected") {
            paymentStatus = "rejected";
          }

          if (payment.status !== paymentStatus) {
            console.log(
              `Updating payment ${payment._id}: ${payment.status} -> ${paymentStatus}`,
            );
            await db
              .collection("payments")
              .updateOne(
                { _id: payment._id },
                { $set: { status: paymentStatus } },
              );
            payment.status = paymentStatus;
          }
        } else if (payment.campaignId && contributionMap[payment.campaignId]) {
          const contributionStatus = contributionMap[payment.campaignId];
          let paymentStatus = contributionStatus;

          if (contributionStatus === "approved") {
            paymentStatus = "completed";
          } else if (contributionStatus === "pending") {
            paymentStatus = "pending";
          } else if (contributionStatus === "rejected") {
            paymentStatus = "rejected";
          }

          if (payment.status !== paymentStatus) {
            console.log(
              `Updating payment ${payment._id} (by campaign): ${payment.status} -> ${paymentStatus}`,
            );
            await db
              .collection("payments")
              .updateOne(
                { _id: payment._id },
                { $set: { status: paymentStatus } },
              );
            payment.status = paymentStatus;
          }
        }
      }
      if (payment.type === "purchase") {
        if (payment.status !== "completed") {
          console.log(
            `Fixing purchase payment ${payment._id}: ${payment.status} -> completed`,
          );
          await db
            .collection("payments")
            .updateOne({ _id: payment._id }, { $set: { status: "completed" } });
          payment.status = "completed";
        }
      }
    }
    if (payments.length === 0 && contributions.length > 0) {
      console.log("No payments found, creating from contributions...");

      for (const c of contributions) {
        const paymentStatus = c.status === "approved" ? "completed" : c.status;

        await db.collection("payments").insertOne({
          userId: userId,
          type: "contribution",
          credits: -c.amount,
          amount: c.amount,
          campaignId: c.campaignId,
          campaignTitle: c.campaignTitle,
          date: c.date || new Date(),
          status: paymentStatus,
          contributionId: c._id.toString(),
        });
        console.log(`Created payment for contribution: ${c._id}`);
      }

      // Fetch payments again
      const newPayments = await db
        .collection("payments")
        .find({
          $or: [{ userId: userId }, { userId: userObjectId }],
        })
        .sort({ date: -1 })
        .toArray();

      return res.json({
        success: true,
        payments: newPayments,
      });
    }

    res.json({
      success: true,
      payments: payments,
    });
  } catch (error) {
    console.error("Payments error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// ===================== ADMIN DASHBOARD =====================
app.get("/api/admin/dashboard", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.id;
    const userEmail = req.user.email;

    console.log('=== ADMIN DASHBOARD ===');
    console.log('User ID:', userId);
    console.log('User Email:', userEmail);

    // Check if user is admin - try both ID and email
    let admin = await db.collection("user").findOne({ _id: userId });
    
    if (!admin) {
      console.log('Admin not found by ID, trying by email...');
      admin = await db.collection("user").findOne({ email: userEmail });
    }

    if (!admin) {
      console.log('Admin not found!');
      return res.status(403).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log('Admin found:', admin.email);
    console.log('Admin role:', admin.role);

    if (admin.role !== "admin") {
      console.log('User is not admin, role:', admin.role);
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized. Admin only." 
      });
    }

    // Get all users
    const allUsers = await db.collection("user").find({}).toArray();
    console.log('Total users:', allUsers.length);
    
    // Count supporters and creators
    const supporters = allUsers.filter(u => u.role === 'supporter');
    const creators = allUsers.filter(u => u.role === 'creator');
    
    // Calculate total credits
    const totalCredits = allUsers.reduce((sum, u) => sum + (u.credits || 0), 0);

    // Get all payments
    const payments = await db.collection("payments").find({}).toArray();
    const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Get pending campaigns
    const pendingCampaigns = await db.collection("campaigns")
      .find({ status: "pending" })
      .count();

    // Get pending withdrawals
    const pendingWithdrawals = await db.collection("withdrawals")
      .find({ status: "pending" })
      .count();

    // Get recent activity (last 10)
    const recentContributions = await db.collection("contributions")
      .find({})
      .sort({ date: -1 })
      .limit(5)
      .toArray();

    const recentWithdrawals = await db.collection("withdrawals")
      .find({})
      .sort({ date: -1 })
      .limit(5)
      .toArray();

    const recentCampaigns = await db.collection("campaigns")
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Combine recent activity
    const recentActivity = [];

    for (const c of recentContributions) {
      recentActivity.push({
        type: 'contribution',
        message: `${c.supporterName || 'Someone'} contributed $${c.amount} to "${c.campaignTitle || 'a campaign'}"`,
        time: c.date || new Date(),
        status: c.status || 'pending'
      });
    }

    for (const w of recentWithdrawals) {
      recentActivity.push({
        type: 'withdrawal',
        message: `${w.creatorName || 'Someone'} requested withdrawal of $${w.withdrawalAmount || 0}`,
        time: w.date || new Date(),
        status: w.status || 'pending'
      });
    }

    for (const c of recentCampaigns) {
      recentActivity.push({
        type: 'campaign',
        message: `${c.creatorName || 'Someone'} created campaign "${c.title || 'Untitled'}"`,
        time: c.createdAt || new Date(),
        status: c.status || 'pending'
      });
    }

    // Sort by time descending
    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));
    // Limit to 10
    const limitedActivity = recentActivity.slice(0, 10);

    console.log('Admin dashboard data fetched successfully');

    res.json({
      success: true,
      stats: {
        totalSupporters: supporters.length,
        totalCreators: creators.length,
        totalCredits: totalCredits,
        totalPayments: totalPayments.toFixed(2),
        pendingCampaigns: pendingCampaigns,
        pendingWithdrawals: pendingWithdrawals
      },
      recentActivity: limitedActivity
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// ===================== ADMIN - GET CAMPAIGNS =====================
app.get("/api/admin/campaigns", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.id;

    console.log('=== ADMIN CAMPAIGNS ===');
    console.log('User ID:', userId);

    // Check if user is admin - সরাসরি email দিয়ে খুঁজুন
    const admin = await db.collection("user").findOne({ 
      email: req.user.email 
    });

    if (!admin || admin.role !== "admin") {
      console.log('❌ Unauthorized - Not admin');
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized. Admin only." 
      });
    }

    console.log('✅ Admin found:', admin.email);

    const campaigns = await db.collection("campaigns")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`Found ${campaigns.length} campaigns`);

    res.json({ success: true, campaigns });
  } catch (error) {
    console.error("Get admin campaigns error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// ===================== ADMIN APPROVE CAMPAIGN =====================
app.post("/api/admin/campaign/approve", authMiddleware, async (req, res) => {
  try {
    const { campaignId } = req.body;
    const db = getDB();

    // Check if user is admin - email দিয়ে check
    const admin = await db.collection("user").findOne({ 
      email: req.user.email 
    });

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized. Admin only." 
      });
    }

    const campaign = await db
      .collection("campaigns")
      .findOne({ _id: new ObjectId(campaignId) });
      
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: "Campaign not found" 
      });
    }

    await db
      .collection("campaigns")
      .updateOne(
        { _id: new ObjectId(campaignId) },
        { $set: { status: "approved" } }
      );

    // Notification for creator
    await createNotification({
      message: `✅ Your campaign "${campaign.title}" has been approved by admin!`,
      toEmail: campaign.creatorEmail,
      actionRoute: `/dashboard/creator/my-campaigns`,
      type: "success",
      metadata: {
        campaignId: campaignId,
        campaignTitle: campaign.title,
      },
    });

    res.json({ success: true, message: "Campaign approved successfully" });
  } catch (error) {
    console.error("Approve campaign error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== ADMIN REJECT CAMPAIGN =====================
app.post("/api/admin/campaign/reject", authMiddleware, async (req, res) => {
  try {
    const { campaignId } = req.body;
    const db = getDB();

    const admin = await db.collection("user").findOne({ 
      email: req.user.email 
    });

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized. Admin only." 
      });
    }

    const campaign = await db
      .collection("campaigns")
      .findOne({ _id: new ObjectId(campaignId) });
      
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: "Campaign not found" 
      });
    }

    await db
      .collection("campaigns")
      .updateOne(
        { _id: new ObjectId(campaignId) },
        { $set: { status: "rejected" } }
      );

    // Notification for creator
    await createNotification({
      message: `❌ Your campaign "${campaign.title}" has been rejected by admin. Please review and resubmit.`,
      toEmail: campaign.creatorEmail,
      actionRoute: `/dashboard/creator/my-campaigns`,
      type: "error",
      metadata: {
        campaignId: campaignId,
        campaignTitle: campaign.title,
      },
    });

    res.json({ success: true, message: "Campaign rejected successfully" });
  } catch (error) {
    console.error("Reject campaign error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// server/index.js - Add delete campaign route

// ===================== ADMIN DELETE CAMPAIGN =====================
app.delete("/api/admin/campaign/:id", authMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const db = getDB();

    // Check if user is admin
    const admin = await db.collection("user").findOne({ 
      email: req.user.email 
    });

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized. Admin only." 
      });
    }

    const campaign = await db
      .collection("campaigns")
      .findOne({ _id: new ObjectId(campaignId) });

    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: "Campaign not found" 
      });
    }

    // Get all approved contributions for this campaign
    const contributions = await db
      .collection("contributions")
      .find({
        campaignId: campaignId,
        status: "approved",
      })
      .toArray();

    // Refund all supporters
    for (const contribution of contributions) {
      await db
        .collection("user")
        .updateOne(
          { _id: contribution.supporterId },
          { $inc: { credits: contribution.amount } }
        );
    }

    // Delete campaign
    await db
      .collection("campaigns")
      .deleteOne({ _id: new ObjectId(campaignId) });

    // Delete all contributions for this campaign
    await db.collection("contributions").deleteMany({ campaignId: campaignId });

    // Delete related payments
    await db.collection("payments").deleteMany({ campaignId: campaignId });

    // Notification for creator
    await createNotification({
      message: `🗑️ Your campaign "${campaign.title}" has been permanently deleted by admin.`,
      toEmail: campaign.creatorEmail,
      actionRoute: `/dashboard/creator/my-campaigns`,
      type: "error",
      metadata: {
        campaignId: campaignId,
        campaignTitle: campaign.title,
      },
    });

    res.json({ 
      success: true, 
      message: "Campaign deleted permanently. All supporters refunded." 
    });
  } catch (error) {
    console.error("Delete campaign error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== ADMIN - GET WITHDRAWALS =====================
app.get("/api/admin/withdrawals", authMiddleware, async (req, res) => {
  try {
    const db = getDB();

    const admin = await db.collection("user").findOne({ 
      email: req.user.email 
    });

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized. Admin only." 
      });
    }

    const withdrawals = await db.collection("withdrawals")
      .find({})
      .sort({ date: -1 })
      .toArray();

    res.json({ success: true, withdrawals });
  } catch (error) {
    console.error("Get admin withdrawals error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== ADMIN APPROVE WITHDRAWAL =====================
app.post("/api/admin/withdrawal/approve", authMiddleware, async (req, res) => {
  try {
    const { withdrawalId } = req.body;
    const db = getDB();

    const admin = await db.collection("user").findOne({ 
      email: req.user.email 
    });

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized. Admin only." 
      });
    }

    const withdrawal = await db.collection("withdrawals").findOne({
      _id: new ObjectId(withdrawalId),
    });

    if (!withdrawal) {
      return res.status(404).json({ 
        success: false, 
        message: "Withdrawal not found" 
      });
    }

    if (withdrawal.status === "approved") {
      return res.status(400).json({ 
        success: false, 
        message: "Withdrawal already approved" 
      });
    }

    // Deduct credits from campaigns
    const campaigns = await db
      .collection("campaigns")
      .find({ creatorId: withdrawal.creatorId })
      .toArray();

    let remainingToWithdraw = withdrawal.withdrawalCredits;

    for (const campaign of campaigns) {
      if (remainingToWithdraw <= 0) break;

      const contributions = await db
        .collection("contributions")
        .find({
          campaignId: campaign._id.toString(),
          status: "approved",
        })
        .toArray();

      const campaignRaised = contributions.reduce(
        (sum, c) => sum + (c.amount || 0),
        0,
      );

      if (campaignRaised <= 0) continue;

      let deductAmount = Math.min(remainingToWithdraw, campaignRaised);

      await db
        .collection("campaigns")
        .updateOne({ _id: campaign._id }, { $inc: { raised: -deductAmount } });

      remainingToWithdraw -= deductAmount;
    }

    await db
      .collection("withdrawals")
      .updateOne(
        { _id: new ObjectId(withdrawalId) },
        { $set: { status: "approved" } }
      );

    // Notification for creator
    await createNotification({
      message: `✅ Your withdrawal request of $${withdrawal.withdrawalAmount} has been approved!`,
      toEmail: withdrawal.creatorEmail,
      actionRoute: `/dashboard/creator/withdrawals`,
      type: "success",
      metadata: {
        withdrawalId: withdrawalId,
        amount: withdrawal.withdrawalAmount,
        credits: withdrawal.withdrawalCredits,
      },
    });

    res.json({
      success: true,
      message: "Withdrawal approved and credits deducted",
    });
  } catch (error) {
    console.error("Approve withdrawal error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== ADMIN REJECT WITHDRAWAL =====================
app.post("/api/admin/withdrawal/reject", authMiddleware, async (req, res) => {
  try {
    const { withdrawalId } = req.body;
    const db = getDB();

    const admin = await db.collection("user").findOne({ 
      email: req.user.email 
    });

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized. Admin only." 
      });
    }

    const withdrawal = await db.collection("withdrawals").findOne({
      _id: new ObjectId(withdrawalId),
    });

    if (!withdrawal) {
      return res.status(404).json({ 
        success: false, 
        message: "Withdrawal not found" 
      });
    }

    await db
      .collection("withdrawals")
      .updateOne(
        { _id: new ObjectId(withdrawalId) },
        { $set: { status: "rejected" } }
      );

    // Notification for creator
    await createNotification({
      message: `❌ Your withdrawal request of $${withdrawal.withdrawalAmount} has been rejected. Please contact support.`,
      toEmail: withdrawal.creatorEmail,
      actionRoute: `/dashboard/creator/withdrawals`,
      type: "error",
      metadata: {
        withdrawalId: withdrawalId,
        amount: withdrawal.withdrawalAmount,
        credits: withdrawal.withdrawalCredits,
      },
    });

    res.json({ success: true, message: "Withdrawal rejected" });
  } catch (error) {
    console.error("Reject withdrawal error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// ===================== ADMIN - GET ALL USERS =====================
app.get("/api/admin/users", authMiddleware, async (req, res) => {
  try {
    const db = getDB();

    // Check if user is admin
    const admin = await db.collection("user").findOne({ 
      email: req.user.email 
    });

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized. Admin only." 
      });
    }

    // Get all users
    const users = await db.collection("user")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== ADMIN - DELETE USER =====================
app.delete("/api/admin/users/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const db = getDB();

    console.log('=== DELETE USER ===');
    console.log('User ID from params:', userId);

    // Check if user is admin
    const admin = await db.collection("user").findOne({ 
      email: req.user.email 
    });

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized. Admin only." 
      });
    }

    // Don't allow admin to delete themselves
    if (userId === admin._id.toString() || userId === admin._id) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot delete your own account." 
      });
    }

    // ★★★ Convert userId to ObjectId ★★★
    let objectId;
    try {
      objectId = new ObjectId(userId);
    } catch (err) {
      // If not a valid ObjectId, try as string
      objectId = userId;
    }

    console.log('Searching with:', objectId);

    // Check if user exists
    const user = await db.collection("user").findOne({ _id: objectId });
    if (!user) {
      console.log('User not found with:', objectId);
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log('User found:', user.name);

    // Delete user
    await db.collection("user").deleteOne({ _id: objectId });

    // Delete user's contributions
    await db.collection("contributions").deleteMany({ supporterId: userId });

    // Delete user's campaigns (if creator)
    await db.collection("campaigns").deleteMany({ creatorId: userId });

    // Delete user's payments
    await db.collection("payments").deleteMany({ userId: userId });

    // Delete user's withdrawals
    await db.collection("withdrawals").deleteMany({ creatorId: userId });

    res.json({ 
      success: true, 
      message: "User deleted successfully" 
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== ADMIN - UPDATE USER ROLE =====================
app.put("/api/admin/users/:id/role", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    const db = getDB();

    console.log('=== UPDATE USER ROLE ===');
    console.log('User ID from params:', userId);
    console.log('New Role:', role);

    // Check if user is admin
    const admin = await db.collection("user").findOne({ 
      email: req.user.email 
    });

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized. Admin only." 
      });
    }

    // Don't allow admin to change their own role
    if (userId === admin._id.toString() || userId === admin._id) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot change your own role." 
      });
    }

    // Validate role
    const validRoles = ["admin", "creator", "supporter"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid role. Must be admin, creator, or supporter." 
      });
    }
    let objectId;
    try {
      objectId = new ObjectId(userId);
    } catch (err) {
      objectId = userId;
    }

    console.log('Searching with:', objectId);

    // Check if user exists
    const user = await db.collection("user").findOne({ _id: objectId });
    if (!user) {
      console.log('User not found with:', objectId);
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log('User found:', user.name);
    console.log('Current role:', user.role);

    // Update user role
    await db.collection("user").updateOne(
      { _id: objectId },
      { $set: { role: role, updatedAt: new Date() } }
    );

    // Notification for user
    await createNotification({
      message: `🔄 Your role has been updated to "${role}" by admin.`,
      toEmail: user.email,
      actionRoute: `/dashboard`,
      type: "info",
      metadata: {
        userId: userId,
        newRole: role
      }
    });

    res.json({ 
      success: true, 
      message: "User role updated successfully" 
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== GET NOTIFICATIONS =====================
app.get("/api/notifications", authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const db = getDB();

    const notifications = await db
      .collection("notifications")
      .find({ toEmail: userEmail })
      .sort({ time: -1 })
      .toArray();

    // Mark notifications as read
    await db
      .collection("notifications")
      .updateMany(
        { toEmail: userEmail, read: false },
        { $set: { read: true } },
      );

    res.json({
      success: true,
      notifications: notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== GET UNREAD NOTIFICATION COUNT =====================
app.get("/api/notifications/unread-count", authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const db = getDB();

    const count = await db
      .collection("notifications")
      .countDocuments({ toEmail: userEmail, read: false });

    res.json({
      success: true,
      count: count,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== MARK NOTIFICATION AS READ =====================
app.put("/api/notifications/:id/read", authMiddleware, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const db = getDB();

    await db
      .collection("notifications")
      .updateOne(
        { _id: new ObjectId(notificationId) },
        { $set: { read: true } },
      );

    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// ===================== USER SETUP =====================
app.post("/api/user/setup", authMiddleware, async (req, res) => {
  try {
    const { role, credits } = req.body;
    const userId = req.user.id;
    const db = getDB();

    console.log('=== USER SETUP ===');
    console.log('User ID:', userId);
    console.log('Role:', role);
    console.log('Credits:', credits);

    // Update user
    await db.collection("user").updateOne(
      { _id: userId },
      { 
        $set: { 
          role: role || "supporter",
          credits: credits !== undefined ? credits : 50,
          updatedAt: new Date() 
        } 
      }
    );

    const updatedUser = await db.collection("user").findOne({ _id: userId });

    res.json({
      success: true,
      message: "User setup completed",
      user: updatedUser
    });
  } catch (error) {
    console.error("User setup error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// ===================== REPORT CAMPAIGN =====================
app.post("/api/campaigns/report", authMiddleware, async (req, res) => {
  try {
    const { campaignId, reason, description } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;
    const db = getDB();

    console.log('=== REPORT CAMPAIGN ===');
    console.log('User ID:', userId);
    console.log('User Email:', userEmail);
    console.log('Campaign ID:', campaignId);
    console.log('Reason:', reason);

    if (!campaignId || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: "Campaign ID and reason are required" 
      });
    }

    // Check if campaign exists
    const campaign = await db.collection("campaigns").findOne({ 
      _id: new ObjectId(campaignId) 
    });

    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: "Campaign not found" 
      });
    }

    // ★★★ Find user by ID or email ★★★
    let user = await db.collection("user").findOne({ _id: userId });
    
    if (!user) {
      console.log('User not found by ID, trying by email...');
      user = await db.collection("user").findOne({ email: userEmail });
    }

    if (!user) {
      console.log('User not found!');
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log('User found:', user.name, user.email);

    // Check if user already reported this campaign
    const existingReport = await db.collection("reports").findOne({
      campaignId: campaignId,
      reporterId: userId
    });

    if (existingReport) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already reported this campaign" 
      });
    }

    // Create report
    const report = {
      campaignId: campaignId,
      campaignTitle: campaign.title,
      campaignCreatorId: campaign.creatorId,
      campaignCreatorName: campaign.creatorName,
      campaignCreatorEmail: campaign.creatorEmail,
      reporterId: userId,
      reporterName: user.name,
      reporterEmail: user.email,
      reason: reason,
      description: description || "",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection("reports").insertOne(report);

    console.log('Report created successfully');

    // Notification for admin
    await createNotification({
      message: `🚨 New report on "${campaign.title}" by ${user.name}`,
      toEmail: "admin@admin.com",
      actionRoute: `/dashboard/admin/reports`,
      type: "error",
      metadata: {
        campaignId: campaignId,
        reporterId: userId,
        reason: reason
      }
    });

    res.json({ 
      success: true, 
      message: "Campaign reported successfully. Admin will review it." 
    });
  } catch (error) {
    console.error("Report campaign error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== ADMIN - GET REPORTS =====================
app.get("/api/admin/reports", authMiddleware, async (req, res) => {
  try {
    const db = getDB();

    // Check if user is admin
    const admin = await db.collection("user").findOne({ 
      email: req.user.email 
    });

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized. Admin only." 
      });
    }

    const reports = await db.collection("reports")
      .find({ status: "pending" })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`Found ${reports.length} pending reports`);

    res.json({ 
      success: true, 
      reports: reports || [] 
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== ADMIN - RESOLVE REPORT =====================
app.post("/api/admin/reports/resolve", authMiddleware, async (req, res) => {
  try {
    const { reportId, action } = req.body; // action: 'suspend' or 'delete'
    const db = getDB();

    const admin = await db.collection("user").findOne({ email: req.user.email });
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized. Admin only." });
    }

    const report = await db.collection("reports").findOne({ _id: new ObjectId(reportId) });
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    await db.collection("reports").updateOne(
      { _id: new ObjectId(reportId) },
      { $set: { status: "resolved", resolvedAt: new Date(), resolvedBy: admin.email, action: action } }
    );

    // If action is 'delete', delete the campaign
    if (action === 'delete') {
      const campaign = await db.collection("campaigns").findOne({ _id: new ObjectId(report.campaignId) });
      if (campaign) {
        const contributions = await db.collection("contributions").find({ campaignId: report.campaignId, status: "approved" }).toArray();
        for (const contribution of contributions) {
          await db.collection("user").updateOne({ _id: contribution.supporterId }, { $inc: { credits: contribution.amount } });
        }
        await db.collection("campaigns").deleteOne({ _id: new ObjectId(report.campaignId) });
        await db.collection("contributions").deleteMany({ campaignId: report.campaignId });
        await db.collection("payments").deleteMany({ campaignId: report.campaignId });
      }
    }

    // If action is 'suspend', suspend the campaign
    if (action === 'suspend') {
      await db.collection("campaigns").updateOne({ _id: new ObjectId(report.campaignId) }, { $set: { status: "suspended" } });
    }

    res.json({ success: true, message: `Report resolved. Campaign ${action === 'delete' ? 'deleted' : 'suspended'}.` });
  } catch (error) {
    console.error("Resolve report error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("Crowdfunding server running");
});

const PORT = process.env.PORT;

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
