const fs = require("fs");

function regionMap(...regionsToFetch) {
  try {
    const filePath = "public/statesByRegion.json"; // Path to the JSON file
    const data = fs.readFileSync(filePath, "utf8"); // Read file synchronously
    const allRegions = JSON.parse(data); // Parse the JSON data

    const regionKeys = Object.keys(allRegions); // Get all region keys

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

    // Select states and return only the 'value' field from the objects
    const selectedStates = flattenedArray.reduce((acc, region) => {
      if (regions.hasOwnProperty(region)) {
        const stateValues = regions[region].map((state) => state.value); // Extract 'value' only
        return acc.concat(stateValues); // Add values to the result array
      }
      return acc;
    }, []);

    // Convert the array of state values into a comma-separated string with quotes
    const statesString = selectedStates.map((state) => `'${state}'`).join(", ");

    console.log("Selected States by Region:", statesString); // Log for debugging

    return statesString;
  } catch (e) {
    console.error("Error while fetching regions:", e.message);
    return null; // Return null if error occurs
  }
}

module.exports = regionMap;
