import fs from "fs";

const allStandards = JSON.parse(
  fs.readFileSync(
    "apprenticeshipArrayProvidersEPAOsActiveApprenticesRegions.json",
    "utf8"
  )
);

// create an array

// create a variable for the sum and initialize it
let sum = 0;

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

allStandards.forEach((standard) => {
  regions.forEach((region) => {
    sum += standard[region]["activeApprentices"];
  });
});

console.log(sum); // Outputs total for "North East"
