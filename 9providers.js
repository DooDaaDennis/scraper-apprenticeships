import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";

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

async function getAllPages(baseURL) {
  const allPages = [];
  let pageNumber = 1;
  try {
    while (true) {
      const url = `${baseURL}?PageNumber=${pageNumber}`;
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      // Store the current page URL
      allPages.push(url);

      // Check if there's a "Next" button
      const nextButton = $("a:contains('Next')").attr("href");
      if (!nextButton) break;

      // Next page
      pageNumber += 1;
    }

    // console.log("All Pages:", allPages);
    return allPages;
  } catch (error) {
    console.error(`Error fetching pages:${baseURL}?PageNumber=${pageNumber} `);
    return [];
  }
}

const allStandards = JSON.parse(
  fs.readFileSync("apprenticeshipArray.json", "utf8")
);

const initialURL =
  "https://findapprenticeshiptraining.apprenticeships.education.gov.uk/courses";

(async () => {
  let i = 1;
  for (const standard of allStandards) {
    console.log(
      `Getting providers for ${standard.reference}: ${standard.Name} - ${i} of ${allStandards.length}`
    );
    standard.providers = [];
    const standardPages = await getAllPages(
      `${initialURL}/${standard["LARS code for providers only"]}/providers`
    );
    for (const page of standardPages) {
      const standardProviders = await getProviders(page);
      standard.providers.push(...standardProviders);
    }
    i++;
  }
  fs.writeFileSync(
    "apprenticeshipArrayProviders.json",
    JSON.stringify(allStandards, null, 2),
    "utf8"
  );
})();
