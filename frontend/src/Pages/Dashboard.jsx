import React, { useEffect, useState } from "react";
import axios from "axios";
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
import UserManagement from "../Components/UserManagement/UserManagement";
function Dashboard() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0); //index value is used for sidebar navigation
  //api call for backend authentication
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = api.getAccessToken();
    
        if (accessToken) {
          api.setAuthHeader(accessToken);
          const response = await api.axiosInstance.get("/dashboard");
    
          if (response.status === 200) {
            // Dashboard data received successfully
          } else {
            // Handle unexpected status codes if needed
            console.error("Unexpected status code:", response.status);
          }
        } else {
          // Redirect to login page if accessToken is not available
          navigate("/login", { replace: true });
        }
      } catch (error) {
        // Handle error from API call
        console.error("Error fetching dashboard data:", error);
        // Redirect to login page if there's an error
        navigate("/login", { replace: true });
      }
    };

    fetchData();
  }, []);
  // Get the info from JWT token and handle potential tampering
  const getTokenData = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decodedToken = JSON.parse(atob(base64));
      return decodedToken;
    } catch (error) {
      console.error("Invalid token", error);
      // Remove the token and navigate to login if there's an error
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return null;
    }
  };
  //get the info from JWT token
  const token = api.getAccessToken();
  let decodedToken = null;
  if (token) {
    decodedToken = getTokenData(token);
  }

  if (!decodedToken) {
    // If the token is invalid, ensure the user is redirected to login
    navigate("/login", { replace: true });
    return null;
  }

  const username = decodedToken.username || "";
  const role = decodedToken.role || "";

  //handle index change
  const handleIndexChange = (newIndex) => {
    setIndex(newIndex);
  };
  // Use a switch statement outside the JSX
  switch (index) {
    case 0:
      return(
        <div className="appglass">
          <Sidebar onIndexChange={handleIndexChange} role={role} />
          <MainDash username={username} />
          <RightSide />
        </div>
      );
    case 1:
      return(
        <div className="appglass-other">
          <Sidebar onIndexChange={handleIndexChange} role={role} />
          <DataTable />
          {/* <RightSide /> */}
        </div>
      );
    case 2:
      return(
        <div className="appglass-other">
          <Sidebar onIndexChange={handleIndexChange} role={role} />
          <RevokedDataTable />
          {/* <RightSide /> */}
        </div>
      );
    case 3:
      return(
        <div className="appglass-other">
          <Sidebar onIndexChange={handleIndexChange} role={role} />
          <UsageDataTable />
          {/* <RightSide /> */}
        </div>
      );
    case 4:
      return(
        <div className="appglass-other">
          <Sidebar onIndexChange={handleIndexChange} role={role} />
          <UploadCertificate />
          {/* <RightSide /> */}
        </div>
      );
    case 5:
      return(
        <div className="appglass">
          <Sidebar onIndexChange={handleIndexChange} role={role} />
          <Account />
          <RightSideAccount />
        </div>
      );
    case 6:
      return(
        <div className="appglass-other">
          <Sidebar onIndexChange={handleIndexChange} role={role} />
          <LogsDataTable />
        </div>
      );
    case 7:
      return(
        <div className="appglass-other">
          <Sidebar onIndexChange={handleIndexChange} role={role}/>
          <UserManagement/>
        </div>
      );
    default:
      return null
  }
}

export default Dashboard;
