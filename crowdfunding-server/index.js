const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB, getDB } = require("./db");
const { auth } = require("./auth");
const { toNodeHandler } = require("better-auth/node");
const { ObjectId } = require("mongodb");

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

    const campaigns = await db
      .collection("campaigns")
      .find({
        status: "approved",
        deadline: { $gt: new Date() },
      })
      .sort({ createdAt: -1 })
      .toArray();

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

// 9. Contribute to campaign
app.post("/api/campaigns/contribute", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const { campaignId, amount } = req.body;
    const userId = req.user.id;

    console.log('=== CONTRIBUTE TO CAMPAIGN ===');
    console.log('User ID (string):', userId);
    console.log('Campaign ID:', campaignId);
    console.log('Amount:', amount);

    if (!campaignId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Campaign ID and amount are required",
      });
    }

    // ★★★ IMPORTANT: Convert userId to ObjectId ★★★
    const userObjectId = new ObjectId(userId);
    console.log('User ObjectId:', userObjectId);

    // Find user using ObjectId
    const user = await db.collection("user").findOne({ _id: userObjectId });
    
    if (!user) {
      console.log('User not found with ObjectId:', userObjectId);
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
        message: "Insufficient credits. Please purchase more credits.",
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
      supporterId: userId, // string রাখতে পারেন বা userObjectId
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

    console.log('Contribution created with ID:', contributionId);

    // Create payment record
    await db.collection("payments").insertOne({
      userId: userId,
      type: "contribution",
      credits: -amount,
      amount: amount,
      campaignId: campaignId,
      campaignTitle: campaign.title,
      date: new Date(),
      status: "pending",
      contributionId: contributionId
    });

    console.log('Payment record created');

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
app.get("/api/creator/dashboard", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();

    // Get all campaigns by this creator
    const campaigns = await db
      .collection("campaigns")
      .find({ creatorId: userId })
      .toArray();

    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(
      (c) => new Date(c.deadline) > new Date(),
    ).length;

    // Calculate total raised across all campaigns
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

    // Get pending contributions for creator's campaigns
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
        })),
      );
    }

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

