
import React, { useState,useEffect } from "react";
import "../Organization/Organization.css";
import api from "../../Pages/axiosInstance";
import { domain } from "../../Context/config";
import refreshIcon from "../../Images/Icons/refresh.png";

const Organization = () => {
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
              getAuthorities();
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
      async function handleImage(e,authNo) {  
        const size = e.target.files[0].size;
        const type = e.target.files[0].type;
        if (size/1024 > 200) {
          alert("image size must not be greater than to 200Kb")
          return
        }
        if( type != 'image/png'){
          alert("image must be in png format")
          return
        }
        try {
          if (e.target.files[0]) {
        const imageUrl = URL.createObjectURL(e.target.files[0]);
          setImgURL(imageUrl);
            const data = new FormData();
            data.append('image', e.target.files[0]);
            data.append('authNo', authNo); 
            fetch(`http://${domain}:8080/profileImage`, {
              method: 'POST',
              body: data,
              credentials: 'include'
            })
              .then(data => {
                console.log(data);
              })
              .catch(error => {
                console.log("Error getting response", error); 
              });
          } else {
            console.log("Empty profile image"); 
          }
        } catch (error) {
          console.log("Error processing file upload", error); 
        }
       
      }
  return (
    <div className="orgBody">
    <div className="mainOrg">
      <h2>Manage Organizations</h2>
      <div className="filterWindow" id="filter">
        <div className="popup-head">
          <img src={imgURL}className="image" alt="logo" />
          </div>
            {isEditing?<div className="editBtnContainer">
          <label className="plusBtn">
          <input type="file" name="image"  id="imgUpload" hidden onChange={(e) => {
           handleImage(e,authNo);
          }}>
          </input>Edit &#128397;</label>
          </div>:<></>}
        <span className="close" onClick={handlePopupClose}>
          X
        </span>
        <span id="respMessage">{updateMsg}</span>
        <input
          id="authority"
          className="popup-input"
          type="text"
          name="Authority Name"
          value={authName}
          placeholder="Authority Name"
          readOnly={!isEditing}
          onChange={(e) => {
            setAuthName(e.target.value);
          }}
        />
        <input
          id="AuthCode"
          className="popup-input auth-code"
          type="text"
          name="authCode"
          value={authCode}
          placeholder="AuthCode"
          readOnly
          onChange={(e) => setAuthCode(e.target.value)}
        />
        {isEditing ? (
          <>
            <button
              type="button"
              className="gen-button"
              onClick={handleGenAuth}
            >
              <img src={refreshIcon} alt="regenerate" />
            </button>
          </>
        ) : (
          <></>
        )}
        {!isEditing ? (
          <button
            type="button"
            className="submitForm"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        ) : (
          <button
            type="button"
            className="submitForm"
            onClick={() => {
              handleSave(authName, authCode, authNo);
            }}
          >
            Save
          </button>
        )}
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
              <div className="card_name">{auth.AuthName || "Default Name"}</div></div>
          ))}
        </div>
      </div>
      </div>
  )
}

export default Organization