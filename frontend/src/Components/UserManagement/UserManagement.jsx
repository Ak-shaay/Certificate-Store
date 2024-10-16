import React, { useState, useEffect } from "react";
import "./UserManagement.css";
import api from "../../Pages/axiosInstance";
import { domain } from "../../Context/config";
import refreshIcon from "../../Images/Icons/refresh.png";
const UserManagement = () => {
  const [authData, setAuthData] = useState([]);
  const [openSection, setOpenSection] = useState(null);
  const [authCode, setAuthCode] = useState("");
  const [authName, setAuthName] = useState("");
  const [authNo, setAuthNo] = useState("");
  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [imgURL, setImgURL] = useState(
    "http://" + domain + ":8080/images/null.png"
  );
  const [imgKey, setImgKey] = useState(0); // key is used to re render the image
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    role: "",
    // authCode: "",
    email: "",
    organization: "",
    address: "",
    state: "",
    postalcode: "",
    file: null,
  });

  const [dragOver, setDragOver] = useState(false);

  const [msg, setMsg] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");
  const [newAuth,setNewAuth]= useState('')
  
  const [newAuthErr,setNewAuthErr] = useState('')

  const validateForm = () => {
    const {
      name,
      password,
      role,
      // authCode,
      email,
      organization,
      address,
      state,
      postalcode,
      file,
    } = formData;
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
    // const authCodePattern = /^AUTH\d{3}$/;
    if (!newAuth.trim()) {
      setNewAuthErr("Invalid authorization number")
    }
    // Email validation
    if (!email.trim()) {
      newErrors.email = "email is required";
    }
    // Email validation
    if (!organization.trim()) {
      newErrors.organization = "Organization name is required";
    }
    // address validation
    if (!address.trim()) {
      newErrors.address = "address is required";
    }
    // state validation
    if (!state.trim()) {
      newErrors.state = "state is required";
    }
    // postalcode validation
    const postalRegex = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/;
    if (!postalcode) {
      newErrors.postalcode = "Postal code is required";
    } else if (!postalRegex.test(postalcode.trim())) {
      newErrors.postalcode = "Postal code must be at least 6 digits";
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
    const msg = document.getElementById("signupMsg");
    msg.style.color = "";
    msg.innerHTML = "";
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
          data.append("authCode", newAuth);
          data.append("email", formData.email);
          data.append("organization", formData.organization);
          data.append("address", formData.address);
          data.append("state", formData.state);
          data.append("postalcode", formData.postalcode);
          data.append("cert", formData.file);
          const response = await api.axiosInstance.post("/signup", data, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          if (response.status === 200) {
            setFormData({
              name: "",
              password: "",
              role: "",
              // authCode: "",
              email: "",
              organization: "",
              address: "",
              state: "",
              postalcode: "",
              file: null,
            });
            setNewAuth('');
            const msg = document.getElementById("signupMsg");
            msg.style.color = "green";
            msg.innerHTML = response.data.message;
          }
        }
      } catch (err) {
        setFormData({
          name: "",
          password: "",
          role: "",
          // authCode: "",
          email: "",
          organization: "",
          address: "",
          state: "",
          postalcode: "",
          file: null,
        });
        setNewAuth('');
        const msg = document.getElementById("signupMsg");
        msg.style.color = "red";
        msg.innerHTML = "Signup failed!";
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
        }
      }
    } catch (error) {
      console.error(error);
      // console.log("Error fetching the data: " + error);
    }
  }

  const handleToggle = (sectionId) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

  useEffect(() => {
    getAuthorities();
  }, []);

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
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => {
        setMsg("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  useEffect(() => {
    if (updateMsg) {
      const timer = setTimeout(() => {
        setUpdateMsg("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateMsg]);

  useEffect(() => {
    if (newAuthErr) {
      const timer = setTimeout(() => {
        setNewAuthErr("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [newAuthErr]);

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
          setImgKey(prevKey => prevKey + 1);
          getAuthorities();
        }
      }
    } catch (error) {
      respSpan.style.color = "red";
      setUpdateMsg("Error updating the data");
      setImgKey(prevKey => prevKey + 1);
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

  const handleNewAuth = async () => {
    try {
      const accessToken = api.getAccessToken();
      if (accessToken) {
        api.setAuthHeader(accessToken);
        const response = await api.axiosInstance.get("/generateAuthCode");

        if (response.status === 200) {
          setNewAuth(response.data.authCode);
          // setNewAuthErr(response.data.message);
        }
      }
    } catch (error) {
      setNewAuthErr("Error generating auth code");
    }
  };

  // region mapping------------------------------------
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [statesInRegion, setStatesInRegion] = useState([]);
  const [unassignedStates, setUnassignedStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStateDialogOpen, setIsStateDialogOpen] = useState(false); // State for new state dialog
  const [newRegionName, setNewRegionName] = useState("");
  const [newStateName, setNewStateName] = useState(""); // New state name
  // const [newStateCode, setNewStateCode] = useState(""); // New state code
  const [targetRegion, setTargetRegion] = useState("");

  // Fetch regions and states on component mount
  useEffect(() => {
    fetchRegions();
    fetchUnassignedStates();
  }, []);

  async function fetchRegions() {
    try {
      const response = await fetch(`http://${domain}:8080/region`);
      const data = await response.json();
      setRegions(data.filter((region) => region.label !== "unassigned"));
      if (data.length > 0) {
        const firstRegion = data[0].label;
        setSelectedRegion(firstRegion);
        fetchStatesByRegion(firstRegion);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  }

  async function fetchUnassignedStates() {
    try {
      const response = await fetch(`http://${domain}:8080/getStatesByRegion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regions: ["unassigned"] }),
      });
      const data = await response.json();
      setUnassignedStates(data || []);
    } catch (error) {
      console.error("Error fetching unassigned states:", error);
    }
  }

  async function fetchStatesByRegion(region) {
    try {
      const response = await fetch(`http://${domain}:8080/getStatesByRegion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regions: [region] }),
      });
      const data = await response.json();
      setStatesInRegion(data || []);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  }

  function handleRegionChange(event) {
    const region = event.target.value;
    setSelectedRegion(region);
    fetchStatesByRegion(region);
  }

  function handleStateSelection(event) {
    setSelectedState(event.target.value);
  }

  async function removeStateFromRegion() {
    try {
      await fetch(`http://${domain}:8080/moveStatesOfRegion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region: selectedRegion,
          state: selectedState,
          action: "remove",
          newRegion: "unassigned",
        }),
      });
      fetchStatesByRegion(selectedRegion);
      fetchUnassignedStates(); // Refresh unassigned states after removal
    } catch (error) {
      console.error("Error removing state:", error);
    }
  }

  async function addStateToRegion() {
    try {
      await fetch(`http://${domain}:8080/moveStatesOfRegion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region: "unassigned", // Current region
          state: selectedState, // State to move
          action: "add", // Action: 'add' to add to new region or 'move' to move
          newRegion: selectedRegion, // The region to which state is moved
        }),
      });
      fetchStatesByRegion(selectedRegion); // Refresh the states of the current region
      fetchUnassignedStates(); // Refresh unassigned states
    } catch (error) {
      console.error("Error adding state:", error);
    }
  }

  async function createNewRegion() {
    if (!newRegionName) {
      alert("Region name is required!");
      return;
    }

    try {
      await fetch(`http://${domain}:8080/addRegion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region: newRegionName }),
      });
      fetchRegions();
      setIsDialogOpen(false);
      setNewRegionName("");
    } catch (error) {
      console.error("Error creating new region:", error);
    }
  }

  function openNewStateDialog() {
    setIsStateDialogOpen(true);
    setNewStateName("");
  }

  async function handleSaveNewState() {
    if (!newStateName) {
      alert("State name is required");
      return;
    }

    try {
      const response = await fetch(
        `http://${domain}:8080/updateStatesOfRegion`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            region: "unassigned",
            oldValue: null, 
            newLabel: newStateName,
            newValue: newStateName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save new state");
      }

      // Refresh unassigned states after adding
      fetchUnassignedStates();
      setIsStateDialogOpen(false);
    } catch (error) {
      console.error("Error saving new state:", error);
    }
  }

  function closeNewStateDialog() {
    setIsStateDialogOpen(false);
  }

  function handleDeleteRegion() {
    // Check if a region is selected
    if (!selectedRegion) {
      alert("Please select a region to delete.");
      return;
    }

    // Confirm the deletion
    const confirmDeletion = window.confirm(
      `Are you sure you want to delete the region: ${selectedRegion}?`
    );
    if (!confirmDeletion) {
      return;
    }

    // Perform the deletion
    fetch(`http://${domain}:8080/removeRegion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ region: selectedRegion }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete region.");
        }
        return response.json();
      })
      .then(() => {
        alert(`Region ${selectedRegion} has been deleted.`);
        // Refresh the list of regions after deletion
        fetchRegions();
        // Reset the selected region
        setSelectedRegion("");
        setStatesInRegion([]);
      })
      .catch((error) => {
        console.error("Error deleting region:", error);
        alert("There was an error deleting the region.");
      });
  }

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
        setImgKey(prevKey => prevKey + 1); 
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
    <div className="mainUser">
      <h2>Manage System Settings</h2>
      <div className="filterWindow" id="filter">
        <div className="popup-head">
          <img src={imgURL} key={imgKey} className="image" alt="logo" />
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
                key={imgKey} 
                  className="image"
                  src={`http://${domain}:8080/images/${auth.AuthNo}.png`}
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
              <label htmlFor="authCode">Authorization Code</label>
              <input
                type="text"
                id="authCode"
                name="authCode"
                placeholder="Auth code"
                value={newAuth}
                readOnly
                onChange={handleChange}
                required
              />
               <button
              type="button"
              className="gen-button"
              onClick={handleNewAuth}
            >
              <img src={refreshIcon} alt="regenerate" />
            </button>
              {/* {errors.authCode && <p className="errorMsg">{errors.authCode}</p>} */}
              {newAuthErr && <p className="errorMsg">{newAuthErr}</p>}
            </div>
            <div className="inputGroup">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <p className="errorMsg">{errors.email}</p>}
            </div>
            <div className="inputGroup">
              <label htmlFor="organization">Organization</label>
              <input
                type="text"
                id="organization"
                name="organization"
                placeholder="Organization"
                value={formData.organization}
                onChange={handleChange}
                required
              />
              {errors.organization && (
                <p className="errorMsg">{errors.organization}</p>
              )}
            </div>
            <div className="inputGroup">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                required
              />
              {errors.address && <p className="errorMsg">{errors.address}</p>}
            </div>
            <div className="inputGroup">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                required
              />
              {errors.state && <p className="errorMsg">{errors.state}</p>}
            </div>
            <div className="inputGroup">
              <label htmlFor="postalcode">Postal Code</label>
              <input
                type="text"
                id="postalcode"
                name="postalcode"
                placeholder="Postal Code"
                value={formData.postalcode}
                onChange={handleChange}
                required
              />
              {errors.postalcode && (
                <p className="errorMsg">{errors.postalcode}</p>
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
          <span id="signupMsg"></span>
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
        <div className="grid">
          <div className="region">
            <div className="zone-selection zone-body">
              <h2>Select Region</h2>
              {regions.map((region) => (
                <div key={region.value}>
                  <label>
                    <input
                      type="radio"
                      name="region"
                      value={region.label}
                      checked={selectedRegion === region.label}
                      onChange={handleRegionChange}
                    />
                    {region.label}
                  </label>
                </div>
              ))}
              <div className="button-container">
                <button
                  id="create-button"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Create New Region
                </button>
              </div>
              <div id="delete-button" className="button-container">
                <button onClick={handleDeleteRegion}>
                  Delete Selected Region
                </button>
              </div>
            </div>

            <div className="states-in-zone zone-body">
              <h2>States in {selectedRegion}</h2>
              {Array.isArray(statesInRegion) && statesInRegion.length > 0 ? (
                statesInRegion.map((state) => (
                  <div key={state.value}>
                    <label>
                      <input
                        type="checkbox"
                        name="stateInRegion"
                        value={state.value}
                        checked={selectedState === state.value}
                        onChange={handleStateSelection}
                      />

                      {state.label}
                    </label>
                  </div>
                ))
              ) : (
                <div>No states available for this region.</div>
              )}
              <div id="delete-button" className="button-container">
                <button id="remove-button" onClick={removeStateFromRegion}>
                  Remove State from {selectedRegion}{" "}
                </button>
              </div>
            </div>

            <div className="states-outside-zone zone-body">
              <h2>Unassigned States</h2>
              {Array.isArray(unassignedStates) &&
              unassignedStates.length > 0 ? (
                unassignedStates.map((state) => (
                  <div key={state.value}>
                    <label>
                      <input
                        type="checkbox"
                        name="unassignedState"
                        value={state.value}
                        checked={selectedState === state.value}
                        onChange={handleStateSelection}
                      />
                      {state.label} ({state.value})
                    </label>
                  </div>
                ))
              ) : (
                <div>No unassigned states available.</div>
              )}
              <div>
                <div className="button-container">
                  <button id="add-button" onClick={addStateToRegion}>
                    Add to {selectedRegion} region
                  </button>
                </div>
                <div id="add-state" className="button-container">
                  <button onClick={() => openNewStateDialog(true)}>
                    Add New State
                  </button>
                </div>
              </div>
            </div>

            {isDialogOpen && (
              <div className="dialog">
                <h2>Add New Region</h2>
                <label>
                  Region Name:
                  <input
                    type="text"
                    value={newRegionName}
                    onChange={(e) => setNewRegionName(e.target.value)}
                    required
                  />
                </label>
                <button onClick={createNewRegion}>Save</button>
                <button onClick={() => setIsDialogOpen(false)}>Close</button>
              </div>
            )}

            {isStateDialogOpen && (
              <div className="dialog">
                <h2>Add New State</h2>
                <label>
                  State Name:
                  <input
                    type="text"
                    value={newStateName}
                    onChange={(e) => setNewStateName(e.target.value)}
                    required
                  />
                </label>
                <button onClick={handleSaveNewState}>Save</button>
                <button onClick={closeNewStateDialog}>Close</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
