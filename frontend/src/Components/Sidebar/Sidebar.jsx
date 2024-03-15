import React, { useState} from "react";
import "./Sidebar.css";
import Logo from "../../Images/cdaclogoRound.png";
import { SidebarData } from "../../Data";
import { UilBars } from "@iconscout/react-unicons";
import { motion } from "framer-motion";

const Sidebar = ({ onIndexChange }) => {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(true);

  const handleMenuItemClick = (index) => {
    setSelected(index);
    onIndexChange(index);
  };

  const sidebarVariants = {
    true: {
      left: "0",
    },
    false: {
      left: "-60%",
    },
  };
  return (
    <>
      <div
        className="bars"
        style={expanded ? { left: "60%" } : { left: "5%" }}
        onClick={() => setExpanded(!expanded)}
      >
        <UilBars />
      </div>
      <motion.div
        className="sidebar"
        variants={sidebarVariants}
        animate={window.innerWidth <= 768 ? `${expanded}` : ""}
      >
        <div className="logo">
          <img src={Logo} alt="logo" />
          <span>
            <span>Certificate Repository</span>
          </span>
        </div>

        <div className="menu">
          {SidebarData.map((item, index) => {
            return (
              <div
                className={selected === index ? "menuItem active" : "menuItem"}
                key={index}
                onClick={() => handleMenuItemClick(index)}
              >
                <item.icon />
                <span>
                  {item.heading}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
