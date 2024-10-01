const fs = require('fs');
function regionMap(...regionsToFetch) {
  try {
      const filePath = "public/statesByRegion.json";
      const data = fs.readFileSync(filePath, "utf8");
      const allRegions = JSON.parse(data);

      // Use allRegions directly
      const regionKeys = Object.keys(allRegions);
      
      // Creating regions object based on allRegions
      const regions = regionKeys.reduce((acc, key) => {
          acc[key] = allRegions[key] || [];
          return acc;
      }, {});

      // Flatten the regionsToFetch array
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
          return acc; // No change if region does not exist
      }, []);

      return selectedStates;
  } catch (e) {
      console.error("Error while fetching regions:", e.message);
      return null;
  }
}
module.exports = regionMap;
