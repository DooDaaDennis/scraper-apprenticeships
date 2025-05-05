const axios = require("axios");
const cheerio = require("cheerio");

const initialURL =
  "https://findapprenticeshiptraining.apprenticeships.education.gov.uk/courses";

async function getAllPages() {
  const allPages = [];
  let pageNumber = 1;
  try {
    while (true) {
      const url = `${initialURL}?PageNumber=${pageNumber}`;
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
    console.error("Error fetching pages:", error);
  }
}

async function getItems(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const items = $("li.das-search-results__list-item")
      .map((_, item) => {
        const $item = $(item);
        const standardName = $item.find("h2").text().trim();
        const standardID = $item.find("a").attr("id").split("-").pop();

        return { standardName, standardID };
      })
      .toArray();

    return items;

    // console.log(items);
  } catch (error) {
    console.error("Error fetching items:", error);
  }
}

async function getProviders(standard) {
  try {
    const providerURL = `https://findapprenticeshiptraining.apprenticeships.education.gov.uk/courses/${standard.standardID}/providers`;
    const { data } = await axios.get(providerURL);
    const $ = cheerio.load(data);
    const trainingProviders = $("div.govuk-summary-card__title-wrapper h2 a")
      .map((_, provider) => {
        const $provider = $(provider);
        const providerName = $provider.text().trim();
        const providerLink = $provider.attr("href");

        return { providerName, providerLink };
      })
      .toArray();

    return trainingProviders;
  } catch (error) {
    console.error("Error fetching providers:", error);
    return [];
  }
}
////////////////////////

const allStandards = [];

(async () => {
  const pages = await getAllPages();

  for (const page of pages) {
    const pageItems = await getItems(page);
    allStandards.push(...pageItems);
  }

  for (const standard of allStandards) {
    const providers = await getProviders(standard);
    console.log(`Providers for ${standard.standardName}:`, providers);
  }
})();
