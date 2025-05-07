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
    const EPAO = $("li.das-search-results__list-item h2 a")
      .map((EPAO) => {
        const $EPAO = $(EPAO);
        const EPAOName = $EPAO.text().trim();
        const EPAOID = $EPAO.attr("id");
        const EPAOLink = $EPAO.attr("href");

        return { EPAOName, EPAOID, EPAOLink };
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
    const EPAOs = await getEPAOs(standard.ID);
    standardEPAOs.push(...EPAOs);
    standard.standardEPAOs = standardEPAOs;
  }

  fs.writeFileSync(
    "standards.json",
    JSON.stringify(standards, null, 2),
    "utf-8"
  );
})();
