const axios = require("axios");
const cheerio = require("cheerio");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const dateParam = process.argv[2];

console.log(dateParam);
console.log("3getProviders");

async function getProviders(pageURL) {
  try {
    const { data } = await axios.get(pageURL);
    const $ = cheerio.load(data);
    const trainingProviders = $("div.govuk-summary-card__title-wrapper h2 a")
      .map((_, provider) => {
        const $provider = $(provider);
        const providerName = $provider.text().trim();
        const providerID = $provider.attr("id")?.match(/\d+/)?.[0] || null;
        const providerLink = $provider.attr("href");

        return { providerName, providerLink, providerID };
      })
      .toArray();

    return trainingProviders;
  } catch (error) {
    console.error("Error fetching providers for URL:", pageURL, error);
    return [];
  }
}

// update mongo
async function main() {
  const client = new MongoClient(process.env.DATABASE);
  try {
    await client.connect();
    const db = client.db("Apprenticeships");
    const collection = db.collection(
      `${dateParam}-Standards-Providers-EPAOs-Scrape`
    );
    // Retrieve all standards documents.
    const standardsCursor = collection.find({});
    while (await standardsCursor.hasNext()) {
      const standard = await standardsCursor.next();
      console.log("Getting providers for:", standard.standardName);
      const standardProviders = [];

      if (standard.pages && Array.isArray(standard.pages)) {
        for (const page of standard.pages) {
          const providers = await getProviders(page);
          standardProviders.push(...providers);
        }
      } else {
        console.warn(
          `Standard "${standard.standardName}" does not have a valid "pages" array.`
        );
      }

      // Update the current document wit  h the scraped providers.
      await collection.updateOne(
        { _id: standard._id },
        { $set: { standardProviders } }
      );
      console.log(`Updated standard: ${standard.standardName}`);
    }
  } catch (error) {
    console.error("Error during MongoDB transformation:", error);
  } finally {
    await client.close();
  }
}

main();
