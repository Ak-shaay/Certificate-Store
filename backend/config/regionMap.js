function regionMap(...regionsToFetch) {
  const regions = {
    North: [
      "Chandigarh",
      "Delhi",
      'Haryana',
      "Himachal Pradesh",
      "Jammu and Kashmir",
      "Punjab",
      "Uttarakhand",
      "Uttar Pradesh",
      
    ],
    South: [
      "Andhra Pradesh",
      "Karnataka",
      "Kerala",
      "Telangana",
      "Pondicherry",
      "Tamil Nadu ",
      "Tamilnadu"
    ],
    East: [
      "Bihar",
      "Jharkhand",
      "Odisha",
      "West Bengal",
     
      

    ],
    West: ["Goa", "Gujarat", "Maharashtra", "Rajasthan"],
    Northeast: [
      "Arunachal Pradesh",
      "Assam",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Sikkim",
      "Tripura"
    ],
    Central: ["Chhattisgarh","Madhya Pradesh"],
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
