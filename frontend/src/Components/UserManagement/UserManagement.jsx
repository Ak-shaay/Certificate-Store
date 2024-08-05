import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserManagement.css";
import { domain } from "../../Context/config";

const UserManagement = () => {
  const [authData, setAuthData] = useState([]);
  const [authCode, setAuthCode] = useState('');
  const [authName, setAuthName] = useState('');
  const [imgURL, setImgURL] = useState('http://10.182.3.123:8080/images/admin.png');

  async function getAuthorities() {
    try {
      const response = await axios.post(`http://${domain}:8080/getAllAuths`);
      setAuthData(response.data);
    } catch (error) {
      console.log("Error fetching the data: " + error);
    }
  }

  useEffect(() => {
    getAuthorities();
  }, []);

  const handlePopup = (auth) => {
    const filtersElement = document.getElementById("filter");
    if (filtersElement) {
      filtersElement.style.display = "block";
    }
    setAuthCode(auth.AuthCode);
    setAuthName(auth.AuthName);
    setImgURL('http://10.182.3.123:8080/images/'+auth.AuthNo+'.png')
  };

  const handlePopupClose = () => {
    const filtersElement = document.getElementById("filter");
    if (filtersElement) {
      filtersElement.style.display = "none";
    }
  };

  return (
    <div className="mainUser">
      <div className="filterWindow" id="filter">
        <h2 className="popup-head"><img src={imgURL} className="image" alt="logo"/></h2>
        <span className="close" onClick={handlePopupClose}>
          X
        </span>
        <input
          id="authority"
          className="popup-input"
          type="text"
          name="Authority Name"
          value={authName}
          placeholder="Authority Name"
          readOnly
        />
        <input
          id="AuthCode"
          className="popup-input"
          type="text"
          name="authCode"
          value={authCode}
          placeholder="AuthCode"
          readOnly
        />
      </div>
      <div className="grid-container">
        {authData.map((auth, index) => (
          <article
            key={index}
            className="card"
            onClick={() => handlePopup(auth)}
          >
            <div className="card_img">
              <img
                className="image"
                src={`http://10.182.3.123:8080/images/${auth.AuthNo}.png`}
                alt={"image/png"}
              />
            </div>
            <div className="card_name">{auth.AuthName || "Default Name"}</div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
