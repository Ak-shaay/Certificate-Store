import React, { useState, useEffect } from "react";
import "./RightSideAccount.css";
import api from "../../Pages/axiosInstance";

import { domain } from "../../Context/config";
const RightSideAccount = () => {
  const [username, setUsername] = useState(null);
  const [issuedCount, setIssuedCount] = useState("--");
  const [certCount, setCertCount] = useState("--");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const imgURL = "http://" + domain + ":8080/images/" + username + ".png" || "";
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
          setIssuedCount(response.data.count[0].cert_count);
          const base64Url = accessToken.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const decodedToken = JSON.parse(atob(base64));
          setUsername(decodedToken.username);
          setCertCount(response.data.total[0].total_cert)
          // console.log("my log", decodedToken);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="MainAccount">
      <div className="RightMain">
        <h3> </h3>
        <div className="ProfileContainer">
          <div className="Profile">
            <img src={imgURL} alt="profile image" />
            <div className="ProfileData">
              <h3 className="ProfileName">{username}</h3>
              <div className="ProfileStatus">
                <div className="ProfileStatus1">
                  <span>Certificates</span>
                  <p>{certCount}</p>
                </div>
                <div className="ProfileStatus2">
                  <span>Issued</span>
                  <p>{issuedCount}</p>
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
