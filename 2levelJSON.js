require("dotenv").config();
const { MongoClient } = require("mongodb");
const dateParam = process.argv[2];

console.log(dateParam);
console.log("2levelJSON");

async function updateStandards() {
  const client = new MongoClient(process.env.DATABASE);

  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db("Apprenticeships");
    const collection = db.collection(
      `${dateParam}-Standards-Providers-EPAOs-Scrape`
    );
    // Fetch all standard from the collection
    const standards = await collection.find({}).toArray();
    console.log(`Fetched ${standards.length} standards from the database.`);

    // Loop through standards and extract level
    for (const standard of standards) {
      // Extract level from standardName using regex
      const match = standard.standardName.match(/\(level (\d+)\)/i);
      const level = match ? parseInt(match[1]) : "Unknown";

      // Remove 'level' from standardName
      const updatedName = standard.standardName.replace(
        /\s*\(level \d+\)/i,
        ""
      );

      // Updated object
      const updatedDoc = {
        standardName: updatedName,
        level,
        LARS_code: standard.LARS_code,
        pages: standard.pages,
      };

      // Update the standard using mongoid
      const result = await collection.updateOne(
        { _id: standard._id },
        { $set: updatedDoc }
      );
      console.log(
        `Updated document ${standard._id}: ${result.modifiedCount}/${standards.length} document(s) modified.`
      );
    }

    console.log("All standards updated successfully!");
  } catch (error) {
    console.error("Error updating standards:", error);
  } finally {
    await client.close();
  }
}

updateStandards();
