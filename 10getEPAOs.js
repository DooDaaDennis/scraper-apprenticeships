import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";

async function getEPAOs(LARS_code) {
  try {
    const standardURL = `https://find-epao.apprenticeships.education.gov.uk/courses/${LARS_code}/assessment-organisations`;
    const { data } = await axios.get(standardURL);
    const $ = cheerio.load(data);

    // Parse each EPAO entry on the page.
    const EPAOs = $("li.das-search-results__list-item")
      .map((_, element) => {
        const $EPAO = $(element);
        const EPAOName = $EPAO.find("h2 a").text().trim();
        const EPAOID = $EPAO.find("h2 a").attr("id");
        const EPAOLink = $EPAO.find("h2 a").attr("href");
        const EPAOversions = $EPAO
          .find("dl dt:contains('Standard versions')")
          .next("dd")
          .text()
          .split(",")
          .map((version) => version.trim());

        return { EPAOName, EPAOID, EPAOLink, EPAOversions };
      })
      .toArray();

    return EPAOs;
  } catch (error) {
    console.error(`Error fetching EPAOs for LARS_code ${LARS_code}:`, error);
    return [];
  }
}

const allStandards = JSON.parse(
  fs.readFileSync("apprenticeshipArrayProviders.json", "utf8")
);

(async () => {
  let i = 1;
  for (const standard of allStandards) {
    console.log(
      `Getting EPAOs for ${standard.reference}: ${standard.Name} - ${i} of ${allStandards.length}`
    );
    const standardEPAOs = await getEPAOs(
      standard["LARS code for providers only"]
    );
    standard.EPAOs = standardEPAOs;
    // console.log(standard.EPAOs);
    i++;
  }
  fs.writeFileSync(
    "apprenticeshipArrayProvidersEPAOs.json",
    JSON.stringify(allStandards, null, 2),
    "utf8"
  );
})();
