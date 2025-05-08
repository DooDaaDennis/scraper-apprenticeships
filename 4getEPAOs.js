const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const myData = fs.readFileSync("standards.json", "utf-8");
const standards = JSON.parse(myData);

async function getEPAOs(standardID) {
  try {
    const standardURL = `https://find-epao.apprenticeships.education.gov.uk/courses/${standardID}/assessment-organisations`;
    const { data } = await axios.get(standardURL);
    const $ = cheerio.load(data);
    const EPAO = $("li.das-search-results__list-item")
      .map((_, EPAO) => {
        const $EPAO = $(EPAO);
        const EPAOName = $EPAO.find("h2 a").text().trim();
        const EPAOID = $EPAO.find("h2 a").attr("id");
        const EPAOLink = $EPAO.find("h2 a").attr("href");
        const EPAOversions = $EPAO
          .find("dl dt:contains('Standard versions')")
          .next("dd")
          .text()
          .trim();

        return { EPAOName, EPAOID, EPAOLink, EPAOversions };
      })
      .toArray();

    return EPAO;
  } catch (error) {
    console.error("Error fetching EPAOs:", error);
    return [];
  }
}

(async () => {
  console.log("Getting EPAOs");
  for (const standard of standards) {
    console.log("Getting EPAOs for:", standard.standardName);
    const standardEPAOs = [];
    const EPAOs = await getEPAOs(standard.standardID);
    standardEPAOs.push(...EPAOs);
    standard.standardEPAOs = standardEPAOs;
  }

  fs.writeFileSync(
    "standards.json",
    JSON.stringify(standards, null, 2),
    "utf-8"
  );
})();
