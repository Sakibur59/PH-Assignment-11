// server/index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./db");
const { auth } = require("./auth");
const { toNodeHandler } = require("better-auth/node");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());

// Better Auth handler
app.all("/api/auth/*splat", toNodeHandler(auth));

// Auth middleware
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

// Import routes
const supporterRoutes = require('./routes/supporter');
const creditsRoutes = require('./routes/credits');
const campaignsRoutes = require('./routes/campaigns');
const stripeRoutes = require('./routes/stripe');

// Apply auth middleware to all protected routes
app.use('/api/supporter', authMiddleware, supporterRoutes);
app.use('/api', authMiddleware, creditsRoutes);
app.use('/api/campaigns', authMiddleware, campaignsRoutes);
app.use('/api/create-checkout-session', authMiddleware, stripeRoutes);

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