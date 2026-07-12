const { betterAuth } = require("better-auth");
const { bearer } = require("better-auth/plugins");
const { MongoClient } = require("mongodb");
const { mongodbAdapter } = require("better-auth/adapters/mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db(process.env.DB_NAME);

const auth = betterAuth({
  database: mongodbAdapter(db),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "supporter",
        input: true,
      },
      credits: {
        type: "number",
        required: false,
        defaultValue: 0,
        input: false, 
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const role = user.role === "creator" ? "creator" : "supporter";
          const startingCredits = role === "creator" ? 20 : 50;
          return {
            data: {
              ...user,
              role,
              credits: startingCredits,
            },
          };
        },
      },
    },
  },

  plugins: [bearer()],

  trustedOrigins: [process.env.CLIENT_URL],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});

module.exports = { auth };