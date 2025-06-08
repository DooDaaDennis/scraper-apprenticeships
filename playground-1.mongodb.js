use("Apprenticeships");
db.Scrape.updateMany(
  {},
  [
    {
      $set: {
        dateLogged: { $toDate: "$dateLogged" } // Converts string date to Date type
      }
    }
  ]
);
// db.Scrape.updateMany(
//   { _id: { $in: db.Scrape.find().map(obj => obj._id) } },
//   [{ $set: { dateLogged: { $toDate: "$dateLogged" } } }]);

// db.Scrape.updateOne(
//   { _id: ObjectId('6833412d3e217bdba3c80282') },
//   { $set: { dateLogged: "2025-05-25T16:11:24.517Z"} }
// );