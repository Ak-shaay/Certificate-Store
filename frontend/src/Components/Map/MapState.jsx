import React, { useEffect, useState } from "react";
import useSWR from "swr";
import Highmaps from "highcharts/highmaps";
import Highcharts from "highcharts";
import { domain } from "../../Context/config";
import {
  Box,
  useMediaQuery,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Button } from "@mui/material";
import {
  HighchartsMapChart,
  HighmapsProvider,
  Title,
  Tooltip,
  MapSeries,
  MapNavigation,
  Credits,
  ColorAxis,
} from "react-jsx-highmaps";
import { Pane, Chart } from "react-jsx-highcharts";

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

const MapState = ({ stateName, selectedTimePeriod = TIME_PERIODS.ALL }) => {
  const [geojson, setGeojson] = useState(null);
  const [mapdata, setMapdata] = useState(null);
  const [filteredMapData, setFilteredMapData] = useState(null);
  const [pieData, setPieData] = useState(null);
  const [showIndiaMap, setShowIndiaMap] = useState(false);
  const [localTimePeriod, setLocalTimePeriod] = useState(selectedTimePeriod);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    }
    return res.json();
  };

  const { data: geojsonData, error: geojsonError } = useSWR(
    stateName
      ? (() => {
          // console.log(stateName);
          const url = `http://${domain}:8080/states/${stateName}.json`;
          // console.log("Fetching GeoJSON data from:", url);
          return url;
        })()
      : null,
    fetcher
  );

  const { data: mapdataData, error: mapdataError } = useSWR(
    stateName
      ? (() => {
          // console.log(stateName);
          const url = `http://${domain}:8080/count/${stateName}.json`;
          // console.log("Fetching GeoJSON data from:", url);
          return url;
        })()
      : null,
    fetcher
  );

  // Initialize localTimePeriod when selectedTimePeriod changes
  useEffect(() => {
    setLocalTimePeriod(selectedTimePeriod);
  }, [selectedTimePeriod]);

  // Process the map data based on the selected time period
  const processMapData = (data, timePeriod) => {
    if (!data) return null;

    return data.map((districtData) => {
      // Create a copy of the district data
      const processedDistrictData = { ...districtData };

      // For each CA, update the value based on the selected time period
      Object.keys(districtData).forEach((key) => {
        // Skip non-CA properties
        if (key === "state" || key === "color") return;

        // Check if the CA data is an array
        if (Array.isArray(districtData[key])) {
          // Update value based on selected time period
          processedDistrictData[key] = districtData[key][timePeriod];
        }
      });

      return processedDistrictData;
    });
  };

  useEffect(() => {
    if (geojsonData) setGeojson(geojsonData);
    if (mapdataData) {
      setMapdata(mapdataData);
      setFilteredMapData(processMapData(mapdataData, localTimePeriod));
    }
  }, [geojsonData, mapdataData]);

  // Update filtered data when time period changes
  useEffect(() => {
    if (mapdata) {
      setFilteredMapData(processMapData(mapdata, localTimePeriod));
    }
  }, [localTimePeriod, mapdata]);

  const handleTimePeriodChange = (event) => {
    setLocalTimePeriod(parseInt(event.target.value));
  };

  if (geojsonError || mapdataError) return <div>Error loading map data.</div>;
  if (!geojson || !filteredMapData) return <div>Loading...</div>;

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

  // Function to generate a blue color gradient based on value
  const getBlueGradientColor = (value, maxValue) => {
    // Set a default maxValue if it's not provided or is zero
    const effectiveMaxValue = maxValue <= 0 ? 1 : maxValue;

    // Normalize the value between 0 and 1
    const normalizedValue = value / effectiveMaxValue;

    // Create a blue color gradient from light to dark
    // Using a more visually appealing blue gradient
    const r = Math.round(240 - normalizedValue * 220); // Decrease red
    const g = Math.round(248 - normalizedValue * 230); // Decrease green
    const b = Math.round(255 - normalizedValue * 70); // Slight decrease in blue for darker blues

    return `rgb(${r}, ${g}, ${b})`;
  };

  const seriesData = filteredMapData.map((item) => {
    const totalValue = Object.keys(item)
      .filter(
        (key) =>
          key !== "state" && key !== "color" && typeof item[key] === "number"
      )
      .reduce((sum, key) => sum + (item[key] || 0), 0);

    return {
      district: item.state,
      value: totalValue,
      // Remove the color property - Highcharts will color based on colorAxis
    };
  });

  const joinBy = "district"; // Add this definition near your plotOptions and colorAxis variables

  const plotOptions = {
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

  const handleStateClick = (districtName) => {
    const districtData = filteredMapData.find(
      (item) => item.state === districtName
    );
    if (!districtData) return;

    const pieChartData = Object.keys(districtData)
      .filter(
        (key) =>
          key !== "state" &&
          key !== "color" &&
          typeof districtData[key] === "number" &&
          districtData[key] > 0
      )
      .map((ca) => ({
        name: ca,
        y: districtData[ca],
        color: caColorMap[ca] || districtData.color || "#ccc",
      }));

    setPieData({ districtName, pieChartData });
    displayPieChart(districtName);
  };

  const displayPieChart = (districtName) => {
    const districtData = filteredMapData.find(
      (item) => item.state === districtName
    );
    if (!districtData) return;

    const pieChartData = Object.keys(districtData)
      .filter(
        (key) =>
          key !== "state" &&
          key !== "color" &&
          typeof districtData[key] === "number" &&
          districtData[key] > 0
      )
      .map((ca) => ({
        name: ca,
        y: districtData[ca],
        color: caColorMap[ca] || districtData.color || "#ccc",
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
        text: `CA Distribution in ${districtName} ${getTimeText(
          localTimePeriod
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
        return "(All Time)";
    }
  };

  const totalCountString = `${stateName} Map - Certificates Issued: ${totalCount} ${getTimeText(
    localTimePeriod
  )}`;

  // New function to toggle India Map
  const handleIndiaMapToggle = () => {
    setShowIndiaMap(true);
  };

  // If showIndiaMap is true, render the India Map component
  if (showIndiaMap) {
    // Dynamic import of Map component
    const Map = React.lazy(() => import("../Map/Map.jsx")); // Update this import path
    return (
      <React.Suspense fallback={<div>Loading India Map...</div>}>
        <Map selectedTimePeriod={localTimePeriod} />
      </React.Suspense>
    );
  }

  return (
    <div style={{ marginTop: "2rem" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexDirection: isSmallScreen ? "column" : "row",
          gap: isSmallScreen ? 2 : 0,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleIndiaMapToggle}
            style={{ marginRight: "1rem" }}
          >
            Back to India Map
          </Button>

          <FormControl
            size="small"
            variant="outlined"
            style={{ minWidth: 150 }}
          >
            <InputLabel id="state-time-period-label">Time Period</InputLabel>
            <Select
              labelId="state-time-period-label"
              id="state-time-period-select"
              value={localTimePeriod}
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
              <MenuItem value={TIME_PERIODS.LAST_1_MONTH}>Last Month</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <HighmapsProvider Highcharts={Highmaps}>
        <HighchartsMapChart
          map={geojson}
          sx={{
            width: "100%",
            height: isSmallScreen ? 400 : 600,
          }}
        >
          <Chart
            height={isSmallScreen ? 400 : 600}
            backgroundColor="white"
            sx={{
              width: "100%",
              maxWidth: "100%",
            }}
          />
          <Title>{totalCountString}</Title>

          <Pane background={{ backgroundColor: "#ffecd1" }} />
          <Tooltip pointFormat="{point.district}: {point.value}" />
          <Credits enabled={false} />
          <MapNavigation>
            <MapNavigation.ZoomIn />
            <MapNavigation.ZoomOut />
          </MapNavigation>
          <ColorAxis
            min={Math.min(...seriesData.map((item) => item.value))}
            max={Math.max(...seriesData.map((item) => item.value))}
            stops={[
              [0, "#ffa600"],
              [0.2, "#ff7c43"],
              [0.4, "#f95d6a"],
              [0.6, "#d45087"],
              [0.8, "#a05195"],
              [1, "#003f5c"],
            ]}
          />
          <MapSeries
            name="Certificates Issued"
            data={seriesData}
            colorAxis={0} // Reference to the colorAxis by index
            joinBy="district"
            states={{
              hover: {
                color: "#ffecd1",
              },
            }}
            point={{
              events: {
                click: function () {
                  handleStateClick(this.district);
                },
              },
            }}
            dataLabels={{
              enabled: false,
              format: "{point.district}: {point.value}",
            }}
            colorByPoint={false} // Set to false when using colorAxis
          />
        </HighchartsMapChart>
      </HighmapsProvider>
    </div>
  );
};

export default MapState;
