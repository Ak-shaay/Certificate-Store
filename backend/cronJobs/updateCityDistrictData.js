const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");
const mysql = require("mysql2/promise");

// Configuration
const CACHE_FILE = path.join(__dirname, "..", "city_district_cache.json");
const COUNT_DATABASE_FOLDER = path.join(__dirname, "../public/", "count");
const INDIA_JSON_FILE = path.join(COUNT_DATABASE_FOLDER, "india.json");

// OpenStreetMap API Service
class OpenStreetMapService {
  constructor() {
    this.baseUrl = "https://nominatim.openstreetmap.org/search";
    this.userAgent = "Node.js/1.0 (harshvardhan5673@gmail.com)";
    this.cache = null;
  }

  async loadCache() {
    if (this.cache) return this.cache;

    try {
      const data = await fs.readFile(CACHE_FILE, "utf8");
      this.cache = JSON.parse(data);
      return this.cache;
    } catch (error) {
      this.cache = {};
      return this.cache;
    }
  }

  async saveCache() {
    await fs.writeFile(CACHE_FILE, JSON.stringify(this.cache, null, 2), "utf8");
  }

  async getDistrictAndState(state, city) {
    await this.loadCache();
    const cacheKey = `${city},${state}`;

    if (this.cache[cacheKey]) {
      // console.log(`Cache hit: ${cacheKey} -> ${this.cache[cacheKey]}`);
      return this.cache[cacheKey];
    }

    try {
      const url = this.constructUrl(state, city);
      const response = await this.fetchData(url);

      if (response && response.length > 0) {
        const district = this.extractDistrict(response[0]);
        const resolvedState = this.extractState(response[0]);

        if (
          district !== "District information not found" &&
          resolvedState !== "State Information not found"
        ) {
          const districtStateInfo = `${district}, ${resolvedState}`;
          this.cache[cacheKey] = districtStateInfo;
          await this.saveCache();
          return districtStateInfo;
        }
      }

      return "No results found";
    } catch (error) {
      console.error(
        `Error fetching district for ${city}, ${state}:`,
        error.message
      );
      return "Error fetching district";
    }
  }

  async getStateInfo(state) {
    await this.loadCache();

    // First check if this state exists in our cache
    for (const key in this.cache) {
      const [_, cachedState] = key.split(",");
      if (
        cachedState &&
        cachedState.trim().toLowerCase() === state.trim().toLowerCase()
      ) {
        const [__, resolvedState] = this.cache[key].split(", ");
        if (resolvedState) return resolvedState;
      }
    }

    // If not in cache, query the API directly
    try {
      const url = `${this.baseUrl}?state=${encodeURIComponent(
        state
      )}&country=India&format=json&addressdetails=1`;
      const response = await this.fetchData(url);

      if (response && response.length > 0 && response[0].address.state) {
        return response[0].address.state;
      }
    } catch (error) {
      console.error(`Error fetching state info for ${state}:`, error.message);
    }

    return state;
  }

  constructUrl(state, city) {
    const queryParams = new URLSearchParams({
      city: city,
      state: state,
      country: "India",
      format: "json",
      addressdetails: "1",
    });
    return `${this.baseUrl}?${queryParams.toString()}`;
  }

  async fetchData(url) {
    const response = await axios.get(url, {
      headers: { "User-Agent": this.userAgent },
    });
    return response.data;
  }

  extractDistrict(data) {
    return (
      data.address.district ||
      data.address.state_district ||
      data.address.county ||
      data.address.city ||
      "District information not found"
    );
  }

  extractState(data) {
    return data.address.state || "State Information not found";
  }
}

// JSON Helper Functions
async function loadJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function saveJSON(filePath, data) {
  // Ensure the directory exists
  const dirPath = path.dirname(filePath);
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }

  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

// Database Query Functions with Date Filtering
async function getIssuerCountsByStateAndCity() {
  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "dblatest",
  });

  try {
    // Calculate date thresholds
    const now = new Date();

    // Use direct SQL INTERVAL syntax for more accurate date filtering
    const [rows] = await db.execute(`
      SELECT 
        City, 
        State, 
        IssuerName,
        COUNT(*) AS TotalCount,
        SUM(CASE WHEN IssueDate >= DATE_SUB(NOW(), INTERVAL 6 MONTH) THEN 1 ELSE 0 END) AS Last6Months,
        SUM(CASE WHEN IssueDate >= DATE_SUB(NOW(), INTERVAL 3 MONTH) THEN 1 ELSE 0 END) AS Last3Months,
        SUM(CASE WHEN IssueDate >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 ELSE 0 END) AS Last1Month
      FROM cert
      GROUP BY City, State, IssuerName
    `);

    // Ensure all counts are numbers
    return rows.map((row) => ({
      ...row,
      TotalCount: Number(row.TotalCount),
      Last6Months: Number(row.Last6Months),
      Last3Months: Number(row.Last3Months),
      Last1Month: Number(row.Last1Month),
    }));
  } finally {
    await db.end();
  }
}

