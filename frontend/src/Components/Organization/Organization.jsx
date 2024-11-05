import React, { useState, useEffect } from "react";
import "../Organization/Organization.css";
import api from "../../Pages/axiosInstance";
import { domain } from "../../Context/config";
import refreshIcon from "../../Images/Icons/refresh.png";
import {
  FormControl,
  InputAdornment,
  OutlinedInput,
  TextField,
} from "@mui/material";

const Organization = ({ onBack }) => {
  const [authData, setAuthData] = useState([]);
  const [authCode, setAuthCode] = useState("");
  const [authName, setAuthName] = useState("");
  const [authNo, setAuthNo] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [imgURL, setImgURL] = useState(
    "http://" + domain + ":8080/images/null.png"
  );
  const [roles, setRoles] = useState([]);
  const [updateMsg, setUpdateMsg] = useState("");

  const handlePopup = (auth) => {
    setUpdateMsg("");
    const filtersElement = document.getElementById("filter");
    if (filtersElement) {
      filtersElement.style.display = "block";
    }
    setAuthCode(auth.AuthCode);
    setAuthName(auth.AuthName);
    setImgURL(`http://${domain}:8080/images/${auth.AuthNo}.png`);
    setAuthNo(auth.AuthNo);
  };

  const handlePopupClose = () => {
    const filtersElement = document.getElementById("filter");
    if (filtersElement) {
      filtersElement.style.display = "none";
    }
    setIsEditing(false);
  };
  async function getAuthorities() {
    try {
      const accessToken = api.getAccessToken();

      if (accessToken) {
        api.setAuthHeader(accessToken);
        const response = await api.axiosInstance.post("/getAllAuths");
        if (response.status === 200) {          
          setAuthData(response.data.authorities);
          setRoles(response.data.distinctRoles);
        }
      }
    } catch (error) {
      console.error(error);
      // console.log("Error fetching the data: " + error);
    }
  }
  useEffect(() => {
    getAuthorities();
  }, []);

  const handleSave = async (authName, authCode, authNo) => {
    const respSpan = document.getElementById("respMessage");

    try {
      const accessToken = api.getAccessToken();
      if (accessToken) {
        api.setAuthHeader(accessToken);
        const response = await api.axiosInstance.post("/updateAuths", {
          authName,
          authCode,
          authNo,
        });
        if (response.status === 200) {
          respSpan.style.color = "green";
          setUpdateMsg(response.data.message);
          setIsEditing(false);
          await getAuthorities();
        }
      }
    } catch (error) {
      respSpan.style.color = "red";
      setUpdateMsg("Error updating the data");
      setIsEditing(false);
    }
  };
  const handleGenAuth = async () => {
    const respSpan = document.getElementById("respMessage");

    try {
      const accessToken = api.getAccessToken();
      if (accessToken) {
        api.setAuthHeader(accessToken);
        const response = await api.axiosInstance.get("/generateAuthCode");

        if (response.status === 200) {
          setAuthCode(response.data.authCode);
          respSpan.style.color = "green";
          setUpdateMsg(response.data.message);
        }
      }
    } catch (error) {
      respSpan.style.color = "red";
      setUpdateMsg("Error generating auth code");
    }
  };
  async function handleImage(e, authNo) {
    try {
      const file = e.target.files[0];
      if (!file) {
        console.log("Empty profile image");
        return;
      }
  
      const size = file.size / 1024; 
      const type = file.type;
  
      if (size > 200) {
        alert("Image size must not exceed 200KB");
        return;
      }
  
      if (type !== "image/png") {
        alert("Image must be in PNG format");
        return;
      }
  
      const imageUrl = URL.createObjectURL(file);
      
      // Create an off-screen canvas to check dimensions and resize the image
      const img = new Image();
      img.src = imageUrl;
      
      img.onload = async () => {
        // Check image dimensions
        if (img.width > 100 || img.height > 100) {
          alert("Image dimensions must not exceed 100px by 100px");
          return;
        }
        setImgURL(imageUrl);
  
        // Proceed with resizing if needed
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxSize = 100; // Limit height and width to 100px
  
        // Set canvas dimensions
        canvas.width = maxSize;
        canvas.height = maxSize;
  
        // Calculate the new dimensions while maintaining aspect ratio
        const aspectRatio = img.width / img.height;
        if (aspectRatio > 1) {
          // Landscape
          canvas.height = maxSize / aspectRatio;
        } else {
          // Portrait
          canvas.width = maxSize * aspectRatio;
        }
  
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to Blob
        canvas.toBlob(async (blob) => {
          const data = new FormData();
          data.append("image", blob, file.name);
          data.append("authNo", authNo);
  
          const response = await fetch(`http://${domain}:8080/profileImage`, {
            method: "POST",
            body: data,
            credentials: "include",
          });
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const result = await response.json();
          console.log(result);
        }, 'image/png');
      };
    } catch (error) {
      console.log("Error processing file upload", error);
    }
  }
  
  return (
    <div className="orgBody">
      <div className="mainOrg">
        <div className="backClass">
          <button onClick={onBack} className="backButton">
            Back
          </button>
        </div>
        <h2>Manage Organizations</h2>
        <div className="filterWindow" id="filter">
          <div className="popup-head">
            <img src={imgURL} className="image" alt="logo" />
          </div>
          {isEditing ? (
            <div className="editBtnContainer">
              <label id="smallBtn">
                <input
                  type="file"
                  name="image"
                  id="imgUpload"
                  hidden
                  onChange={(e) => {
                    handleImage(e, authNo);
                  }}
                ></input>
                Edit &#128397;
              </label>
            </div>
          ) : (
            <></>
          )}
          <span className="close" onClick={handlePopupClose}>
            X
          </span>
          <div className="managementMsg">
            <span id="respMessage">{updateMsg}</span>
          </div>
          <FormControl variant="outlined" sx={{gap:'1rem'}}>
            <TextField
              className="managementInput"
              id="authority"
              variant="outlined"
              value={authName}
              placeholder="Authority Name"
              readOnly={!isEditing}
              onChange={(e) => {
                setAuthName(e.target.value);
              }}
            />
            <OutlinedInput
              className="managementInput"
              id="authcode"
              name="authCode"
              value={authCode}
              placeholder="AuthCode"
              readOnly
              onChange={(e) => setAuthCode(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        id="smallBtn"
                        onClick={handleGenAuth}
                      >
                        <img src={refreshIcon} alt="regenerate" />
                      </button>
                    </>
                  ) : (
                    <></>
                  )}
                </InputAdornment>
              }
            />
          </FormControl>
          <div className="managementBtn">
            {!isEditing ? (
              <button
                id="editBtn"
                type="button"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            ) : (
              <button
                type="button"
                id="editBtn"
                className="submitForm"
                onClick={() => {
                  handleSave(authName, authCode, authNo);
                }}
              >
                Save
              </button>
            )}
          </div>
        </div>
        <div className="orgcontainer">
          {authData.map((auth, index) => (
            <div className="">
              <article
                key={index}
                className="orgCard"
                onClick={() => handlePopup(auth)}
              >
                <div>
                  <img
                    className="orgImg"
                    src={`http://${domain}:8080/images/${auth.AuthNo}.png`}
                    alt="image"
                  />
                </div>
              </article>
              <div className="card_name">{auth.AuthName || "Default Name"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Organization;
