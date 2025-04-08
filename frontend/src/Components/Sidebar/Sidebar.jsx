import React, { useState, useEffect, useRef } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Divider,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { SidebarData } from "../../Data";
import { domain } from "../../Context/config";
import api from "../../Pages/axiosInstance";
import Logo from "../../Images/cdac.png";
import "./Sidebar.css";

const drawerWidth = 300;

const Sidebar = ({ onIndexChange, role }) => {
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(true);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const hasCalledFunction = useRef(false);
  const [temp, setTemp] = useState(false);
  
  const isMobile = useMediaQuery("(max-width:768px)");
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        (err) => console.log(err)
      );
    }
  }, []);

  useEffect(() => {
    if (!hasCalledFunction.current) {
      const checkLoginStatus = async () => {
        try {
          const accessToken = api.getAccessToken();
          api.setAuthHeader(accessToken);
          const response = await api.axiosInstance.post("/statusCheck");
          if (response.data.login === "Temporary") {
            alert(
              "You have used a temporary password for logging in! Please change your password."
            );
            setTemp(true);
          }
        } catch (err) {
          console.error(err);
        }
      };
      checkLoginStatus();
      hasCalledFunction.current = true;
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = api.getAccessToken();
      const decodedToken = token ? JSON.parse(atob(token.split(".")[1])) : null;
      const username = decodedToken ? decodedToken.username : null;
      api.setAuthHeader(token);
      await api.axiosInstance.post("/logout", {
        username,
        latitude,
        longitude,
      });
      api.removeTokens();
      document.cookie = `certStore=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      window.location.href = `http://${domain}:3000`;
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleMenuItemClick = (index) => {
    if (index === 8) {
      handleLogout();
    } else {
      setSelected(index);
      onIndexChange(index);
      if (isMobile) setOpen(false); // close drawer after selection on mobile
    }
  };

  const filteredSidebarData = SidebarData.filter((item, index) => {
    if (temp && index === 5) {
      onIndexChange(5);
      setTemp(false);
      return false;
    }
    if (role !== "Admin" && index === 7) return false;
    if (role !== "Admin" && index === 4) return false;
    return true;
  });

  return (
    <>
      {/* Toggle button for mobile */}
      {isMobile && (
        <IconButton
          onClick={() => setOpen(!open)}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 2000,
            backgroundColor: "#ffe0e0",
            borderRadius: "50%",
            boxShadow: 2,
          }}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#ffe0e0",
            ...(isMobile
              ? {}
              : {
                  backgroundImage:
                    "linear-gradient(86deg, #ffffff 0%, #b4e8ff 54%)",
                }),
          },
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" p={2}>
          <img
            src={Logo}
            alt="CDAC Logo"
            style={{ width: "5rem", height: "auto" }}
          />
          <Box fontWeight="bold" mt={1}>
            Certificate Repository
          </Box>
        </Box>
        <Divider />
        <List>
          {filteredSidebarData.map((item, index) => (
            <ListItem
              key={index}
              disablePadding
              onClick={() => handleMenuItemClick(index)}
              className={`sidebar-list-item ${
                selected === index ? "active" : ""
              }`}
              sx={{
                marginBottom: "1rem",
                borderRadius: "0.5rem",
                padding: "0.5rem 1rem",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#ffe0e0",
                },
              }}
            >
              <ListItemIcon>
                <img
                  src={item.icon}
                  alt=""
                  className="sidebar-icons"
                  width={24}
                  height={24}
                />
              </ListItemIcon>
              <ListItemText primary={item.heading} sx={{fontWeight:"900"}}/>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
