const fs = require("fs");
const csvToJson = require("convert-csv-to-json");

let fileInputName = "app-narts-provider-level-fwk-std.csv";
let fileOutputName = "app-narts-provider-level-fwk-std.json";

csvToJson.fieldDelimiter(","); // Ensure CSV is split correctly by commas
csvToJson.formatValueByType(); // Ensures numbers are properly converted

let csvData = fs.readFileSync("app-narts-provider-level-fwk-std.csv", "utf8");
csvData = csvData.replace(/\"/g, ""); // Remove all quotation marks
fs.writeFileSync("app-narts-provider-level-fwk-std.csv", csvData, "utf8");

csvToJson.generateJsonFileFromCsv(fileInputName, fileOutputName);

console.log("Conversion successful!");
