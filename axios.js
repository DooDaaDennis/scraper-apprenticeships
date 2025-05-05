const axios = require("axios");
const cheerio = require("cheerio");

const initialURL =
  "https://findapprenticeshiptraining.apprenticeships.education.gov.uk/courses";

const allPages = [];

async function getAllPages() {
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
        const heading = $item.find("h2").text().trim();
        const link = $item.find("a").attr("href");

        return { heading, link };
      })
      .toArray();

    return items;

    // console.log(items);
  } catch (error) {
    console.error("Error fetching items:", error);
  }
}

// getItems(initialURL);
const allStandards = [];

(async () => {
  const pages = await getAllPages();

  for (const page of pages) {
    const pageItems = await getItems(page);
    allStandards.push(...pageItems);
  }

  console.log(allStandards);
})();
