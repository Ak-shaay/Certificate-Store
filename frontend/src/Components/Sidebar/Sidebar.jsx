import React, { useState} from "react";
import "./Sidebar.css";
import Logo from "../../Images/cdaclogoRound.png";
import { SidebarData } from "../../Data";
import { UilBars, UilTimes } from "@iconscout/react-unicons";
import { motion } from "framer-motion";
import axios from "axios";

const Sidebar = ({ onIndexChange }) => {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(true);

  const handleLogout = async () => {
    try {
      // Clear token cookie
      localStorage.removeItem('token');
      // Make a request to the logout endpoint on the backend
      await axios.post('http://localhost:8080/logout');
      // Redirect to the login page or perform any other necessary actions
      window.location.href = 'http://localhost:3000'; // Redirect to landing page
      console.log("logged out")
    } catch (error) {
      console.error('Logout failed:', error);
      // Handle error if logout fails (e.g., display error message)
    }
  };

  const handleMenuItemClick = (index) => {
    if (index === 7) {
      onIndexChange(index);
      handleLogout();
    }
    else{
    setSelected(index);
    onIndexChange(index);
    }
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
        style={expanded ? { left: "50%" } : { left: "2%" }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <UilTimes /> : <UilBars />}
      </div>
      <motion.div
        className="sidebar"
        variants={sidebarVariants}
        animate={window.innerWidth <= 768 ? `${expanded}` : false}
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
