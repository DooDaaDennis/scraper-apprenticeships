use("Apprenticeships");

//Update all documents to convert dateLogged from string to Date type
// db.Scrape.updateMany(
//   {},
//   [
//     {
//       $set: {
//         dateLogged: { $toDate: "$dateLogged" } // Converts string date to Date type
//       }
//     }
//   ]
// );


// Update all documents to convert EPAOversions from string to float 
// db.Scrape.updateMany(
//   {},
//   [
//     {
//       $set: {
//         EPAOs: {
//           $map: {
//             input: "$EPAOs",
//             as: "epao",
//             in: {
//               $mergeObjects: [
//                 "$$epao",
//                 {
//                   EPAOversions: {
//                     $map: {
//                       input: "$$epao.EPAOversions",
//                       as: "version",
//                       in: { $toDouble: "$$version" } // Converts each version to a float
//                     }
//                   }
//                 }
//               ]
//             }
//           }
//         }
//       }
//     }
//   ]
// );

// Update all documents to convert Version Number in versions array from string to float
// db.Scrape.updateMany(
//   {},
//   [
//     {
//       $set: {
//         versions: {
//           $map: {
//             input: "$versions",
//             as: "version",
//             in: {
//               $mergeObjects: [
//                 "$$version",
//                 {
//                   "Maximum Funding (£)": {
//                     $convert: {
//                       input: "$$version.Maximum Funding (£)",
//                       to: "double",
//                       onError: null, 
//                       onNull: null
//                     }
//                   }
//                 }
//               ]
//             }
//           }
//         }
//       }
//     }
//   ]
// );

db.Scrape.updateMany({}, { $unset: { EPAOversions: "" } });

// db.Scrape.updateMany(
//   {},
//   [
//     {
//       $set: {
//         versions: {
//           $map: {
//             input: "$versions",
//             as: "version",
//             in: {
//               $mergeObjects: [
//                 "$$version",
//                 {
//                   "Maximum Funding (£)": {
//                     $convert: {
//                       input: "$$version.Maximum Funding (£)",
//                       to: "int",
//                       onError: null,
//                       onNull: null
//                     }
//                   },
//                   "Typical Duration": {
//                     $convert: {
//                       input: "$$version.Typical Duration",
//                       to: "int",
//                       onError: null,
//                       onNull: null
//                     }
//                   },
//                   "Approved for Delivery Date": {
//                     $convert: {
//                       input: "$$version.Approved for Delivery Date",
//                       to: "date",
//                       onError: null,
//                       onNull: null
//                     }
//                   },
//                   "Retired date": {
//                     $convert: {
//                       input: "$$version.Retired date",
//                       to: "date",
//                       onError: null,
//                       onNull: null
//                     }
//                   },
//                   "Withdrawn date": {
//                     $convert: {
//                       input: "$$version.Withdrawn date",
//                       to: "date",
//                       onError: null,
//                       onNull: null
//                     }
//                   },
//                   "Last Updated": {
//                     $convert: {
//                       input: "$$version.Last Updated",
//                       to: "date",
//                       onError: null,
//                       onNull: null
//                     }
//                   }
//                 }
//               ]
//             }
//           }
//         },         Level: {
//           $convert: {
//             input: "$Level",
//             to: "int",
//             onError: null,
//             onNull: null
//           }
//         }
//       }
//     }
//   ]
// );