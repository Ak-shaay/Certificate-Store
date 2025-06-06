import React, { useState, useEffect } from "react";
import MapState from "./MapState"; // Import MapState component
import Highmaps from "highcharts/highmaps";
import Highcharts from "highcharts";
import {
  Box,
  useMediaQuery,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  HighchartsMapChart,
  HighmapsProvider,
  Title,
  Tooltip,
  MapSeries,
  MapNavigation,
  Credits,
  Chart,
} from "react-jsx-highmaps";
import useSWR from "swr";
import { domain } from "../../Context/config";
import InstructionsPanel from "../InstructionPanel/InstructionsPanel";
import HoverInfoPanel from "../HoverInfo/HoverInfo";

const caColorMap = {
  "CCA India 2022": "#ff7c43", // Based on CA1
  Safescrypt: "#f95d6a", // Based on CA2
  IDRBT: "#d45087", // Based on CA3
  "(n)Code Solutions": "#a05195", // Based on RADHERADHE
  "e-Mudhra": "#a1ff33", // Based on CA5
  CDAC: "#ff7c43", // Repeat CA1
  Capricorn: "#f95d6a", // Repeat CA2
  "Protean (NSDL e-Gov)": "#d45087", // Repeat CA3
  "Vsign (Verasys)": "#a05195", // Repeat RADHERADHE
  "Indian Air Force": "#a1ff33", // Repeat CA5
  CSC: "#ff7c43", // Repeat CA1
  "RISL (RajComp)": "#f95d6a", // Repeat CA2
  "Indian Army": "#d45087", // Repeat CA3
  IDSign: "#a05195", // Repeat RADHERADHE
  "CDSL Ventures": "#a1ff33", // Repeat CA5
  "Panta Sign": "#ff7c43", // Repeat CA1
  "xtra Trust": "#f95d6a", // Repeat CA2
  "Indian Navy": "#d45087", // Repeat CA3
  ProDigiSign: "#a05195", // Repeat RADHERADHE
  SignX: "#a1ff33", // Repeat CA5
  JPSL: "#ff7c43", // Repeat CA1
  "Care 4 Sign": "#f95d6a", // Repeat CA2
  IGCAR: "#d45087", // Repeat CA3
  "Speed Signa": "#a05195", // Repeat RADHERADHE
};

// Time period options
const TIME_PERIODS = {
  ALL: 0,
  LAST_6_MONTHS: 1,
  LAST_3_MONTHS: 2,
  LAST_1_MONTH: 3,
};

// Define instruction sets
const mapInstructions = [
  { action: "Click", description: "View CA distribution" },
  { action: "Double-click", description: "District-wise State map" },
  { action: "Hover", description: "State details" },
];

