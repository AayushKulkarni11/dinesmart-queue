const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("Missing required env var: MONGO_URI");
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    // eslint-disable-next-line no-console
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection error:", err?.message || err);
    throw err;
  }
}

module.exports = { connectDB };

