import React, { useState, useEffect } from "react";
import "./RightSideAccount.css";
import api from "../../Pages/axiosInstance";
import { domain } from "../../Context/config";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

const RightSideAccount = () => {
  const defaultImage = "http://" + domain + ":8080/images/null.png";

  const [username, setUsername] = useState(null);
  const [authNo, setAuthNo] = useState(null);
  const [ipAddress, setIpAddress] = useState(null);
  const [lastLogin, setLastLogin] = useState(null);
  const [currentImgSrc, setCurrentImgSrc] = useState(defaultImage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (authNo) {
      setCurrentImgSrc(`http://${domain}:8080/images/${authNo}.png`);
    } else {
      setCurrentImgSrc(defaultImage);
    }
  }, [authNo]);

  const handleImageError = (e) => {
    e.target.onerror = null;
    setCurrentImgSrc(defaultImage);
  };

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
        const base64Url = accessToken.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedToken = JSON.parse(atob(base64));

        setUsername(decodedToken.name);
        setAuthNo(decodedToken.authNo);
        setIpAddress(response.data.ip);
        setLastLogin(response.data.lastLogin);
      } catch (err) {
        console.error("An error occurred while processing", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
      >
      </Box>
    );
  }

  return (
    <div className="RightMain">
      <div className="ProfileContainer">
        <div className="Profile">
          {loading ? (
            <Skeleton animation="wave" variant="circular" width={50} height={50} />
          ) : (
            <img
              src={currentImgSrc}
              alt="profile"
              onError={handleImageError}
              width={100}
              height={100}
              style={{ borderRadius: "50%" }}
            />
          )}
          <div className="ProfileData">
            {loading ? (
              <>
                <Skeleton animation="wave" width="60%" height={30} />
                <Skeleton animation="wave" width="40%" />
                <Skeleton animation="wave" width="80%" />
                <Skeleton animation="wave" width="80%" />
              </>
            ) : (
              <>
                <h3 className="ProfileName">{username}</h3>
                <strong>Login Details</strong>
                <div className="ProfileStatus">
                  <p className="status">
                    <b>IP Address: </b>
                    {ipAddress}
                  </p>
                  <p className="status">
                    <b>Time: </b>
                    {lastLogin}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSideAccount;
