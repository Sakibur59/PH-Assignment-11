const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./db");
const { auth } = require("./auth");
const { toNodeHandler } = require("better-auth/node");

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));


app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Crowdfunding server running");
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});