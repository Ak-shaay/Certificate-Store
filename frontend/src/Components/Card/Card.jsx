import React, { useState } from "react";
import "./Card.css";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion, LayoutGroup } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import Chart from "react-apexcharts";
import { Backdrop } from "@mui/material";
import MenuIcon from "../../Images/Icons/menu.png";
import ZoomOut from "../../Images/Icons/zoom-out.png";
import ZoomIn from "../../Images/Icons/zoom-in.png";
import Refresh from "../../Images/Icons/refresh.png";

// get the last 6 hours from the current date time
function getPastDatetimeStringsIST() {
  var istOffset = 5.5 * 60 * 60 * 1000;
  var pastDatetimeStrings = [];
  for (var i = 23; i >= 0; i--) {
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
        zIndex: 999,
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
            download: `<img src="${MenuIcon}" class="ico-download" width="25">`,
            selection: false,
            zoom: false,
            zoomin: `<img src="${ZoomIn}"  width="28">`,
            zoomout: `<img src="${ZoomOut}" width="28">`,
            pan: false,
            reset: `<img src=${Refresh} width="25">`,
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
        theme: "light",
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
    <Backdrop
      open={true}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        color: "#fff",
        backdropFilter: "blur(4px)",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      onClick={setExpanded} // Clicking outside closes the card
    >
      <motion.div
        className="ExpandedCard"
        style={{
          background: param.color.backGround,
          boxShadow: param.color.boxShadow,
        }}
        layoutId={param.layoutId}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the card
      >
        <div
          style={{
            alignSelf: "flex-end",
            cursor: "pointer",
            color: "white",
          }}
        >
          <CloseIcon onClick={setExpanded} style={{ cursor: "pointer" }} />
        </div>
        <span className="cardText">{param.title}</span>
        <div className="chartContainer">
          <Chart options={data.options} series={param.series} type="area" />
        </div>
        <span className="cardText">Last 24 hours</span>
      </motion.div>
    </Backdrop>
  );
}

export default Card;
