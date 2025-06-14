import csv from "csv-parser";
import { Readable } from "stream";
import fs from "fs";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const vacanciesCSV = fs.readFileSync(
  "./inputFiles-apprenticeshipData/vacancies.csv",
  "utf8"
);
const vacanciesJSON = [];

const filteredVacanciesJSON = [];

Readable.from(vacanciesCSV)
  .pipe(csv())
  .on("data", (data) => {
    Object.keys(data).forEach((key) => {
      data[key] = data[key].replace(/\x00/g, "").trim(); // Clean up nulls and spaces
    });

    const filteredData = {
      vacancy_reference_number: data.vacancy_reference_number,
      date_posted: data.date_posted,
      application_closing_date: data.application_closing_date,
      employer_full_name: data.employer_full_name,
      expected_duration: data.expected_duration,
      expected_start_date: data.expected_start_date,
      framework_or_standard_name: data.framework_or_standard_name,
      hours_per_week: data.hours_per_week,
      number_of_positions: data.number_of_positions,
      provider_full_name: data.provider_full_name,
      vacancy_postcode: data.vacancy_postcode,
      wage: data.wage,
      wage_type: data.wage_type,
    };

    if (Object.values(filteredData).some((value) => value.length > 0)) {
      filteredVacanciesJSON.push(filteredData);
    }
  })
  .on("end", () => {
    console.log("Filtered JSON created");
    // fs.writeFileSync(
    //   "filteredVacanciesJSON.json",
    //   JSON.stringify(filteredVacanciesJSON, null, 2),
    //   "utf-8"
    // );
  });

async function cleanDatabase(collection) {
  try {
    await collection.updateMany({}, [
      {
        $set: {
          date_posted: {
            $cond: [
              { $eq: [{ $type: "$date_posted" }, "string"] },
              {
                $dateFromString: {
                  dateString: "$date_posted",
                  format: "%d/%m/%Y",
                  onError: null,
                  onNull: null,
                },
              },
              "$date_posted",
            ],
          },
          expected_start_date: {
            $cond: [
              { $eq: [{ $type: "$expected_start_date" }, "string"] },
              {
                $dateFromString: {
                  dateString: "$expected_start_date",
                  format: "%d/%m/%Y",
                  onError: null,
                  onNull: null,
                },
              },
              "$expected_start_date",
            ],
          },
          application_closing_date: {
            $cond: [
              { $eq: [{ $type: "$application_closing_date" }, "string"] },
              {
                $dateFromString: {
                  dateString: "$application_closing_date",
                  format: "%d/%m/%Y",
                  onError: null,
                  onNull: null,
                },
              },
              "$application_closing_date",
            ],
          },
          number_of_positions: {
            $cond: [
              { $eq: [{ $type: "$number_of_positions" }, "string"] },
              {
                $convert: {
                  input: "$number_of_positions",
                  to: "int",
                  onError: null,
                  onNull: null,
                },
              },
              "$number_of_positions",
            ],
          },
          wage: {
            $cond: [
              { $eq: [{ $type: "$wage" }, "string"] },
              {
                $convert: {
                  input: "$wage",
                  to: "int",
                  onError: null,
                  onNull: null,
                },
              },
              "$wage",
            ],
          },
          hours_per_week: {
            $cond: [
              { $eq: [{ $type: "$hours_per_week" }, "string"] },
              {
                $convert: {
                  input: "$hours_per_week",
                  to: "int",
                  onError: null,
                  onNull: null,
                },
              },
              "$hours_per_week",
            ],
          },
        },
      },
    ]);
  } catch (error) {
    console.error("Error cleaning database:", error);
  }
}

async function addToDatabase() {
  const client = new MongoClient(process.env.DATABASE);
  try {
    console.log("Connecting to MongoDB");
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("Apprenticeships");
    const collection = db.collection("Vacancies");

    console.log("Upserting documents...");

    const operations = filteredVacanciesJSON.map((doc) => ({
      updateOne: {
        filter: { vacancy_reference_number: doc.vacancy_reference_number },
        update: { $setOnInsert: doc },
        upsert: true,
      },
    }));

    await collection.bulkWrite(operations);
    console.log("Documents upserted successfully!");

    console.log("Cleaning database...");
    await cleanDatabase(collection);
    console.log("Database cleaned successfully!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

addToDatabase();
