const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const myData = fs.readFileSync("standards.json", "utf-8");
const standards = JSON.parse(myData);

async function getProviders(pageURL) {
  try {
    const providerURL = pageURL;
    const { data } = await axios.get(providerURL);
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
    console.error("Error fetching providers:", error);
    return [];
  }
}

(async () => {
  console.log("Getting providers");
  for (const standard of standards) {
    console.log("Getting providers for:", standard.standardName);
    const standardProviders = [];
    for (const page of standard.pages) {
      const providers = await getProviders(page);
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
