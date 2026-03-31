const { MongoClient } = require('mongodb');

let dbInstance = null;

const connectDB = async () => {
  if (dbInstance) return dbInstance;

  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    dbInstance = client.db(); // Extracted from URI automatically
    console.log("MongoDB Native Client Connected");
    return dbInstance;
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    throw error; // Let app crash or handle gracefully
  }
};

const getDB = () => {
  if (!dbInstance) {
    throw new Error('Database not initialized! Call connectDB first.');
  }
  return dbInstance;
};

module.exports = { connectDB, getDB };