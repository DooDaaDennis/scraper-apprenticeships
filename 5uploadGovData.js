require("dotenv").config();
const { MongoClient } = require("mongodb");
const fs = require("fs");

async function load_csv() {
  const client = new MongoClient(process.env.DATABASE);

  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const dbname = client.db("Apprenticeships");
    const final = dbname.collection("app-narts-provider-level-fwk-std");

    const data = fs.readFileSync(
      "app-narts-provider-level-fwk-std.csv",
      "utf8"
    );
    const rows = data.split("\n");
    const fieldnames = rows[0].split(",");
    const results = [];

    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(",");
      const documents = {};

      for (let j = 0; j < fieldnames.length; j++) {
        documents[fieldnames[j]] = values[j];
      }

      console.log(`Processing line ${i + 1} of ${rows.length}`);
      results.push(documents);
    }
    console.log("Inserting documents...");
    await final.insertMany(results);
    console.log("Documents inserted successfully!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

load_csv();
