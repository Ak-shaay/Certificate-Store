import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar/Sidebar";
import MainDash from "../Components/MainDash/MainDash";
import RightSide from "../Components/RigtSide/RightSide";
import UploadCertificate from "../Components/UploadCertificate/UploadCertificate";
import DataTable from "../Components/DataTable/DataTable ";
import Account from "../Components/Account/Account";
import RightSideAccount from "../Components/RightSideAccount/RightSideAccount";
import RevokedDataTable from "../Components/RevokedDataTable/RevokedDataTable";
import UsageDataTable from "../Components/UsageDataTable/UsageDataTable ";
import LogsDataTable from "../Components/LogsDataTable/LogsDataTable";
import api from "./axiosInstance";
import { useNavigate } from "react-router-dom";
import Management from "../Components/Management/Management";

function Dashboard() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
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

  // Handle index change for sidebar navigation
  const handleIndexChange = (newIndex) => {
    setIndex(newIndex);
  };

  // Use a switch statement outside the JSX to manage different views based on index
  switch (index) {
    case 0:
      return (
        <div className="appglass-other">
          <Sidebar onIndexChange={handleIndexChange} role={role} />
          <MainDash username={username} />
          {/* <RightSide /> */}
        </div>
      );
    case 1:
      return (
        <div className="appglass-other">
          <Sidebar onIndexChange={handleIndexChange} role={role} />
          <DataTable />
        </div>
      );
    case 2:
      return (
        <div className="appglass-other">
          <Sidebar onIndexChange={handleIndexChange} role={role} />
          <RevokedDataTable />
        </div>
      );
    case 3:
      return (
        <div className="appglass-other">
          <Sidebar onIndexChange={handleIndexChange} role={role} />
          <UsageDataTable />
        </div>
      );
    case 4:
      return (
        <div className="appglass-other">
          <Sidebar onIndexChange={handleIndexChange} role={role} />
          <UploadCertificate />
        </div>
      );
    case 5:
      return (
        <div className="appglass">
          <Sidebar onIndexChange={handleIndexChange} role={role} />
          <Account />
          <RightSideAccount />
        </div>
      );
    case 6:
      return (
        <div className="appglass-other">
          <Sidebar onIndexChange={handleIndexChange} role={role} />
          <LogsDataTable />
        </div>
      );
    case 7:
      return (
        <div className="appglass-other">
          <Sidebar onIndexChange={handleIndexChange} role={role} />
          <Management />
        </div>
      );
    default:
      return null;
  }
}

export default Dashboard;
