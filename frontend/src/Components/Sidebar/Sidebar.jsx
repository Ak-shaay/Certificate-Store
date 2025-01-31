import React, { useState, useEffect,useRef } from "react";
import "./Sidebar.css";
import Logo from "../../Images/cdac.png";
import { SidebarData } from "../../Data";
import menuIcon from "../../Images/Icons/menu.png";
import closeIcon from "../../Images/Icons/cross.png";
import { motion } from "framer-motion";
import { domain } from "../../Context/config";
import api from "../../Pages/axiosInstance";

const Sidebar = ({ onIndexChange, role }) => {
    const [selected, setSelected] = useState(0);
    const [expanded, setExpanded] = useState(true);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const hasCalledFunction = useRef(false);

    const [temp, setTemp] = useState(false);
    useEffect(() => {
        geolocation();
    }, []);


    useEffect(() => {
      if (!hasCalledFunction.current) {
        async function loginStatus() {
            try{
            const accessToken = api.getAccessToken();
          api.setAuthHeader(accessToken);
          const response = await api.axiosInstance.post("/statusCheck");
          if(response.data.login == 'Temporary'){
           alert(`You have used temporary Password for logging in! Please Change Your Password`);
           setTemp(true); 
        }}
          catch (error) {
          console.error(error);
        }
        }
  
        loginStatus();
        hasCalledFunction.current = true; 
      }
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
            const token = api.getAccessToken();
            const decodedToken = token
                ? JSON.parse(atob(token.split(".")[1]))
                : null;
            const username = decodedToken ? decodedToken.username : [];
            if (token) {
                api.setAuthHeader(token);
            }
            // Make a request to the logout endpoint on the backend
            await api.axiosInstance.post("/logout", {
                username,
                latitude,
                longitude,
            });
            api.removeTokens();
            document.cookie = `certStore=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            // Redirect to the login page or perform any other necessary actions
            window.location.href = "http://" + domain + ":3000"; // Redirect to landing page
            // console.log("logged out");
        } catch (error) {
            console.error("Logout failed:", error);
            // Handle error if logout fails (e.g., display error message)
        }
    };

    const handleMenuItemClick = (index) => {
        if (index === 8) {
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
                style={expanded ? { left: "45%" } : { left: "2%" }}
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? (
                    <img className="icons" src={closeIcon} alt="" />
                ) : (
                    <img className="icons" src={menuIcon} alt="" />
                )}
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
                        try {
                            if (temp) {
                                handleMenuItemClick(5); 
                                setTemp(false)
                                return null; 
                            }
                            if (
                                role != "Admin" &&
                                // (index === 6 || index === 7)
                                (index === 7)
                            ) {
                                return null;
                            }
                            // if(index === 4){ //remove upload cert for admin
                            if(role !== "Admin" && index === 4) {
                            return null;
                            }

                            return (
                                <div
                                    className={
                                        selected === index
                                            ? "menuItem active"
                                            : "menuItem"
                                    }
                                    key={index}
                                    onClick={() => handleMenuItemClick(index)}
                                >
                                    <img
                                        className="sidebar-icons"
                                        src={item.icon}
                                        alt=""
                                    />
                                    <span>{item.heading}</span>
                                </div>
                            );
                        } catch (error) {
                            console.error("Error rendering menu item:", error);
                            return null;
                        }
                        // Skip index 6 if the user's role is admin
                    })}
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;
