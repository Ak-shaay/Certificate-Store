import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar/Sidebar";
import MainDash from "../Components/MainDash/MainDash";
import RightSide from "../Components/RigtSide/RightSide";
import UploadCertificate from "../Components/UploadCertificate/UploadCertificate";
import DataTable from "../Components/DataTable/DataTable";
import Account from "../Components/Account/Account";
import RightSideAccount from "../Components/RightSideAccount/RightSideAccount";
import RevokedDataTable from "../Components/RevokedDataTable/RevokedDataTable";
import UsageDataTable from "../Components/UsageDataTable/UsageDataTable";
import LogsDataTable from "../Components/LogsDataTable/LogsDataTable";
import api from "./axiosInstance";
import { useNavigate } from "react-router-dom";
import Management from "../Components/Management/Management";

function Dashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState("home");  // Default view can be "home"
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = api.getAccessToken();
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        api.setAuthHeader(token);
      } catch (error) {
        // Handle error from API call
        console.error("Error fetching dashboard data:", error);
        navigate("/login", { replace: true });
      }
    };

    fetchData();
  }, [navigate]);

  // Get the info from JWT token and handle potential tampering
  const getTokenData = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decodedToken = JSON.parse(atob(base64));
      return decodedToken;
    } catch (error) {
      console.error("Invalid token", error);
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return null;
    }
  };

  // Get the info from JWT token
  const token = api.getAccessToken();
  let decodedToken = null;
  if (token) {
    decodedToken = getTokenData(token);
  }

  if (!decodedToken) {
    // If the token is invalid, redirect to login
    navigate("/login", { replace: true });
    return null;
  }

  const username = decodedToken.name || "";
  const role = decodedToken.role || "";

  // handleViewChange will update the current view when a menu item is clicked
  const handleViewChange = (newView) => {
    setView(newView);
  };

  switch (view) {
    case "home":
      return (
        <div className="responsive-container">
          <Sidebar onIndexChange={handleViewChange} role={role} />
          <MainDash username={username} />
        </div>
      );
    case "issuedCertificates":
      return (
        <div className="responsive-container">
          <Sidebar onIndexChange={handleViewChange} role={role} />
          <DataTable />
        </div>
      );
    case "revokedCertificates":
      return (
        <div className="responsive-container">
          <Sidebar onIndexChange={handleViewChange} role={role} />
          <RevokedDataTable />
        </div>
      );
    case "dscUsages":
      return (
        <div className="responsive-container">
          <Sidebar onIndexChange={handleViewChange} role={role} />
          <UsageDataTable />
        </div>
      );
    case "addCertificate":
      return (
        <div className="responsive-container">
          <Sidebar onIndexChange={handleViewChange} role={role} />
          <UploadCertificate />
        </div>
      );
    case "account":
      return (
        <div className="responsive-container container_two">
          <Sidebar onIndexChange={handleViewChange} role={role} />
          <Account />
          <RightSideAccount />
        </div>
      );
    case "logs":
      return (
        <div className="responsive-container">
          <Sidebar onIndexChange={handleViewChange} role={role} />
          <LogsDataTable />
        </div>
      );
    case "portalManagement":
      return (
        <div className="responsive-container">
          <Sidebar onIndexChange={handleViewChange} role={role} />
          <Management />
        </div>
        
      );
    case "signout":
      return null; // Handle signout logic separately (perhaps redirect or display a message)
    default:
      return null;
  }
}
export default Dashboard;
