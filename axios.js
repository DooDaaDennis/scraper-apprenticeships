const axios = require("axios");
const cheerio = require("cheerio");

const initialURL =
  "https://findapprenticeshiptraining.apprenticeships.education.gov.uk/courses";

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

    console.log(items);
  } catch (error) {
    console.error("Error fetching items:", error);
  }
}

getItems(initialURL);
