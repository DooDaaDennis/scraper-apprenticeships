import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

const allStandards = JSON.parse(
  fs.readFileSync("apprenticeshipArrayProvidersEPAOs.json", "utf8")
);

const baseURL =
  "https://assessors.apprenticeships.education.gov.uk/find-an-assessment-opportunity/ShowApprovedStandardDetails?standardReference=";

async function getSessionCookies(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  // Extract cookies
  const cookies = await page.cookies();
  await browser.close();

  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

async function getActiveApprentices(url, axInstance) {
  try {
    const { data } = await axInstance.get(url, { maxRedirects: 0 });

    const $ = cheerio.load(data);

    const apprenticesData = [];

    const targetTable = $("table").first();

    targetTable
      .find("tbody tr")
      .slice(0, -1)
      .each((_, row) => {
        const version = parseFloat($(row).find("th:nth-child(1)").text().trim());
        const activeApprentices = parseInt(
          $(row).find("td:nth-child(2)").text().trim()
        );
        const completedAssessments = parseInt(
          $(row).find("td:nth-child(4)").text().trim()
        );

        apprenticesData.push({
          version,
          activeApprentices,
          completedAssessments,
        });
      });

    return apprenticesData;
  } catch (error) {
    console.error("Error or no data");
    return [];
  }
}

async function getActiveApprenticesAllStandards() {
  let i = 1;
  const cookies = await getSessionCookies(
    `https://assessors.apprenticeships.education.gov.uk/find-an-assessment-opportunity`
  );
  const axiosInstance = axios.create({
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://assessors.apprenticeships.education.gov.uk/",
      Cookie: cookies,
    },
    withCredentials: true,
  });
  for (const standard of allStandards) {
    console.log(
      `Getting numbers for ${standard.reference}: ${standard.Name} - ${i} of ${allStandards.length}`
    );

    const standardURL = baseURL + standard.reference;
    console.log(standardURL);
    const activeApprentices = await getActiveApprentices(
      standardURL,
      axiosInstance
    );
    console.log(activeApprentices);
    i++;
    for (const standardVersion of standard.versions) {
      const activeApprenticesObject = activeApprentices.find(
        (activeVersion) =>
          activeVersion.version === standardVersion["Version Number"]
      ) ?? { activeApprentices: 0 };
      standardVersion.activeApprentices = activeApprenticesObject
        ? activeApprenticesObject.activeApprentices
        : 0;
      standardVersion.completedAssessments = activeApprenticesObject
        ? activeApprenticesObject.completedAssessments
        : 0;
    }
  }
}

await getActiveApprenticesAllStandards();

fs.writeFileSync(
  "apprenticeshipArrayProvidersEPAOsActiveApprentices.json",
  JSON.stringify(allStandards, null, 2),
  "utf8"
);
