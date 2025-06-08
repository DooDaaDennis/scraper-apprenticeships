use("Apprenticeships");

db.Scrape.deleteMany({
  dateLogged: new Date("2025-06-08T15:40:12.491+00:00") // Match and delete documents with this exact date
});