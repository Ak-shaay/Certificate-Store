import React, { useState, useEffect } from "react";
import "./RightSideAccount.css";
import api from "../../Pages/axiosInstance";

import { domain } from "../../Context/config";
const RightSideAccount = () => {
  const [username, setUsername] = useState(null);
  const [authNo, setAuthNo] = useState("");
  const [ipAddress, setIpAddress] = useState(null);
  const [lastLogin, setLastLogin] = useState(null);

  const imgURL = "http://" + domain + ":8080/images/" + authNo + ".png" || "";
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
          setUsername(decodedToken.username);
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
  return (
    <div className="MainAccountz">
      <div className="RightMain">
        <h3> </h3>
        <div className="ProfileContainer">
          <div className="Profile">
            <img src={imgURL} alt="profile image" />
            <div className="ProfileData">
              <h3 className="ProfileName">{username}</h3>
              <strong>Last Login Detaails</strong>
              <div className="ProfileStatus">
                <p className="status"><b>IP Address : </b>{ipAddress != null ? ipAddress : ""}</p>
                <p className="status"><b>Time : </b>{lastLogin != null ? lastLogin : ""}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSideAccount;
