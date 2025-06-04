import React, { useState, useEffect } from "react";
import "./RightSideAccount.css";
import api from "../../Pages/axiosInstance";

import { domain } from "../../Context/config";
const RightSideAccount = () => {
  const [username, setUsername] = useState(null);
  const [authNo, setAuthNo] = useState("");
  const [ipAddress, setIpAddress] = useState(null);
  const [lastLogin, setLastLogin] = useState(null);

  const [imageError, setImageError] = useState(false);

  const imgURL = "http://" + domain + ":8080/images/" + authNo + ".png" || "";
  const defaultImage = "http://" + domain + ":8080/images/null.png";   
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = api.getAccessToken();
        if (accessToken) {
          api.setAuthHeader(accessToken);
        }
        const response = await api.axiosInstance.get("/profile");
        if (response.status !== 200) {
          throw new Error("Network response was not ok");
        } else {          
          const base64Url = accessToken.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const decodedToken = JSON.parse(atob(base64));
          setUsername(decodedToken.name);
          setAuthNo(decodedToken.authNo);
          setIpAddress(response.data.ip);
          setLastLogin(response.data.lastLogin);
        }
      } catch (error) {
        console.error("An error occurred while processing", error);
      }
    };
    fetchData();
  }, []);

  const handleImageError = () => {
    setImageError(true); 
  };
  return (
      <div className="RightMain">
        <div className="ProfileContainer">
          <div className="Profile">
            <img  src={imageError ? defaultImage : imgURL}
            alt="profile"
            onError={handleImageError}  />
            <div className="ProfileData">
              <h3 className="ProfileName">{username}</h3>
              <strong>Login Details</strong>
              <div className="ProfileStatus">
                <p className="status"><b>IP Address : </b>{ipAddress != null ? ipAddress : ""}</p>
                <p className="status"><b>Time : </b>{lastLogin != null ? lastLogin : ""}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default RightSideAccount;
