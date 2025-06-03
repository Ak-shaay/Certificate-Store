import React, { useState } from "react";
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
// Add this component to display instructions
const InstructionsPanel = () => {
  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid #fff",
        borderRadius: 1,
        backgroundColor: "#fff",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <h3 style={{ margin: "0 0 16px 0" }}>Map Instructions</h3>
      <p>
        <strong>Click</strong> on a state to display CA distribution.
      </p>
      <p>
        <strong>Double click</strong> on a state to view the district wise state
        map.
      </p>
    </Box>
  );
};
const HoverInfoPanel = ({ stateData }) => {
  if (!stateData) {
    return (
      <Box
        sx={{
          p: 3,
          border: "1px solid #e0e7ff",
          borderRadius: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          height: "100%",
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: 3,
          },
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            zIndex: 1,
            color: "white",
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%": { transform: "scale(1)", opacity: 0.7 },
                "50%": { transform: "scale(1.05)", opacity: 1 },
                "100%": { transform: "scale(1)", opacity: 0.7 },
              },
            }}
          >
            🗺️
          </Box>
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "500",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Hover over a state to explore certificate distribution
          </p>
        </Box>
      </Box>
    );
  }

  // Filter out state and color properties and non-numeric values
  const caData = Object.entries(stateData)
    .filter(
      ([key, value]) =>
        key !== "state" &&
        key !== "color" &&
        typeof value === "number" &&
        value > 0
    )
    .sort((a, b) => b[1] - a[1]); // Sort by value in descending order

  const totalCertificates = caData.reduce((sum, [_, value]) => sum + value, 0);
  const maxValue = caData.length > 0 ? caData[0][1] : 0;

  return (
    <Box
      sx={{
        p: 0,
        border: "1px solid #e0e7ff",
        borderRadius: 3,
        background:
          "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
        height: "450px", // Fixed height instead of 100%
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1), 0 6px 12px rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 15px 35px rgba(0,0,0,0.15), 0 8px 15px rgba(0,0,0,0.1)",
        },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          p: 2.5,
          color: "white",
          position: "relative",
          flexShrink: 0, // Prevents header from shrinking
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background:
              "linear-gradient(90deg, #ff7c43, #f95d6a, #d45087, #a05195)",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            📍
          </Box>
          <Box>
            <h3
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "600",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {stateData.state}
            </h3>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "14px",
                opacity: 0.9,
                fontWeight: "400",
              }}
            >
              Certificate Distribution
            </p>
          </Box>
        </Box>
      </Box>

      {/* Total Count Section */}
      <Box sx={{ p: 2.5, pb: 1.5, flexShrink: 0 }}>
        <Box
          sx={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            borderRadius: 2,
            p: 2,
            color: "white",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
              animation: "shimmer 3s linear infinite",
              "@keyframes shimmer": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <p
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                opacity: 0.9,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: "500",
              }}
            >
              Total Certificates
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: "700",
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              {totalCertificates.toLocaleString()}
            </p>
          </Box>
        </Box>
      </Box>

      {/* CA Distribution Section */}
      {caData.length > 0 ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: 2.5, pb: 1, flexShrink: 0 }}>
            <h4
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: "600",
                color: "#374151",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              📊 CA Distribution
            </h4>
          </Box>

          <Box
            sx={{
              px: 2.5,
              pb: 2.5,
              flex: 1,
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "10px",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5a67d8 0%, #6b5b95 100%)",
                },
              },
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {caData.map(([ca, value], index) => {
                const percentage = ((value / maxValue) * 100).toFixed(1);
                const colors = [
                  "linear-gradient(135deg, #ff7c43 0%, #ff9a56 100%)",
                  "linear-gradient(135deg, #f95d6a 0%, #ff7a8a 100%)",
                  "linear-gradient(135deg, #d45087 0%, #e879a6 100%)",
                  "linear-gradient(135deg, #a05195 0%, #c971b4 100%)",
                  "linear-gradient(135deg, #a1ff33 0%, #b8ff5c 100%)",
                ];

                return (
                  <Box
                    key={ca}
                    sx={{
                      background: "white",
                      borderRadius: 2,
                      p: 2,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      border: "1px solid #f3f4f6",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateX(4px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: colors[index % colors.length],
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#374151",
                            lineHeight: "1.2",
                          }}
                        >
                          {ca}
                        </span>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#1f2937",
                          }}
                        >
                          {value.toLocaleString()}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            fontWeight: "500",
                          }}
                        >
                          {percentage}%
                        </div>
                      </Box>
                    </Box>

                    {/* Progress bar */}
                    <Box
                      sx={{
                        width: "100%",
                        height: 6,
                        backgroundColor: "#f3f4f6",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${percentage}%`,
                          height: "100%",
                          background: colors[index % colors.length],
                          borderRadius: 3,
                          transition: "width 0.8s ease-out",
                          animation: `growWidth 1s ease-out ${
                            index * 0.1
                          }s both`,
                          "@keyframes growWidth": {
                            "0%": { width: "0%" },
                            "100%": { width: `${percentage}%` },
                          },
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            p: 2.5,
            textAlign: "center",
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
              borderRadius: 2,
              p: 3,
              border: "1px solid #f59e0b",
            }}
          >
            <Box sx={{ fontSize: "24px", mb: 1 }}>⚠️</Box>
            <p
              style={{
                margin: 0,
                color: "#92400e",
                fontWeight: "500",
              }}
            >
              No certificates issued in this state
            </p>
          </Box>
        </Box>
      )}
    </Box>
  );
};
// Time period options
const TIME_PERIODS = {
  ALL: 0,
  LAST_6_MONTHS: 1,
  LAST_3_MONTHS: 2,
  LAST_1_MONTH: 3,
};

const Map = () => {
  const [geojson, setGeojson] = useState(null);
  const [mapdata, setMapdata] = useState(null);
  const [filteredMapData, setFilteredMapData] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [hoveredStateData, setHoveredStateData] = useState(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(
    TIME_PERIODS.ALL
  );
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

  const { data: geojsonData, error: geojsonError } = useSWR(
    `http://${domain}:8080/states/india.json`,
    fetcher
  );

  const { data: mapdataData, error: mapdataError } = useSWR(
    `http://${domain}:8080/count/india.json`,
    fetcher
  );

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

  React.useEffect(() => {
    if (geojsonData) setGeojson(geojsonData);
    if (mapdataData) {
      setMapdata(mapdataData);
      setFilteredMapData(processMapData(mapdataData, selectedTimePeriod));
    }
  }, [geojsonData, mapdataData]);

  // Update filtered data when time period changes
  React.useEffect(() => {
    if (mapdata) {
      setFilteredMapData(processMapData(mapdata, selectedTimePeriod));
    }
  }, [selectedTimePeriod, mapdata]);

  const handleTimePeriodChange = (event) => {
    setSelectedTimePeriod(parseInt(event.target.value));
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

  return (
    <div>
      {!selectedState ? (
        <Box sx={{ width: "100%" }}>
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
            {/* Time period selection and total count - unchanged */}
            <Box sx={{ flex: 1, marginTop: "1rem" }}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel id="time-period-label">Time Period</InputLabel>
                <Select
                  labelId="time-period-label"
                  id="time-period-select"
                  value={selectedTimePeriod}
                  onChange={handleTimePeriodChange}
                  label="Time Period"
                >
                  <MenuItem value={TIME_PERIODS.ALL}>All</MenuItem>
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
            <Box sx={{ flex: 1, textAlign: isSmallScreen ? "left" : "right" }}>
              <h3 style={{ margin: 0 }}>
                Total Certificates Issued: {totalCount.toLocaleString()}
              </h3>
            </Box>
          </Box>

          {/* Main content area with map and side panels */}
          <Box
            sx={{
              display: "flex",
              flexDirection: isSmallScreen ? "column" : "row",
              gap: 2,
            }}
          >
            {/* Map container */}
            <Box sx={{ flex: isSmallScreen ? 1 : 3 }}>
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
                  <Title>{`India Map - Certificates Issued ${getTimeText(
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
                          const stateName = this.st_nm;
                          const stateData = filteredMapData.find(
                            (item) => item.state === stateName
                          );
                          setHoveredStateData(stateData);
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
              }}
            >
              {/* Hover information panel */}
              <HoverInfoPanel stateData={hoveredStateData} />

              {/* Instructions panel */}
              <InstructionsPanel />
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
