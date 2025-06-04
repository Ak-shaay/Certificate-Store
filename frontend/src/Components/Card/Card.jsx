import React, { useState } from "react";
import "./Card.css";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion, LayoutGroup } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import Chart from "react-apexcharts";

// get the last 6 hours from the current date time
function getPastDatetimeStringsIST() {
  var istOffset = 5.5 * 60 * 60 * 1000;
  var pastDatetimeStrings = [];
  for (var i = 5; i >= 0; i--) {
    var pastDate = new Date(Date.now() - i * 3600000 + istOffset);
    var isoString = pastDate.toISOString();
    pastDatetimeStrings.push(isoString);
  }
  return pastDatetimeStrings;
}

// parent Card
const Card = (props) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <LayoutGroup>
      {expanded ? (
        <ExpandedCard param={props} setExpanded={() => setExpanded(false)} />
      ) : (
        <CompactCard param={props} setExpanded={() => setExpanded(true)} />
      )}
    </LayoutGroup>
  );
};

// Compact Card
function CompactCard({ param, setExpanded }) {
  const Png = param.png;
  return (
    <motion.div
      className="CompactCard"
      style={{
        background: param.color.backGround,
        boxShadow: param.color.boxShadow,
      }}
      layoutId={param.layoutId}
      onClick={setExpanded}
    >
      <div className="radialBar">
        <CircularProgressbar
          value={param.barValue}
          text={`${param.barValue}%`}
        />
        <span>{param.title}</span>
      </div>
      <div className="detail">
        <img className="sidebar-icons invert" src={Png} alt="" />
        <span>{param.value}</span>
        <span>Last 24 hours</span>
      </div>
    </motion.div>
  );
}

// Expanded Card
function ExpandedCard({ param, setExpanded }) {
  const data = {
    options: {
      chart: {
        type: "area",
        height: "auto",
        toolbar: {
          show: true,
          offsetX: 0,
          offsetY: 0,
          tools: {
            download: false,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
            customIcons: [
              {
                icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`,
                index: 0,
                title: "Zoom In",
                class: "custom-zoom-in-icon",
                click: function (chart, options, e) {
                  const minX = chart.w.globals.minX;
                  const maxX = chart.w.globals.maxX;
                  const range = maxX - minX;

                  const zoomInFactor = 0.8; // 20% zoom in

                  const newMinX = minX + (range * (1 - zoomInFactor)) / 2;
                  const newMaxX = maxX - (range * (1 - zoomInFactor)) / 2;

                  chart.zoomX(newMinX, newMaxX);
                },
              },
              {
                icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path><line x1="8" y1="11" x2="14" y2="11"></line></svg>`,
                index: 1,
                title: "Zoom Out",
                class: "custom-zoom-out-icon",
                click: function (chart, options, e) {
                  const minX = chart.w.globals.minX;
                  const maxX = chart.w.globals.maxX;
                  const range = maxX - minX;

                  const zoomOutFactor = 1.2; // 20% zoom out

                  const newMinX = minX - (range * (zoomOutFactor - 1)) / 2;
                  const newMaxX = maxX + (range * (zoomOutFactor - 1)) / 2;

                  chart.zoomX(newMinX, newMaxX);
                },
              },
              {
                icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>`,
                index: 2,
                title: "Reset Zoom",
                class: "custom-reset-icon",
                click: function (chart, options, e) {
                  chart.resetSeries();
                },
              },
            ],
          },
        },
      },
      dropShadow: {
        enabled: false,
        enabledOnSeries: undefined,
        top: 0,
        left: 0,
        blur: 3,
        color: "#000",
        opacity: 0.35,
      },
      fill: {
        colors: ["#fff"],
        type: "gradient",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        colors: ["white"],
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm",
        },
      },
      grid: {
        show: true,
      },
      xaxis: {
        type: "datetime",
        categories: getPastDatetimeStringsIST(),
      },
    },
  };

  return (
    <motion.div
      className="ExpandedCard"
      style={{
        background: param.color.backGround,
        boxShadow: param.color.boxShadow,
      }}
      layoutId={param.layoutId}
    >
      <div style={{ alignSelf: "flex-end", cursor: "pointer", color: "white" }}>
        <CloseIcon onClick={setExpanded} style={{ cursor: "pointer" }} />
      </div>
      <span>{param.title}</span>
      <div className="chartContainer">
        <Chart options={data.options} series={param.series} type="area" />
      </div>
      <span>Last 6 hours</span>
    </motion.div>
  );
}

export default Card;
