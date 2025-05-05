const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.geeksforgeeks.org/");

  await page.screenshot({ path: "GFG.png" });
  await browser.close();
})();
