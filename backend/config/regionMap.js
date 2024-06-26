function regionMap(...regionsToFetch){
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
    ],
    South: ["Andhra Pradesh", "Karnataka", "Kerala", "Tamil Nadu", "Telangana"],
    East: ["Bihar", "Jharkhand", "Odisha", "West Bengal"],
    West: ["Goa", "Gujarat", "Maharashtra"],
    Northeast: [
      "Arunachal Pradesh",
      "Assam",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Sikkim",
      "Tripura",
    ],
    Central: ["Chhattisgarh", "Madhya Pradesh"],
  };
  const flattenedArray = regionsToFetch.reduce((acc, curr) => acc.concat(curr), []);
  // Iterate over each region passed as parameter
  const selectedStates = flattenedArray.reduce((acc, region) => {
    if (regions.hasOwnProperty(region)) {
      const states = regions[region].map(state => `"${state}"`);
      return acc.concat(states);
    }
    return acc;
  }, []);
  return selectedStates;
};

module.exports = regionMap;