async function getIssuerCountsByState() {
  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "dblatest",
  });

  try {
    // Using direct SQL INTERVAL syntax for more accurate date filtering
    const [rows] = await db.execute(`
      SELECT 
        State, 
        IssuerName,
        COUNT(*) AS TotalCount,
        SUM(CASE WHEN IssueDate >= DATE_SUB(NOW(), INTERVAL 6 MONTH) THEN 1 ELSE 0 END) AS Last6Months,
        SUM(CASE WHEN IssueDate >= DATE_SUB(NOW(), INTERVAL 3 MONTH) THEN 1 ELSE 0 END) AS Last3Months,
        SUM(CASE WHEN IssueDate >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 ELSE 0 END) AS Last1Month
      FROM cert
      GROUP BY State, IssuerName
    `);

    // Ensure all counts are numbers
    return rows.map((row) => ({
      ...row,
      TotalCount: Number(row.TotalCount),
      Last6Months: Number(row.Last6Months),
      Last3Months: Number(row.Last3Months),
      Last1Month: Number(row.Last1Month),
    }));
  } finally {
    await db.end();
  }
}

// Main Functions
async function updateStateJSONFiles() {
  const osmService = new OpenStreetMapService();
  const cityStateIssuerCounts = await getIssuerCountsByStateAndCity();

  // Group by state for more efficient processing
  const stateFiles = {};

  for (const entry of cityStateIssuerCounts) {
    const {
      City: city,
      State: state,
      IssuerName: issuer,
      TotalCount: totalCount,
      Last6Months: last6Months,
      Last3Months: last3Months,
      Last1Month: last1Month,
    } = entry;

    const districtStateInfo = await osmService.getDistrictAndState(state, city);
    // console.log(`Mapped ${city}, ${state} -> ${districtStateInfo}`);

    let [district, resolvedState] =
      districtStateInfo !== "No results found" &&
      districtStateInfo !== "Error fetching district"
        ? districtStateInfo.split(", ")
        : ["Others", state];

    if (!resolvedState) resolvedState = "Others"; // Default if state is missing

    const stateFileName =
      resolvedState.toLowerCase().replace(/\s+/g, "") + ".json";

    // Initialize the state file data if not already done
    if (!stateFiles[stateFileName]) {
      const stateFilePath = path.join(COUNT_DATABASE_FOLDER, stateFileName);
      stateFiles[stateFileName] = {
        path: stateFilePath,
        data: await loadJSON(stateFilePath),
      };
    }

    // Get the state file data
    let stateData = stateFiles[stateFileName].data;

    // Find or create the district entry
    let districtEntry = stateData.find((entry) => entry.state === district);
    if (!districtEntry) {
      districtEntry = { state: district };
      stateData.push(districtEntry);
    }

    // Store count as an array of numbers [totalCount, last6months, last3months, last1month]
    districtEntry[issuer] = [totalCount, last6Months, last3Months, last1Month];
  }

  // Save all state files
  for (const stateFileName in stateFiles) {
    const { path, data } = stateFiles[stateFileName];
    await saveJSON(path, data);
    // console.log(`Updated ${stateFileName} with ${data.length} districts`);
  }
}

async function updateIndiaJSON() {
  const osmService = new OpenStreetMapService();
  const stateIssuerCounts = await getIssuerCountsByState();
  let indiaData = await loadJSON(INDIA_JSON_FILE);

  // Create a map for easier lookup and updates
  const stateMap = indiaData.reduce((acc, entry) => {
    acc[entry.state.toLowerCase().replace(/\s+/g, "")] = entry;
    return acc;
  }, {});

  for (const entry of stateIssuerCounts) {
    const {
      State,
      IssuerName,
      TotalCount,
      Last6Months,
      Last3Months,
      Last1Month,
    } = entry;

    // Get normalized state name from OpenStreetMap
    const normalizedState = await osmService.getStateInfo(State);
    const key = normalizedState.toLowerCase().replace(/\s+/g, "");

    if (!stateMap[key]) {
      stateMap[key] = {
        state: normalizedState,
        // Preserve color if exists
        color: stateMap[key]?.color,
      };
    }

    // Store count as an array [totalCount, last6months, last3months, last1month]
    stateMap[key][IssuerName] = [
      TotalCount,
      Last6Months,
      Last3Months,
      Last1Month,
    ];
  }

  await saveJSON(INDIA_JSON_FILE, Object.values(stateMap));
  // console.log("India JSON updated successfully");
}

// Main execution function - now exported for cron job usage
async function updateCityDistrictData() {
  try {
    // Create count database folder if it doesn't exist
    try {
      await fs.access(COUNT_DATABASE_FOLDER);
    } catch (error) {
      await fs.mkdir(COUNT_DATABASE_FOLDER, { recursive: true });
    }

    // console.log(
    //   `[${new Date().toISOString()}] Starting city-district data update process...`
    // );

    // Update state JSON files with district-level data
    await updateStateJSONFiles();

    // Update the india.json file with state-level data
    await updateIndiaJSON();

    // console.log(
    //   `[${new Date().toISOString()}] City-district data update process completed successfully!`
    // );
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error in city-district data update process:`,
      error
    );
    throw error; // Re-throw to handle in cron job
  }
}

// Export the main function for use in cron jobs
module.exports = { updateCityDistrictData };

// If this file is run directly (not imported), execute the main function
if (require.main === module) {
  updateCityDistrictData().catch(console.error);
}
