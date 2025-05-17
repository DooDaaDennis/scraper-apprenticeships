const axios = require("axios");
const cheerio = require("cheerio");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const dateParam = process.argv[2];

console.log(dateParam);
console.log("4getEPAOs");

async function getEPAOs(LARS_code) {
  try {
    const standardURL = `https://find-epao.apprenticeships.education.gov.uk/courses/${LARS_code}/assessment-organisations`;
    const { data } = await axios.get(standardURL);
    const $ = cheerio.load(data);

    // Parse each EPAO entry on the page.
    const EPAOs = $("li.das-search-results__list-item")
      .map((_, element) => {
        const $EPAO = $(element);
        const EPAOName = $EPAO.find("h2 a").text().trim();
        const EPAOID = $EPAO.find("h2 a").attr("id");
        const EPAOLink = $EPAO.find("h2 a").attr("href");
        const EPAOversions = $EPAO
          .find("dl dt:contains('Standard versions')")
          .next("dd")
          .text()
          .split(",")
          .map((version) => version.trim());

        return { EPAOName, EPAOID, EPAOLink, EPAOversions };
      })
      .toArray();

    return EPAOs;
  } catch (error) {
    console.error(`Error fetching EPAOs for LARS_code ${LARS_code}:`, error);
    return [];
  }
}

async function main() {
  const client = new MongoClient(process.env.DATABASE);
  try {
    await client.connect();
    const db = client.db("Apprenticeships");
    const collection = db.collection(
      `${dateParam}-Standards-Providers-EPAOs-Scrape`
    );
    // Retrieve all standard documents.
    const standardsCursor = collection.find({});
    while (await standardsCursor.hasNext()) {
      const standard = await standardsCursor.next();

      console.log(`Getting EPAOs for: ${standard.standardName}`);

      // Scrape EPAOs for the current standard
      const EPAOs = await getEPAOs(standard.LARS_code);

      // Update standard with EPAOs
      await collection.updateOne(
        { _id: standard._id },
        { $set: { standardEPAOs: EPAOs } }
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
