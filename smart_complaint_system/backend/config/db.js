/* ============================================
   DB.JS — MongoDB Connection Setup
   Smart Citizen Grievance Management System
   ============================================ */

const mongoose = require('mongoose');
const config = require('./config');

/**
 * Connect to MongoDB using Mongoose
 */
async function connectDB() {
  try {
    const conn = await mongoose.connect(config.mongo.uri);

    console.log(`🗄️   MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦  Database: ${conn.connection.name}`);

    return conn;
  } catch (err) {
    console.error(`❌  MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
}

// ---- Connection Event Listeners ----
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️   MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄  MongoDB reconnected.');
});

// ---- Graceful Shutdown ----
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑  MongoDB connection closed due to app termination.');
  process.exit(0);
});

module.exports = connectDB;
