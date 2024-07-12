function regionMap(...regionsToFetch) {
  const regions = {
    North: [
      "Delhi",
      "Haryana",
      "Himachal Pradesh",
      "Jammu and Kashmir",
      "Punjab",
      "Rajasthan",
      "Uttarakhand",
      "Uttar Pradesh",
      "DL",
      "HR",
      "HP",
      "JK",
      "PB",
      "RJ",
      "UK",
      "UP",
    ],
    South: [
      "AP",
      "KA",
      "KL",
      "TN",
      "TG",
      "Andhra Pradesh",
      "Karnataka",
      "Kerala",
      "Tamil Nadu",
      "Telangana",
    ],
    East: [
      "Bihar",
      "Jharkhand",
      "Odisha",
      "West Bengal",
      "BR",
      "JH",
      "OD",
      "WB",
    ],
    West: ["Goa", "Gujarat", "Maharashtra", "GA", "GJ", "MH"],
    Northeast: [
      "Arunachal Pradesh",
      "Assam",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Sikkim",
      "Tripura",
      "AR",
      "AS",
      "MN",
      "ML",
      "MZ",
      "NL",
      "SK",
      "TR",
    ],
    Central: ["Chhattisgarh", "Madhya Pradesh", "CG", "MP"],
  };
  const flattenedArray = regionsToFetch.reduce(
    (acc, curr) => acc.concat(curr),
    []
  );
  // Iterate over each region passed as parameter
  const selectedStates = flattenedArray.reduce((acc, region) => {
    if (regions.hasOwnProperty(region)) {
      const states = regions[region].map((state) => `"${state}"`);
      return acc.concat(states);
    }
    return acc;
  }, []);
  return selectedStates;
}

module.exports = regionMap;
