import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import fs from "fs";

dotenv.config();
const allStandards = JSON.parse(
  fs.readFileSync(
    "apprenticeshipArrayProvidersEPAOsActiveApprenticesRegions.json",
    "utf8"
  )
);

const now = new Date();

allStandards.forEach((standard) => {
  standard.dateLogged = now;
});

async function addToDatabase() {
  const client = new MongoClient(process.env.DATABASE);
  try {
    console.log("Connecting to MongoDB");
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("Apprenticeships");
    const collection = db.collection("Scrape");
    console.log("Inserting documents...");

    await collection.insertMany(allStandards);
    console.log("Documents inserted successfully!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

addToDatabase();
