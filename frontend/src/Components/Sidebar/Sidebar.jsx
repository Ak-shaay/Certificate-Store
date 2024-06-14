import React, { useState,useEffect } from "react";
import "./Sidebar.css";
import Logo from "../../Images/cdaclogoRound.png";
import { SidebarData } from "../../Data";
import menuIcon from '../../Images/Icons/menu.png';
import closeIcon from '../../Images/Icons/cross.png';
import { motion } from "framer-motion";
import axios from "axios";
import { domain } from "../../Context/config";

const Sidebar = ({ onIndexChange }) => {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    geolocation();
  }, []);

  function geolocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  const handleLogout = async () => {
    // if (latitude === null || longitude === null) {
    //   alert("Please enable location services to proceed.");
    //   return;
    // }
    try {
      // Clear token cookie
      const token = localStorage.getItem("token");
      const decodedToken = token ? JSON.parse(atob(token.split(".")[1])) : null;
      const userID = decodedToken ? decodedToken.userId : [];
      localStorage.removeItem("token");
      // Make a request to the logout endpoint on the backend
      await axios.post(
        "http://"+domain+":8080/logout",
        { userID, latitude, longitude },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      // Redirect to the login page or perform any other necessary actions
      window.location.href = "http://"+domain+":3000"; // Redirect to landing page
      // console.log("logged out");
    } catch (error) {
      console.error("Logout failed:", error);
      // Handle error if logout fails (e.g., display error message)
    }
  };

  const handleMenuItemClick = (index) => {
    if (index === 7) {
      onIndexChange(index);
      handleLogout();
    } else {
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
        style={expanded ? { left: "35%" } : { left: "2%" }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <img className="icons" src={closeIcon} alt="" /> : <img className="icons" src={menuIcon} alt="" />}
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
                <img className="sidebar-icons" src={item.icon} alt=""/>
                <span>{item.heading}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
