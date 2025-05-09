const dbname = db.getSiblingDB("CSV");
const final = dbname.getCollection("app-narts-provider-level-fwk-std");

const fs = require("fs");

const data = fs.readFileSync("app-narts-provider-level-fwk-std.csv", "utf8");
const rows = data.split("\n");

const fieldnames = rows[0].split(",");
const results = [];

for (let i = 1; i < rows.length; i++) {
  const values = rows[i].split(",");
  const documents = {};

  for (let j = 0; j < fieldnames.length; j++) {
    documents[fieldnames[j]] = values[j];
  }
  console.log(`line ${i + 1} of ${rows.length}`);
  results.push(documents);
}
final.insertMany(results);

console.log("documents inserted successfully!");
