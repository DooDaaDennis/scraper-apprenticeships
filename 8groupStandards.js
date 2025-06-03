import fs from "fs";

const apprenticeships = JSON.parse(fs.readFileSync("bodyArray.json", "utf8"));

apprenticeships.sort((a, b) => {
  return parseFloat(b["Version Number"]) - parseFloat(a["Version Number"]);
});

const keysToRemove = [
  "Version Number",
  "Proposal Approved",
  "Standard Approved",
  "Assessment Plan Approved",
  "Funding Approved",
  "Status",
  "Approved for Delivery Date",
  "Retired date",
  "Withdrawn date",
  "Maximum Funding (£)",
  "Last Updated",
  "Link",
  "Typical Duration",
  "Core and options",
  "Options",
  "Banners",
  "Integrated Degree",
  "Integration",
  "Integrated Apprenticeship",
];

const groupedByReference = apprenticeships.reduce((acc, item) => {
  if (!acc[item.Reference]) {
    acc[item.Reference] = { ...item, versions: [] };

    // Remove all keys dynamically
    keysToRemove.forEach((key) => delete acc[item.Reference][key]);
  }

  acc[item.Reference].versions.push(
    Object.fromEntries(
      Object.entries(item).filter(([key]) => keysToRemove.includes(key))
    )
  );

  return acc;
}, {});

const apprenticeshipArray = Object.keys(groupedByReference).map((key) => ({
  reference: key,
  ...groupedByReference[key],
}));

fs.writeFileSync(
  "apprenticeshipArray.json",
  JSON.stringify(apprenticeshipArray, null, 2),
  "utf8"
);
// console.log(Object.values(groupedByReference));
