// server/create-test-data.js
const { connectDB, getDB } = require('./db');
const { ObjectId } = require('mongodb');

async function createTestData() {
  try {
    await connectDB();
    const db = getDB();

    // 1. Create a test campaign
    const campaign = {
      title: "Help us build a solar-powered water pump",
      story: "We are raising funds to build a solar-powered water pump for our community. This will provide clean drinking water to over 500 families.",
      category: "Technology",
      goal: 5000,
      minContribution: 10,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      rewardInfo: "All supporters will get a certificate of appreciation and their name on our website.",
      imageUrl: "https://via.placeholder.com/400x300",
      creatorName: "John Doe",
      creatorEmail: "john@example.com",
      status: "approved",
      createdAt: new Date(),
      raised: 0
    };

    const result = await db.collection('campaigns').insertOne(campaign);
    console.log('Test campaign created:', result.insertedId);

    console.log('Test data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
}

createTestData();