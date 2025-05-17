require("dotenv").config();
const { MongoClient } = require("mongodb");
const fs = require("fs");

async function exportToJson() {
  const client = new MongoClient(process.env.DATABASE);

  try {
    console.log("Connecting to database");
    await client.connect();
    console.log("Connected to MongoDB");

    const dbname = client.db("Apprenticeships");
    const final = dbname.collection("app-narts-provider-level-fwk-std");

    // Fetch all documents
    const data = await final.find({}).toArray();

    // Convert to JSON
    const jsonData = JSON.stringify(data, null, 2);

    // Save to a file
    console.log("Saving to file");
    fs.writeFileSync("app-narts-provider-level-fwk-std.json", jsonData);
    console.log("Download complete");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

exportToJson();
