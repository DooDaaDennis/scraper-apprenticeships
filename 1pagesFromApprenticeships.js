const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

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
    console.error(
      `Error fetching pages:${baseURL}?PageNumber=${pageNumber} `,
      error
    );
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

////////////////////////

const allStandards = [];
const initialURL =
  "https://findapprenticeshiptraining.apprenticeships.education.gov.uk/courses";

(async () => {
  console.log("Gathering apprenticeship pages");
  //get all apprentice standard pages
  const pages = await getAllPages(initialURL);

  //loop through pages and collect all standards
  for (const page of pages) {
    const pageItems = await getItems(page);
    allStandards.push(...pageItems);
  }

  // Ensure allStandards is populated
  if (allStandards.length === 0) {
    console.log("No standards found.");
    return;
  }

  //loop through standards and get provider pages links for each
  for (const [i, standard] of allStandards.entries()) {
    console.log(
      "Fetching provider pages for:",
      standard.standardName,
      `- ${i} out of ${allStandards.length}`
    );

    const standardPages = await getAllPages(
      `${initialURL}/${standard.standardID}/providers`
    );

    allStandards[i].pages = standardPages;
    // console.log(allStandards[i]);
  }

  // Save to file
  fs.writeFileSync(
    "standards.json",
    JSON.stringify(allStandards, null, 2),
    "utf-8"
  );
})();
