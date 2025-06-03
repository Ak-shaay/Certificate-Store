import React, { useState } from "react";
import "./Card.css";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion, LayoutGroup } from "framer-motion";
import closeIcon from '../../Images/Icons/cross.png';
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
      layoutId= {param.layoutId}
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
        {/* <img className="card-close" src={closeIcon} onClick={setExpanded} alt="" /> */}
        <CloseIcon onClick={setExpanded}/>
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
