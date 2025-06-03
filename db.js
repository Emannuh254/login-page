const { MongoClient } = require("mongodb");

// Replace with your actual connection string
const uri =
  "mongodb+srv://dbUser:mannuhPass123!@cluster0.ev4eezc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a new MongoClient
const client = new MongoClient(uri);

// Connect and list databases
async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");

    const databasesList = await client.db().admin().listDatabases();
    console.log("📁 Databases:");
    databasesList.databases.forEach((db) => console.log(` - ${db.name}`));
  } catch (err) {
    console.error("❌ Connection failed:", err);
  } finally {
    await client.close();
  }
}

run();