// 11. Approve contribution
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

      console.log('=== APPROVE CONTRIBUTION ===');
      console.log('Contribution ID:', contributionId);
      console.log('Status:', contribution.status);

      // Update contribution status
      await db
        .collection("contributions")
        .updateOne(
          { _id: new ObjectId(contributionId) },
          { $set: { status: "approved" } }
        );

      // Update campaign raised amount
      await db
        .collection("campaigns")
        .updateOne(
          { _id: new ObjectId(contribution.campaignId) },
          { $inc: { raised: contribution.amount } }
        );

      // ★★★ Update payment by contributionId ★★★
      const paymentUpdate = await db.collection("payments").updateOne(
        { 
          contributionId: contributionId,
          type: "contribution"
        },
        { $set: { status: "completed" } }
      );

      console.log('Payment update result:', paymentUpdate);

      // If no payment found, create one
      if (paymentUpdate.matchedCount === 0) {
        console.log('No payment found, creating new...');
        await db.collection("payments").insertOne({
          userId: contribution.supporterId,
          type: "contribution",
          credits: -contribution.amount,
          amount: contribution.amount,
          campaignId: contribution.campaignId,
          campaignTitle: contribution.campaignTitle,
          date: new Date(),
          status: "completed",
          contributionId: contributionId
        });
      }

      res.json({
        success: true,
        message: "Contribution approved successfully",
      });
    } catch (error) {
      console.error("Approve contribution error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
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

      console.log('=== REJECT CONTRIBUTION ===');
      console.log('Contribution ID:', contributionId);

      // Update contribution status
      await db
        .collection("contributions")
        .updateOne(
          { _id: new ObjectId(contributionId) },
          { $set: { status: "rejected" } }
        );

      // Refund credits to supporter
      await db
        .collection("user")
        .updateOne(
          { _id: new ObjectId(contribution.supporterId) },
          { $inc: { credits: contribution.amount } }
        );

      // ★★★ Update payment by contributionId ★★★
      const paymentUpdate = await db.collection("payments").updateOne(
        { 
          contributionId: contributionId,
          type: "contribution"
        },
        { $set: { status: "rejected" } }
      );

      console.log('Payment update result:', paymentUpdate);

      // If no payment found, create one
      if (paymentUpdate.matchedCount === 0) {
        console.log('No payment found, creating new...');
        await db.collection("payments").insertOne({
          userId: contribution.supporterId,
          type: "contribution",
          credits: -contribution.amount,
          amount: contribution.amount,
          campaignId: contribution.campaignId,
          campaignTitle: contribution.campaignTitle,
          date: new Date(),
          status: "rejected",
          contributionId: contributionId
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
  }
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
        $or: [
          { userId: userId },        
          { userId: userObjectId }   
        ]
      })
      .sort({ date: -1 })
      .toArray();

    const contributions = await db
      .collection("contributions")
      .find({ 
        $or: [
          { supporterId: userId },
          { supporterId: userObjectId }
        ]
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
      console.log(`Processing payment: ${payment._id}, type: ${payment.type}, status: ${payment.status}`);

      if (payment.type === 'contribution') {
        if (payment.contributionId && contributionMap[payment.contributionId]) {
          const contributionStatus = contributionMap[payment.contributionId];
          let paymentStatus = contributionStatus;
          
          if (contributionStatus === 'approved') {
            paymentStatus = 'completed';
          } else if (contributionStatus === 'pending') {
            paymentStatus = 'pending';
          } else if (contributionStatus === 'rejected') {
            paymentStatus = 'rejected';
          }

          if (payment.status !== paymentStatus) {
            console.log(`Updating payment ${payment._id}: ${payment.status} -> ${paymentStatus}`);
            await db.collection("payments").updateOne(
              { _id: payment._id },
              { $set: { status: paymentStatus } }
            );
            payment.status = paymentStatus;
          }
        }
        else if (payment.campaignId && contributionMap[payment.campaignId]) {
          const contributionStatus = contributionMap[payment.campaignId];
          let paymentStatus = contributionStatus;
          
          if (contributionStatus === 'approved') {
            paymentStatus = 'completed';
          } else if (contributionStatus === 'pending') {
            paymentStatus = 'pending';
          } else if (contributionStatus === 'rejected') {
            paymentStatus = 'rejected';
          }

          if (payment.status !== paymentStatus) {
            console.log(`Updating payment ${payment._id} (by campaign): ${payment.status} -> ${paymentStatus}`);
            await db.collection("payments").updateOne(
              { _id: payment._id },
              { $set: { status: paymentStatus } }
            );
            payment.status = paymentStatus;
          }
        }
      }
      if (payment.type === 'purchase') {
        if (payment.status !== 'completed') {
          console.log(`Fixing purchase payment ${payment._id}: ${payment.status} -> completed`);
          await db.collection("payments").updateOne(
            { _id: payment._id },
            { $set: { status: 'completed' } }
          );
          payment.status = 'completed';
        }
      }
    }
    if (payments.length === 0 && contributions.length > 0) {
      console.log('No payments found, creating from contributions...');
      
      for (const c of contributions) {
        const paymentStatus = c.status === 'approved' ? 'completed' : c.status;
        
        await db.collection("payments").insertOne({
          userId: userId,
          type: 'contribution',
          credits: -c.amount,
          amount: c.amount,
          campaignId: c.campaignId,
          campaignTitle: c.campaignTitle,
          date: c.date || new Date(),
          status: paymentStatus,
          contributionId: c._id.toString()
        });
        console.log(`Created payment for contribution: ${c._id}`);
      }
      
      // Fetch payments again
      const newPayments = await db
        .collection("payments")
        .find({ 
          $or: [
            { userId: userId },
            { userId: userObjectId }
          ]
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
