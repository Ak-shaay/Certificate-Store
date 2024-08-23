import React, { useState, useEffect } from "react";
import "./UserManagement.css";
import api from "../../Pages/axiosInstance";
import { domain } from "../../Context/config";

const UserManagement = () => {
  const [authData, setAuthData] = useState([]);
  const [lastAuth, setLastAuth] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const [authCode, setAuthCode] = useState("");
  const [authName, setAuthName] = useState("");
  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [imgURL, setImgURL] = useState(
    "http://10.182.3.123:8080/images/null.png"
  );
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    role: "",
    authCode: "",
    file: null,
  });

  const [subType, setSubType] = useState([]);

  const [dragOver, setDragOver] = useState(false);

  const [entity, setEntity] = useState("");
  const [msg, setMsg] = useState("");
  const [refreshData, setRefreshData] = useState(false);


  const handleNewEntity = async (entity) => {
    if (!entity.trim()) {
      setMsg("Please add a valid entity");
      return;
    }
  
    const raw = JSON.stringify({ subject: entity });
  
    const requestOptions = {
      method: "POST",
      body: raw,
      headers: { "Content-Type": "application/json" }, // Ensure headers are set
      redirect: "follow",
    };
  
    try {
      const response = await fetch(`http://${domain}:8080/addSubjectType`, requestOptions);
  
      if (!response.ok) {
        const errorData = await response.json();
        setMsg(errorData.error || "An unknown error occurred");
        return;
      }
      setMsg("Added successfully");
      setRefreshData(prev => !prev); 
    } catch (error) {
      setMsg("Network error: " + error.message);
    }
  };
  
  const validateForm = () => {
    const { name, password, role, authCode, file } = formData;
    const newErrors = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(password.trim())) {
      newErrors.password =
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character";
    }

    // Role validation
    const validRoles = ["Admin", "CA", "CCA"];
    if (!validRoles.includes(role)) {
      newErrors.role = "Invalid role";
    }

    // Authorization Code validation
    const authCodePattern = /^AUTH\d{3}$/;
    if (!authCode.match(authCodePattern)) {
      newErrors.authCode = "Authorization code must be in given format";
    }

    // File validation
    if (file) {
      const fileExtension = file.name.split(".").pop();
      if (fileExtension !== "cer") {
        newErrors.file = "File must be a .cer file";
      }
    } else {
      newErrors.file = "File is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    setFormData({ ...formData, file: e.dataTransfer.files[0] });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const accessToken = api.getAccessToken();
        if (accessToken) {
          api.setAuthHeader(accessToken);
          const data = new FormData();
          data.append("username", formData.name);
          data.append("password", formData.password);
          data.append("role", formData.role);
          data.append("authCode", formData.authCode);
          if (formData.file) {
            const base64File = await convertFileToBase64(formData.file);
            data.append("file", base64File);
          }
          const response = await api.axiosInstance.post("/signup", data, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          // Handle response if needed
        }
      } catch (err) {
        console.error("Error submitting form:", err);
      }
    }
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
          setLastAuth(response.data.AuthNo[0].last_authno);
        }
      }
    } catch (error) {
      console.log("Error fetching the data: " + error);
    }
  }

  const handleToggle = (sectionId) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

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
    setImgURL(`http://10.182.3.123:8080/images/${auth.AuthNo}.png`);
  };

  const handlePopupClose = () => {
    const filtersElement = document.getElementById("filter");
    if (filtersElement) {
      filtersElement.style.display = "none";
    }
  };

  useEffect(() => {
    fetch(`http://${domain}:8080/getSubType`)
      .then((response) => response.json())
      .then((data) => setSubType(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, [refreshData]);

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => {
        setMsg("");
      }, 3000);
      return () => clearTimeout(timer); 
    }
  }, [msg]);
  return (
    <div className="mainUser">
      <h2>Manage System Settings</h2>
      <div className="filterWindow" id="filter">
        <h2 className="popup-head">
          <img src={imgURL} className="image" alt="logo" />
        </h2>
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
      <button
        type="button"
        className={`collapsible ${openSection === "section1" ? "active" : ""}`}
        onClick={() => handleToggle("section1")}
      >
        Manage Existing User
      </button>
      <div
        className={`content ${openSection === "section1" ? "show" : "hide"}`}
      >
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
                  alt="image"
                />
              </div>
              <div className="card_name">{auth.AuthName || "Default Name"}</div>
            </article>
          ))}
        </div>
      </div>
      <button
        type="button"
        className={`collapsible ${openSection === "section2" ? "active" : ""}`}
        onClick={() => handleToggle("section2")}
      >
        Create New User
      </button>
      <div
        className={`content ${openSection === "section2" ? "show" : "hide"}`}
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <div className="inputGroup">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <p className="errorMsg">{errors.name}</p>}
            </div>
            <div className="inputGroup">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <p className="errorMsg">{errors.password}</p>}
            </div>
            <div className="inputGroup">
              <label htmlFor="role">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="selectRole"
              >
                <option value="">Select role</option>
                {roles.map((roleobj, index) => (
                  <option key={index} value={roleobj.role}>
                    {roleobj.role}
                  </option>
                ))}
              </select>
              {errors.role && <p className="errorMsg">{errors.role}</p>}
            </div>
            <div className="inputGroup">
              <label htmlFor="authCode">
                Authorization Code (prev: AUTH0{lastAuth})
              </label>
              <input
                type="text"
                id="authCode"
                name="authCode"
                placeholder="Auth code"
                value={formData.authCode}
                onChange={handleChange}
                required
              />
              {errors.authCode && (
                <p className="errorMsg">{errors.authCode}</p>
              )}
            </div>
          </div>

          <div
            className={`inputGroup file-upload ${dragOver ? "drag-over" : ""}`}
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <p>
              {formData.file
                ? formData.file.name
                : "Drag & drop a file(.cer) here or click to upload"}
            </p>
            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="fileInput"
            />
            <label htmlFor="fileInput" className="file-upload-label">
              Choose File
            </label>
            {errors.file && <p className="errorMsg">{errors.file}</p>}
            {formData.file && <p>Selected file: {formData.file.name}</p>}
          </div>

          <button type="submit" className="submitForm">
            Submit
          </button>
        </form>
      </div>
      <button
        type="button"
        className={`collapsible ${openSection === "section3" ? "active" : ""}`}
        onClick={() => handleToggle("section3")}
      >
        System Parameters
      </button>
      <div
        className={`content ${openSection === "section3" ? "show" : "hide"}`}
      >
        <h1>Hello</h1>
        <div className="grid-container2">
          <div></div>
          <div id="formDiv">
            <h1>Entity List</h1>
            <div className="add-list">
              <input
                type="text"
                className="sub-input"
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
              />
              <button
                type="button"
                className="plus-button"
                onClick={() => handleNewEntity(entity)}
              >
                +
              </button>
            </div>
            <span className="errorMsg">{msg}</span>
            <div className="sub-list">
              {subType.length > 0 ? (
                <ul>
                  {subType.map((item, index) => (
                    <li key={index}>
                      {item.label}
                      <button className="remove-button" onClick={() => {/* Handle remove */}}>
                        &#128465;
                      </button>
                      <button className="edit-button" onClick={() => {/* Handle edit */}}>
                        &#128393;
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No entities found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
