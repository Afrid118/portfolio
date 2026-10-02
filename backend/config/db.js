const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_lost_found';
  
  try {
    // Attempt local MongoDB with 2.5s timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Local MongoDB (${uri}) not reachable (${error.message}).`);
    console.log('🚀 Launching embedded MongoDB instance so the app works instantly without manual DB setup...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`✅ Embedded MongoDB Connected: ${conn.connection.host} (${memUri})`);
    } catch (memError) {
      console.error('❌ Could not start embedded MongoDB:', memError.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
