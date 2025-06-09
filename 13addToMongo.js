import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import fs from "fs";

dotenv.config();

const now = new Date();


async function cleanDatabase(collection){
  try {
 await collection.updateMany(
  {dateLogged:now},
  [
    {
      $set: {
        versions: {
          $map: {
            input: "$versions",
            as: "version",
            in: {
              $mergeObjects: [
                "$$version",
                {
                  "Maximum Funding (£)": {
                    $convert: {
                      input: "$$version.Maximum Funding (£)",
                      to: "int",
                      onError: null,
                      onNull: null
                    }
                  },
                  "Typical Duration": {
                    $convert: {
                      input: "$$version.Typical Duration",
                      to: "int",
                      onError: null,
                      onNull: null
                    }
                  },
                  "Approved for Delivery Date": {
                    $convert: {
                      input: "$$version.Approved for Delivery Date",
                      to: "date",
                      onError: null,
                      onNull: null
                    }
                  },
                  "Retired date": {
                    $convert: {
                      input: "$$version.Retired date",
                      to: "date",
                      onError: null,
                      onNull: null
                    }
                  },
                  "Withdrawn date": {
                    $convert: {
                      input: "$$version.Withdrawn date",
                      to: "date",
                      onError: null,
                      onNull: null
                    }
                  },
                  "Last Updated": {
                    $convert: {
                      input: "$$version.Last Updated",
                      to: "date",
                      onError: null,
                      onNull: null
                    }
                  }
                }
              ]
            }
          }
        }, 
        Level: {
          $convert: {
            input: "$Level",
            to: "int",
            onError: null,
            onNull: null
          }
        }
      }
    }
  ]
);
  } catch (error) {
    console.error("Error:", error);
  } 
}


const allStandards = JSON.parse(
  fs.readFileSync(
    "apprenticeshipArrayProvidersEPAOsActiveApprenticesRegions.json",
    "utf8"
  )
);


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
    console.log("Cleaning database...");
    await cleanDatabase(collection);
    console.log("Database cleaned successfully!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

addToDatabase();
