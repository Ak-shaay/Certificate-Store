import React, { useState, useEffect } from "react";
import "../Organization/Organization.css";
import api from "../../Pages/axiosInstance";
import { domain } from "../../Context/config";
import refreshIcon from "../../Images/Icons/refresh.png";
import Backdrop from "@mui/material/Backdrop";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

const Organization = ({ onBack }) => {
  const [authData, setAuthData] = useState([]);
  const [authCode, setAuthCode] = useState("");
  const [authName, setAuthName] = useState("");
  const [authNo, setAuthNo] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [imgURL, setImgURL] = useState(
    domain + "/images/null.png"
  );
  const [roles, setRoles] = useState([]);
  const [updateMsg, setUpdateMsg] = useState("");
  const [imageKey, setImageKey] = useState(Date.now()); // Initialize with a timestamp to avoid caching
  const [open, setOpen] = useState(false);

  // Trigger image reloading by changing the imageKey state
  const handleEvent = () => {
    setImageKey(Date.now()); // Update the key to force re-rendering with a new query parameter or URL
  };

  const handlePopup = (auth) => {
    setOpen(true);
    setUpdateMsg("");
    const filtersElement = document.getElementById("filter");
    if (filtersElement) {
      filtersElement.style.display = "block";
    }
    setAuthCode(auth.AuthCode);
    setAuthName(auth.AuthName);
    setImgURL(`${domain}/images/${auth.AuthNo}.png?${imageKey}`);
    setAuthNo(auth.AuthNo);
  };

  const handlePopupClose = () => {
    setOpen(false);
    const filtersElement = document.getElementById("filter");
    if (filtersElement) {
      filtersElement.style.display = "none";
    }
    setIsEditing(false);
  };

  // Fetch data for authorities
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
    }
  }

  useEffect(() => {
    getAuthorities();
  }, []);

  // Save changes to authority
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

  // Generate new auth code
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

  // Handle image upload and processing
  async function handleImage(e, authNo) {
    try {
      const file = e.target.files[0];
      if (!file) {
        console.log("Empty profile image");
        return;
      }

      const size = file.size / 1024; // size in KB
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
        if (img.width > 150 || img.height > 150) {
          alert("Image dimensions must not exceed 150px by 150px");
          return;
        }
        setImgURL(imageUrl); // Update image preview

        // Proceed with resizing if needed
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
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

          const response = await fetch(`${domain}/api/profileImage`, {
            method: "POST",
            body: data,
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          handleEvent(); // Trigger image re-render
        }, "image/png");
      };
    } catch (error) {
      console.log("Error processing file upload", error);
    }
  }

  setTimeout(() => {
    setUpdateMsg(""); // Clear update message after 3 seconds
  }, 3000);

  return (
    <div className="orgBody">
      <div className="mainOrg">
        <div
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "1.5rem",
            marginBottom: "1rem",
            minWidth:'300px'
          }}
        >
          <h2 style={{ margin: 0, color: "rgb(60 87 153)" }}>Organizations</h2>
          <div style={{ position: "absolute", left: 0 }}>
            <button onClick={onBack} className="backButton">
              Back
            </button>
          </div>
        </div>
        <Backdrop
          sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
          open={open}
        >
          <div className="filterWindow filterWidth" id="filter">
            <div className="popup-head">
              <img src={imgURL} className="image" alt="logo" />
            </div>
            {isEditing && (
              <div className="editBtnContainer managementMsg">
                <label id="smallBtn">
                  <input
                    type="file"
                    name="image"
                    accept=".png"
                    id="imgUpload"
                    hidden
                    onChange={(e) => handleImage(e, authNo)}
                  />
                  <Tooltip
                    title="Please upload a PNG image with a maximum size of 200KB and dimensions of 150x150px"
                    placement="top"
                  >
                    Edit &#128397;
                  </Tooltip>
                </label>
              </div>
            )}
            <span className="close" onClick={handlePopupClose}>
              X
            </span>
            <div className="managementMsg">
              <span id="respMessage">{updateMsg}</span>
            </div>
            <FormControl variant="outlined" sx={{ gap: "1rem" }}>
              <TextField
                className="managementInput"
                id="authority"
                variant="outlined"
                value={authName}
                placeholder="Authority Name"
                disabled={!isEditing}
                onChange={(e) => setAuthName(e.target.value)}
              />
              <OutlinedInput
                className="managementInput"
                id="authcode"
                name="authCode"
                value={authCode}
                placeholder="AuthCode"
                disabled={!isEditing}
                onChange={(e) => setAuthCode(e.target.value)}
                endAdornment={
                  isEditing ? (
                    <InputAdornment position="end">
                      <button
                        type="button"
                        id="smallBtn"
                        onClick={handleGenAuth}
                      >
                        <img src={refreshIcon} alt="regenerate" />
                      </button>
                    </InputAdornment>
                  ) : null
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
                  onClick={() => handleSave(authName, authCode, authNo)}
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </Backdrop>
        <div className="orgcontainer">
          {authData.length === 0 ? (
            <div>No data available</div>
          ) : (
            authData.map((auth, index) => (
              <div key={index}>
                <article className="orgCard" onClick={() => handlePopup(auth)}>
                  <div>
                    <img
                      className="orgImg"
                      src={`${domain}/images/${auth.AuthNo}.png?${imageKey}`} // Add imageKey as query param
                      alt="image"
                    />
                  </div>
                </article>
                <div className="card_name">
                  {auth.AuthName || "Default Name"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Organization;
