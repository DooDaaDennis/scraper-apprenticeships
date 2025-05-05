const axios = require("axios");
async function getProviders(standard) {
  const { data } = await axios.get(
    `https://findapprenticeshiptraining.apprenticeships.education.gov.uk${standard.link}/providers`
  );
  console.log(data);
}

const myStandard = { heading: "iasdjfpodis", link: "/courses/447" };
getProviders(myStandard);
