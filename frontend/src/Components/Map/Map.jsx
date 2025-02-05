import React, { useEffect, useState } from "react";
import useSWR from "swr";
import Highmaps from "highcharts/highmaps";
import Highcharts from "highcharts";
import { domain } from "../../Context/config";

import {
  HighchartsMapChart,
  HighmapsProvider,
  Title,
  Tooltip,
  MapSeries,
  MapNavigation,
  Credits,
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

const Map = () => {
  const [geojson, setGeojson] = useState(null);
  const [mapdata, setMapdata] = useState(null);
  const [pieData, setPieData] = useState(null);

  const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    }
    return res.json();
  };

  const { data: geojsonData, error: geojsonError } = useSWR(
    "http://"+domain+":8080/states/india.json",
    fetcher
  );
  const { data: mapdataData, error: mapdataError } = useSWR(
    "http://"+domain+":8080/count/india.json",
    fetcher
  );

  useEffect(() => {
    if (geojsonData) setGeojson(geojsonData);
    if (mapdataData) setMapdata(mapdataData);
  }, [geojsonData, mapdataData]);

  if (geojsonError || mapdataError) return <div>Error loading map data.</div>;
  if (!geojson || !mapdata) return <div>Loading...</div>;

  const totalCount = mapdata.reduce((sum, item) => {
    return (
      sum +
      Object.values(item)
        .filter((val) => typeof val === "number")
        .reduce((acc, val) => acc + val, 0)
    );
  }, 0);
  const seriesData = mapdata.map((item) => {
    const totalValue = Object.keys(item)
      .filter((key) => key !== "state" && key !== "color") // Exclude the "color" field
      .reduce((sum, key) => sum + (item[key] || 0), 0);

    return {
      st_nm: item.state,
      value: totalValue,
      color: item.color, // Add color from JSON data
    };
  });
  const joinBy = "st_nm"; // Add this definition near your plotOptions and colorAxis variables

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
  const handleStateClick = (stateName) => {
    const stateData = mapdata.find((item) => item.state === stateName);

    const pieChartData = Object.keys(stateData)
      .filter((key) => key !== "state")
      .map((ca) => ({
        name: ca,
        y: stateData[ca],
        color: caColorMap[ca] || "#ccc",
      }));

    setPieData({ stateName, pieChartData });
    displayPieChart(stateName, pieChartData);
  };
  const displayPieChart = (stateName, pieChartData) => {
    let pieContainer = document.getElementById("popup-pie-container");
    if (!pieContainer) {
      pieContainer = document.createElement("div");
      pieContainer.id = "popup-pie-container";
      pieContainer.style.position = "fixed";
      pieContainer.style.top = "50%";
      pieContainer.style.left = "50%";
      pieContainer.style.transform = "translate(-50%, -50%)";
      pieContainer.style.backgroundColor = "white";
      pieContainer.style.padding = "20px";
      pieContainer.style.borderRadius = "10px";
      pieContainer.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.25)";
      pieContainer.style.zIndex = "1000";
      pieContainer.style.border = "1px solid #ddd";
      pieContainer.style.width = "90%";
      pieContainer.style.maxWidth = "500px";
      pieContainer.style.overflow = "hidden";
      pieContainer.style.textAlign = "center";
      document.body.appendChild(pieContainer);
    }

    pieContainer.innerHTML = `
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
    `;

    const stateData = mapdata.find((item) => item.state === stateName);

    // Ensure colors are taken from the caColorMap or state color
    const pieChartDataWithColor = Object.keys(stateData)
      .filter((key) => key !== "state" && key !== "color") // Exclude state and color
      .map((ca) => ({
        name: ca,
        y: stateData[ca],
        color: caColorMap[ca] || stateData.color || "#ccc", // Use state color or caColorMap if available
      }));

    Highcharts.chart("popup-pie", {
      chart: {
        type: "pie",
      },
      title: {
        text: `CA Distribution in ${stateName}`,
      },
      credits: {
        enabled: false,
      },
      tooltip: {
        pointFormat: "{series.name}: <b>{point.y}</b>",
      },
      accessibility: {
        point: {
          valueSuffix: "",
        },
      },
      series: [
        {
          name: "Certificates Issued",
          data: pieChartDataWithColor, // Use the updated pie chart data with colors
        },
      ],
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: "pointer",
          dataLabels: {
            enabled: true,
            format:
              '<span style="font-size: 1.2em"><b>{point.name}</b></span><br>' +
              '<span style="opacity: 0.6">{point.y}</span>',
            connectorColor: "rgba(128,128,128,0.5)",
          },
        },
      },
    });

    const closeButton = document.getElementById("close-pie");
    closeButton.onmouseover = () => (closeButton.style.background = "#d32f2f");
    closeButton.onmouseout = () => (closeButton.style.background = "#f44336");
    closeButton.onclick = () => {
      pieContainer.remove();
    };
  };

  const totalCountString = 'India Map - Certificates Issued: '+totalCount
  return (
    <div>
      <HighmapsProvider Highcharts={Highmaps}>
        <HighchartsMapChart map={geojson}>
          <Chart height={600} backgroundColor="transparent" />
          <Title>{totalCountString}</Title>

          <Pane background={{ backgroundColor: "#ffecd1" }} />
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
            states={{
              hover: {
                color: "#ffecd1",
              },
            }}
            point={{
              events: {
                click: function () {
                  handleStateClick(this.st_nm);
                },
              },
            }}
            dataLabels={{
              enabled: false,
              format: "{point.st_nm}: {point.value}",
            }}
            colorByPoint={true} // Ensure each point uses its own color from the data
          />
        </HighchartsMapChart>
      </HighmapsProvider>
    </div>
  );
};

export default Map;
