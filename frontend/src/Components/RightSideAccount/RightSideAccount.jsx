import React, { useState, useEffect } from "react";
import "./RightSideAccount.css";
import api from "../../Pages/axiosInstance";

import { domain } from "../../Context/config";
const RightSideAccount = () => {

  const [username, setUsername] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const imgURL = "http://"+domain+":8080/images/"+username+".png"
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
        }
        setUsername(response.data.profile[0].UserName);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  },[])
  return (
<div className="MainAccount">
    <div className="RightMain">
      <h3> </h3>
      <div className="ProfileContainer">
        <div className="Profile">
          <img src={imgURL} alt="profile image" />
          <div className="ProfileData">
            <h3 className="ProfileName">CDAC</h3>
            <div className="ProfileStatus">
              <div className="ProfileStatus1">
                <span>Certificates</span>
                <p>--</p>
              </div>
              <div className="ProfileStatus2">
                <span>Issued</span>
                <p>--</p>
              </div>
              <div className="ProfileStatus3">
                <span>Active</span>
                <p>--</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default RightSideAccount;
