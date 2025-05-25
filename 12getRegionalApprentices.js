import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

const allStandards = JSON.parse(
  fs.readFileSync(
    "apprenticeshipArrayProvidersEPAOsActiveApprentices.json",
    "utf8"
  )
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

const regions = [
  "North East",
  "North West",
  "Yorkshire and the Humber",
  "East Midlands",
  "West Midlands",
  "East of England",
  "London",
  "South East",
  "South West",
];

async function getRegionalApprentices(url, axInstance) {
  try {
    const { data } = await axInstance.get(url, { maxRedirects: 0 });

    const $ = cheerio.load(data);

    const apprenticesData = [];

    const targetTable = $("table").eq(1);

    regions.forEach((region) => {
      const targetRow = targetTable.find("tr").filter((_, row) => {
        return $(row).find("td:nth-child(1) span").text().trim() === region;
      });
      const activeApprentices =
        parseInt(targetRow.find("td:nth-child(3)").text().trim(), 10) || 0;
      const completedAssessments =
        parseInt(targetRow.find("td:nth-child(4)").text().trim(), 10) || 0;

      apprenticesData.push({
        region,
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

async function getRegionalApprenticesAllStandards() {
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
      `Getting regional numbers for ${standard.reference}: ${standard.Name} - ${i} of ${allStandards.length}`
    );

    const standardURL = baseURL + standard.reference;
    console.log(standardURL);
    const regionalApprentices = await getRegionalApprentices(
      standardURL,
      axiosInstance
    );
    for (const region of regionalApprentices) {
      standard[region.region] = {
        activeApprentices: region.activeApprentices,
        completedAssessments: region.completedAssessments,
      };
    }
    console.log(standard);
    i++;
  }
}

await getRegionalApprenticesAllStandards();

fs.writeFileSync(
  "apprenticeshipArrayProvidersEPAOsActiveApprenticesRegions.json",
  JSON.stringify(allStandards, null, 2),
  "utf8"
);