const Map = () => {
  const [geojson, setGeojson] = useState(null);
  const [mapdata, setMapdata] = useState(null);
  const [filteredMapData, setFilteredMapData] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [hoveredStateData, setHoveredStateData] = useState(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(
    TIME_PERIODS.ALL
  );
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  console.log("Map 😉");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  let clickTimer = null;

  const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    }
    return res.json();
  };

  const {
    data: geojsonData,
    error: geojsonError,
    isLoading: geojsonLoading,
  } = useSWR(`http://${domain}:8080/states/india.json`, fetcher);

  const {
    data: mapdataData,
    error: mapdataError,
    isLoading: mapdataLoading,
  } = useSWR(`http://${domain}:8080/count/india.json`, fetcher);

  // Process the map data based on the selected time period
  const processMapData = (data, timePeriod) => {
    if (!data) return null;

    return data.map((stateData) => {
      // Create a copy of the state data
      const processedStateData = { ...stateData };

      // For each CA, update the value based on the selected time period
      Object.keys(stateData).forEach((key) => {
        // Skip non-CA properties
        if (key === "state" || key === "color") return;

        // Check if the CA data is an array
        if (Array.isArray(stateData[key])) {
          // Update value based on selected time period
          processedStateData[key] = stateData[key][timePeriod];
        }
      });

      return processedStateData;
    });
  };

  // Reset hover state on component mount/reload
  useEffect(() => {
    setHoveredStateData(null);
  }, []);

  useEffect(() => {
    let dataReady = false;

    if (geojsonData && !geojsonError) {
      setGeojson(geojsonData);
    }

    if (mapdataData && !mapdataError) {
      setMapdata(mapdataData);
      const processedData = processMapData(mapdataData, selectedTimePeriod);
      setFilteredMapData(processedData);
      dataReady = true;
    }

    // Set data loaded state only when both datasets are ready
    if (geojsonData && mapdataData && dataReady) {
      setIsDataLoaded(true);
    }
  }, [geojsonData, mapdataData, geojsonError, mapdataError]);

  // Update filtered data when time period changes
  useEffect(() => {
    if (mapdata) {
      const processedData = processMapData(mapdata, selectedTimePeriod);
      setFilteredMapData(processedData);
    }
  }, [selectedTimePeriod, mapdata]);

  const handleTimePeriodChange = (event) => {
    setSelectedTimePeriod(parseInt(event.target.value));
    // Reset hover state when time period changes
    setHoveredStateData(null);
  };

  // Show loading state
  if (geojsonLoading || mapdataLoading || !isDataLoaded) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
          fontSize: "18px",
          color: "#666",
        }}
      >
        Loading map data...
      </Box>
    );
  }

  // Show error state
  if (geojsonError || mapdataError) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
          fontSize: "18px",
          color: "#d32f2f",
        }}
      >
        Error loading map data. Please try again.
      </Box>
    );
  }

  // Don't render until all data is loaded
  if (!geojson || !filteredMapData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
          fontSize: "18px",
          color: "#666",
        }}
      >
        Preparing map...
      </Box>
    );
  }

  const totalCount = filteredMapData.reduce((sum, item) => {
    return (
      sum +
      Object.keys(item)
        .filter(
          (key) =>
            key !== "state" && key !== "color" && typeof item[key] === "number"
        )
        .reduce((acc, key) => acc + (item[key] || 0), 0)
    );
  }, 0);

  const seriesData = filteredMapData.map((item) => ({
    st_nm: item.state,
    value: Object.keys(item)
      .filter((key) => key !== "state" && key !== "color")
      .reduce(
        (sum, key) => sum + (typeof item[key] === "number" ? item[key] : 0),
        0
      ),
    color: item.color,
  }));

  const joinBy = "st_nm";
  const plotOptions = {
    pie: {
      size: isSmallScreen ? "80%" : "100%",
    },
    map: {
      allAreas: true,
      joinBy: joinBy,
      dataLabels: {
        enabled: true,
        format: `{point.${joinBy}}: {point.value}`,
      },
    },
  };

  const colorAxis = {
    min: 0,
    max: totalCount / 10,
    stops: [
      [0, "#ffa600"],
      [0.14, "#ff7c43"],
      [0.28, "#f95d6a"],
      [0.42, "#d45087"],
      [0.57, "#a05195"],
      [0.71, "#665191"],
      [0.85, "#2f4b7c"],
      [1, "#003f5c"],
    ],
  };

  const handleStateClick = (stateName) => {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      handleStateDoubleClick(stateName);
    } else {
      clickTimer = setTimeout(() => {
        displayPieChart(stateName);
        clickTimer = null;
      }, 250);
    }
  };

  const handleStateDoubleClick = (stateName) => {
    setSelectedState(stateName.toLowerCase().replace(/\s/g, ""));
  };

  const displayPieChart = (stateName) => {
    const stateData = filteredMapData.find((item) => item.state === stateName);
    if (!stateData) return;

    const pieChartData = Object.keys(stateData)
      .filter(
        (key) =>
          key !== "state" &&
          key !== "color" &&
          typeof stateData[key] === "number" &&
          stateData[key] > 0
      )
      .map((ca) => ({
        name: ca,
        y: stateData[ca],
        color: caColorMap[ca] || stateData.color || "#ccc",
      }));

    if (pieChartData.length === 0) return; // Avoid rendering an empty pie chart

    let pieContainer = document.getElementById("popup-pie-container");
    if (!pieContainer) {
      pieContainer = document.createElement("div");
      pieContainer.id = "popup-pie-container";
      document.body.appendChild(pieContainer);
    } else {
      pieContainer.innerHTML = "";
    }

    // Use MUI's Box for responsive styling
    pieContainer.innerHTML = `
      <div id="popup-pie-container-inner" style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
        z-index: 1000;
        overflow: auto;
        padding: 20px;
      ">
        <button id="close-pie" style="
          position: absolute;
          top: 10px;
          right: 10px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 5px 10px;
          cursor: pointer;
          font-size: 12px;
        ">✖</button>
        <div id="popup-pie" style="margin-top: 20px;"></div>
      </div>
    `;

    const isSmallScreen = window.innerWidth < 600;

    Highcharts.chart("popup-pie", {
      chart: { type: "pie" },
      title: {
        text: `CA Distribution in ${stateName} ${getTimeText(
          selectedTimePeriod
        )}`,
        style: { fontSize: isSmallScreen ? "16px" : "18px" },
      },
      credits: { enabled: false },
      tooltip: { pointFormat: "{series.name}: <b>{point.y}</b>" },
      series: [
        {
          name: "Certificates Issued",
          data: pieChartData,
        },
      ],
      responsive: {
        rules: [
          {
            condition: { maxWidth: 600 },
            chartOptions: {
              legend: {
                align: "center",
                verticalAlign: "bottom",
                layout: "horizontal",
              },
              title: {
                style: { fontSize: isSmallScreen ? "14px" : "16px" },
              },
            },
          },
        ],
      },
    });

    // Attach close button event listener correctly
    document.getElementById("close-pie").addEventListener("click", () => {
      pieContainer.remove();
    });
  };

  const getTimeText = (timePeriod) => {
    switch (timePeriod) {
      case TIME_PERIODS.LAST_6_MONTHS:
        return "(Last 6 Months)";
      case TIME_PERIODS.LAST_3_MONTHS:
        return "(Last 3 Months)";
      case TIME_PERIODS.LAST_1_MONTH:
        return "(Last Month)";
      default:
        return "(All)";
    }
  };

  const handleMouseOver = (stateName) => {
    const stateData = filteredMapData.find((item) => item.state === stateName);
    setHoveredStateData(stateData);
  };

  return (
    <div>
      {!selectedState ? (
        <Box sx={{ width: "100%" }}>
          {/* Centered Time period selection with proper spacing */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "left",
              alignItems: "center",
              mb: 4, // Increased bottom margin for better spacing
              mt: 2, // Added top margin
            }}
          >
            <Box sx={{ width: isSmallScreen ? "100%" : "300px" }}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel id="time-period-label">Time Period</InputLabel>
                <Select
                  labelId="time-period-label"
                  id="time-period-select"
                  value={selectedTimePeriod}
                  onChange={handleTimePeriodChange}
                  label="Time Period"
                >
                  <MenuItem value={TIME_PERIODS.ALL}>All Time</MenuItem>
                  <MenuItem value={TIME_PERIODS.LAST_6_MONTHS}>
                    Last 6 Months
                  </MenuItem>
                  <MenuItem value={TIME_PERIODS.LAST_3_MONTHS}>
                    Last 3 Months
                  </MenuItem>
                  <MenuItem value={TIME_PERIODS.LAST_1_MONTH}>
                    Last Month
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Main content area with map and side panels */}
          <Box
            sx={{
              display: "flex",
              flexDirection: isSmallScreen ? "column" : "row",
              gap: 2,
              minHeight: isSmallScreen ? "auto" : "600px", // Prevent layout shift
            }}
          >
            {/* Map container */}
            <Box
              sx={{
                flex: isSmallScreen ? 1 : 3,
                minHeight: isSmallScreen ? "400px" : "600px", // Prevent layout shift
              }}
            >
              <HighmapsProvider Highcharts={Highmaps}>
                <HighchartsMapChart
                  map={geojson}
                  sx={{
                    width: "100%",
                    height: isSmallScreen ? 400 : 600,
                  }}
                >
                  {/* Map components - updated with mouseOver event */}
                  <Chart
                    height={isSmallScreen ? 400 : 600}
                    backgroundColor="white"
                    sx={{
                      width: "100%",
                      maxWidth: "100%",
                    }}
                  />
                  <Title>{`India Map - Certificates Issued: ${totalCount.toLocaleString()} ${getTimeText(
                    selectedTimePeriod
                  )}`}</Title>

                  <Tooltip pointFormat="{point.st_nm}: {point.value}" />
                  <Credits enabled={false} />
                  <MapNavigation>
                    <MapNavigation.ZoomIn />
                    <MapNavigation.ZoomOut />
                  </MapNavigation>
                  <MapSeries
                    name="Certificates Issued"
                    data={seriesData}
                    colorAxis={colorAxis}
                    joinBy="st_nm"
                    states={{ hover: { color: "#ffecd1" } }}
                    point={{
                      events: {
                        click: function () {
                          handleStateClick(this.st_nm);
                        },
                        mouseOver: function () {
                          handleMouseOver(this.st_nm);
                        },
                      },
                    }}
                    dataLabels={{
                      enabled: false,
                      format: "{point.st_nm}: {point.value}",
                    }}
                    colorByPoint={true}
                  />
                </HighchartsMapChart>
              </HighmapsProvider>
            </Box>

            {/* Right sidebar with state info and instructions */}
            <Box
              sx={{
                flex: isSmallScreen ? 1 : 1,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                justifyContent: "space-around",
                minHeight: isSmallScreen ? "auto" : "600px", // Prevent layout shift
              }}
            >
              {/* Hover information panel */}
              <HoverInfoPanel
                stateData={hoveredStateData}
                noDataText="state"
                nameProperty="state"
              />

              {/* Instructions panel */}
              <InstructionsPanel instructions={mapInstructions} />
            </Box>
          </Box>
        </Box>
      ) : (
        <MapState
          stateName={selectedState}
          selectedTimePeriod={selectedTimePeriod}
        />
      )}
    </div>
  );
};

export default Map;
