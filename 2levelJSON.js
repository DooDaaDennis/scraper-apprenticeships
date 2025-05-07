const fs = require("fs");
const data = fs.readFileSync("standards.json", "utf-8");
const standards = JSON.parse(data);

console.log("Assigning and removing levels");

const transformedData = standards.map((standard) => {
  // Extract level from standardName
  const match = standard.standardName.match(/\(level (\d+)\)/);
  const level = match ? parseInt(match[1]) : "Unknown"; // Fallback if level isn't found

  return {
    standardName: standard.standardName.replace(/\s\(level \d+\)/, ""), // Remove level info from name
    standardID: standard.standardID,
    level,
    pages: standard.pages,
  };
});

// Output result
fs.writeFileSync(
  "standards.json",
  JSON.stringify(transformedData, null, 2),
  "utf-8"
);
