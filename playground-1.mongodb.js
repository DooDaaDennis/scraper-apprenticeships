use("Apprenticeships");

db.Scrape.aggregate([
  {
    $match: { "EPAOs.EPAOName": { $regex: "Accounting Techn", $options: "i" } },
  },
  { $unwind: "$providers" },
  {
    $project: {
      _id: 0,
      providerName: "$providers.providerName",
      providerID: "$providers.providerID",
      providerLink: "$providers.providerLink",
    },
  },
]);
