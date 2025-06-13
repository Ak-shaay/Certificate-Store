import React, { useState, useEffect, useRef } from "react";
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { SidebarData } from "../../Data";
import { domain } from "../../Context/config";
import api from "../../Pages/axiosInstance";
import Logo from "../../Images/cdac.png";
import "./Sidebar.css";

const drawerWidth = 270;

const Sidebar = ({ onIndexChange, role , selectedView }) => {  
  const [selected, setSelected] = useState(selectedView||"home");
  const [open, setOpen] = useState(true);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const hasCalledFunction = useRef(false);
  const [temp, setTemp] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
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
            setSelected("account");   
            setOpenDialog(true);
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

  const handleMenuItemClick = (viewName) => {
    if (viewName === "signout") {
      handleLogout();
    } else {
      setSelected(viewName);
      onIndexChange(viewName); // update the view name
      if (isMobile) setOpen(false); // close drawer after selection on mobile
    }
  };

  const filteredSidebarData = SidebarData.filter((item, index) => {
    // Handle temp-based logic (using viewName or index)
    if (temp && item.viewName === "account") {
      onIndexChange("account");
      setTemp(false);
      return false; // Do not show this item
    }

    // Role-based filtering for non-admin users
    if (role !== "Admin" && item.viewName === "portalManagement") {
      return false; // Hide "Portal Management" for non-admin users
    }

    if (role !== "Admin" && item.viewName === "addCertificate") {
      return false; 
    }

    return true; // Show this item by default
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
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    p={2}
    sx={{
      position: "sticky", // Makes it sticky
      top: 0, 
      // backgroundColor: "#ffe0e0",
      zIndex: 1000, 
      paddingBottom: "1rem", 
    }}
  >
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
  
  <Box
    sx={{
      height: `calc(100vh - 160px)`,  
      overflowY: "auto",
    }}
  >
    <List>
      {filteredSidebarData.map((item, index) => (
        <ListItem
          key={item.viewName}
          disablePadding
          onClick={() => handleMenuItemClick(item.viewName)}
          className={`sidebar-list-item ${selected === item.viewName ? "active" : ""}`}
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
          <ListItemText primary={item.heading} sx={{ fontWeight: "900" }} />
        </ListItem>
      ))}
    </List>
  </Box>
</Drawer>

      {/* Dialog for password change */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="temporary-password-dialog-title"
        aria-describedby="temporary-password-dialog-description"
        role="alertdialog"
      >
        <DialogTitle
          id="temporary-password-dialog-title"
          style={{ color: "red" }}
        >
          ⚠️ Temporary Password Alert
        </DialogTitle>
        <DialogContent id="temporary-password-dialog-description">
          You have used a temporary password for logging in! Please change your
          password immediately.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            color="primary"
            autoFocus
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar;
