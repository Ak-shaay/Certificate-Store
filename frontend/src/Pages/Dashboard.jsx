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
import api from './axiosInstance';
import {
  useNavigate,
} from "react-router-dom";
function Dashboard() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0); //index value is used for sidebar navigation
  //api call for backend authentication
  useEffect(()=>{
    const fetchData = async () => {
      try {
        const accessToken = api.getAccessToken();
        if(accessToken){
          api.setAuthHeader(accessToken);
        }
        const response = await api.axiosInstance.get("/dashboard")
  
        if (response.status === 200) {
          // Dashboard data received successfully
        } else {
          // Redirect to login page if authentication fails
          navigate('/login', { replace: true });
        }
      } catch (error) {
        // Handle error from API call
        console.error("Error fetching dashboard data:", error);
        // Redirect to login page if there's an error
        navigate('/login', { replace: true });
      }
    };
  
    fetchData(); 
  },[])
  //get the info from JWT token
  const token = api.getAccessToken();
  const decodedToken = token ? JSON.parse(atob(token.split('.')[1])): null;
  const username = decodedToken ? decodedToken.username : "";
  const role = decodedToken ? decodedToken.role: "";
  //handle index change
  const handleIndexChange = (newIndex) => {
    setIndex(newIndex);
  };

  // Use a switch statement outside the JSX
  let content;
  switch (index) {
    case 0:
      content = (
        <div className="appglass">
          <Sidebar onIndexChange={handleIndexChange} role={role}/>
          <MainDash username={username}/>
          <RightSide />
        </div>
      );
      break;
    case 1:
      content = (
        <div className="appglass-other">
          <Sidebar onIndexChange={handleIndexChange} role={role}/>
          <DataTable />
          {/* <RightSide /> */}
        </div>
      );
      break;
    case 2:
      content = (
        <div className="appglass-other">
          <Sidebar onIndexChange={handleIndexChange} role={role}/>
          <RevokedDataTable />
          {/* <RightSide /> */}
        </div>
      );
      break;
    case 3:
      content = (
        <div className="appglass-other">
          <Sidebar onIndexChange={handleIndexChange} role={role} />
          <UsageDataTable />
          {/* <RightSide /> */}
        </div>
      );
      break;
    case 4:
      content = (
        <div className="appglass-other">
          <Sidebar onIndexChange={handleIndexChange} role={role}/>
          <UploadCertificate />
          {/* <RightSide /> */}
        </div>
      );
      break;
    case 5:
      content = (
        <div className="appglass">
          <Sidebar onIndexChange={handleIndexChange} role={role}/>
          <Account />
          <RightSideAccount />
        </div>
      );
      break;
      case 6:
        content = (
          <div className="appglass-other">
            <Sidebar onIndexChange={handleIndexChange} />
            <LogsDataTable/>
          </div>
        );
        break;
        // case 7:
        // content = (
        //   <div className="appglass-other">
        //     <Sidebar onIndexChange={handleIndexChange} />
        //     <ChangePassword/>
        //   </div>
        // );
        // break;
        
    default:
      break;
  }

  return <>{content}</>;
}

export default Dashboard;
