import { createRequire } from "module";
const require = createRequire(import.meta.url);

const axios = require("axios");
const cheerio = require("cheerio");

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
    console.error("Error fetching pages:", error);
  }
}
const myStandard =
  "https://findapprenticeshiptraining.apprenticeships.education.gov.uk/courses/488/providers";
const page = await getAllPages(myStandard);
console.log(page);
