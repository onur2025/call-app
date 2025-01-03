const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const db = client.db("chatdatabase"); // استبدل باسم قاعدة البيانات
    return db;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
}

module.exports = connectToDatabase;

