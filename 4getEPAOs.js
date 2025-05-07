const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const myData = fs.readFileSync("standards.json", "utf-8");
const standards = JSON.parse(myData);

async function getEPAOs(pageURL) {
  try {
    const providerURL = pageURL;
    const { data } = await axios.get(providerURL);
    const $ = cheerio.load(data);
    const trainingProviders = $("div.govuk-summary-card__title-wrapper h2 a")
      .map((_, provider) => {
        const $provider = $(provider);
        const providerName = $provider.text().trim();
        const providerID = $provider.attr("id");
        const providerLink = $provider.attr("href");

        return { providerName, providerLink, providerID };
      })
      .toArray();

    return trainingProviders;
  } catch (error) {
    console.error("Error fetching providers:", error);
    return [];
  }
}

(async () => {
  console.log("Getting EPAOs");
  for (const standard of standards) {
    console.log("Getting EPAOs for:", standard.standardName);
    const standardEPAOs = [];
    for (const page of standard.pages) {
      const EPAOs = await getEPAOs(page);
      standardProviders.push(...providers);
    }
    standard.standardProviders = standardProviders;
  }

  fs.writeFileSync(
    "standards.json",
    JSON.stringify(standards, null, 2),
    "utf-8"
  );
})();
