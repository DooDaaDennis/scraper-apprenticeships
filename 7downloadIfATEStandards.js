import axios from "axios";
import * as cheerio from "cheerio";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
import csv from "csv-parser";
import { Readable } from "stream";
import fs from "fs";

async function getBodyArray() {
  try {
    const standardURL = `https://skillsengland.education.gov.uk/apprenticeships/`;
    const { data } = await axios.get(standardURL);
    const $ = cheerio.load(data);

    const standards = $("div[data-standard]")
      .map((_, element) => {
        const $standard = $(element);
        const standardData = $standard.attr("data-standard");
        const standardDataParsed = JSON.parse(standardData);
        const standardID = standardDataParsed.id;
        return standardID;
      })
      .toArray();
    return standards;
  } catch (error) {
    console.error(
      `Error getting standards from https://skillsengland.education.gov.uk/apprenticeships/:`,
      error
    );
    return [];
  }
}

async function getStandards(bodyArray) {
  const response = await fetch(
    "https://skillsengland.education.gov.uk/apprenticeships/download",
    {
      method: "POST",
      body: JSON.stringify(bodyArray),
      //   body: JSON.stringify([169411, 169455]),
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Content-Type": "application/json",
      },
    }
  );

  const csvData = await response.text();
  const csvWithLines = csvData.split("\n");
  const csvFirstLineRemoved = csvWithLines.slice(1).join("\n");

  const standardsJSON = [];
  fs.writeFileSync("bodyArray.csv", csvFirstLineRemoved, "utf-8");

  Readable.from(csvFirstLineRemoved)
    .pipe(csv())
    .on("data", (data) => {
      Object.keys(data).forEach((key) => {
        data[key] = data[key].replace(/\x00/g, "").trim(); // Clean up nulls and spaces
      });
      if (Object.values(data).some((value) => value.length > 0)) {
        standardsJSON.push(data);
      }
    })
    .on("end", () => {
      // console.log(standardsJSON);
      fs.writeFileSync(
        "bodyArray.json",
        JSON.stringify(standardsJSON, null, 2),
        "utf-8"
      );
    });
  return standardsJSON;
}

const bodyArray = await getBodyArray();
getStandards(bodyArray);
