const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    "https://findapprenticeshiptraining.apprenticeships.education.gov.uk/courses"
  );

  await page.screenshot({ path: "GFG.png" });
  await page.locator();
  await browser.close();
})();
