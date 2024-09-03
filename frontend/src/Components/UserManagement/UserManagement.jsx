import React, { useState, useEffect } from "react";
import "./UserManagement.css";
import api from "../../Pages/axiosInstance";
import { domain } from "../../Context/config";
//import regionsData from '../backend/public/statesByRegion.json';

const UserManagement = () => {
  const [authData, setAuthData] = useState([]);
  const [lastAuth, setLastAuth] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const [authCode, setAuthCode] = useState("");
  const [authName, setAuthName] = useState("");
  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [imgURL, setImgURL] = useState(
    "http://10.182.2.37:8080/images/null.png"
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
      headers: { "Content-Type": "application/json" }, 
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
  const handleEntityDeletion = async (entity) => {
    const raw = JSON.stringify({ subject: entity });
  
    const requestOptions = {
      method: "POST",
      body: raw,
      headers: { "Content-Type": "application/json" }, // Ensure headers are set
      redirect: "follow",
    };
  
    try {
      const response = await fetch(`http://${domain}:8080/removeSubType`, requestOptions);
  
      if (!response.ok) {
        const errorData = await response.json();
        setMsg(errorData.error || "An unknown error occurred");
        return;
      }
      setMsg("Removed successfully");
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
    setImgURL(`http://10.182.2.37:8080/images/${auth.AuthNo}.png`);
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

  // region mapping------------------------------------
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [statesInRegion, setStatesInRegion] = useState([]);
  const [unassignedStates, setUnassignedStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStateDialogOpen, setIsStateDialogOpen] = useState(false); // State for new state dialog
  const [newRegionName, setNewRegionName] = useState('');
  const [newStateName, setNewStateName] = useState(''); // New state name
  const [newStateCode, setNewStateCode] = useState(''); // New state code
  const [targetRegion, setTargetRegion] = useState(''); 

  // Fetch regions and states on component mount
  useEffect(() => {
    
    fetchRegions();
    fetchUnassignedStates();

  }, []);



  async function fetchRegions() {
    try {
      const response = await fetch(`http://${domain}:8080/region`);
      const data = await response.json();
      setRegions(data.filter(region => region.label !== 'unassigned'));
      if (data.length > 0) {
        const firstRegion = data[0].label;
        setSelectedRegion(firstRegion);
        fetchStatesByRegion(firstRegion);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  }

  async function fetchUnassignedStates() {
    try {
      const response = await fetch(`http://${domain}:8080/getStatesByRegion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regions: ['unassigned'] })
      });
      const data = await response.json();
      setUnassignedStates(data || []);
    } catch (error) {
      console.error('Error fetching unassigned states:', error);
    }
  }


  async function fetchStatesByRegion(region) {
    try {
      const response = await fetch(`http://${domain}:8080/getStatesByRegion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regions: [region] })
      });
      const data = await response.json();
      console.log('Fetched states:', data); // Debugging line
      setStatesInRegion(data || []);
    } catch (error) {
      console.error('Error fetching states:', error);
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region: selectedRegion,
          state: selectedState,
          action: 'remove',
          newRegion: 'unassigned'
        })
      });
      fetchStatesByRegion(selectedRegion);
      fetchUnassignedStates(); // Refresh unassigned states after removal
    } catch (error) {
      console.error('Error removing state:', error);
    }
  }

  async function addStateToRegion() {
    try {
      await fetch(`http://${domain}:8080/moveStatesOfRegion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region: 'unassigned', // Current region
          state: selectedState,  // State to move
          action: 'add',         // Action: 'add' to add to new region or 'move' to move
          newRegion: selectedRegion // The region to which state is moved
        })
      });
      fetchStatesByRegion(selectedRegion); // Refresh the states of the current region
      fetchUnassignedStates(); // Refresh unassigned states
    } catch (error) {
      console.error('Error adding state:', error);
    }
}


  

  async function createNewRegion() {
    if (!newRegionName) {
      alert('Region name is required!');
      return;
    }

    try {
      await fetch(`http://${domain}:8080/addRegion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: newRegionName })
      });
      // Refresh the list of regions after adding a new one
      fetchRegions();
      setIsDialogOpen(false);
      setNewRegionName('');
    } catch (error) {
      console.error('Error creating new region:', error);
    }
  }

  function openNewStateDialog() {
    setIsStateDialogOpen(true);
    setNewStateName('');
    setNewStateCode('');
  }

  async function handleSaveNewState() {
    if (!newStateName || !newStateCode) {
        alert('Both state name and state code are required');
        return;
    }

    try {
        const response = await fetch(`http://${domain}:8080/updateStatesOfRegion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                region: 'unassigned',
                oldValue: null, // Not applicable for new state, use null or a default value
                newLabel: newStateName,
                newValue: newStateCode
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save new state');
            
        }

        // Refresh unassigned states after adding
        fetchUnassignedStates(); 
        setIsStateDialogOpen(false);
    } catch (error) {
        console.error('Error saving new state:', error);
    }
}



  function closeNewStateDialog() {
    setIsStateDialogOpen(false);
  }

  function handleDeleteRegion() {
    // Check if a region is selected
    if (!selectedRegion) {
      alert('Please select a region to delete.');
      return;
    }
  
    // Confirm the deletion
    const confirmDeletion = window.confirm(`Are you sure you want to delete the region: ${selectedRegion}?`);
    if (!confirmDeletion) {
      return;
    }
  
    // Perform the deletion
    fetch(`http://${domain}:8080/removeRegion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ region: selectedRegion })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete region.');
        }
        return response.json();
      })
      .then(() => {
        alert(`Region ${selectedRegion} has been deleted.`);
        // Refresh the list of regions after deletion
        fetchRegions();
        // Reset the selected region
        setSelectedRegion('');
        setStatesInRegion([]);
      })
      .catch(error => {
        console.error('Error deleting region:', error);
        alert('There was an error deleting the region.');
      });
  }
  
// delete from unasssigned 
async function deleteFromUnassigned(){
  
  

  // Confirm the deletion
  const confirmDeletion = window.confirm(`Are you sure you want to delete: ${selectedState}?`);
  if (!confirmDeletion) {
    return;
  }

  // Perform the deletion
  fetch(`http://${domain}:8080/updateStatesOfRegion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ region: 'unassigned', state: selectedState  })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete state.');
      }
      return response.json();
    })
    .then(() => {
      alert(`Region ${selectedState} has been deleted.`);
      
      fetchUnassignedStates(); 
      
      setSelectedState('');
    })
    .catch(error => {
      console.error('Error deleting statefrom unassigned:', error);
      alert('There was an error deleting the state from unassigned.');
    });
}



  return (
    <div className="mainUser">
      <h2>Manage System Settings</h2>
      <div className="filterWindow" id="filter">
        <h2 className="popup-head">
          <img src={imgURL} className="image" alt="logo" />
        </h2>
        <span className="close" onClick={handlePopupClose}>
          
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
                  src={`http://10.182.2.37:8080/images/${auth.AuthNo}.png`}
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
                      <button className="remove-button" onClick={() => {handleEntityDeletion(item.label)}}>
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

          <div class="seventy-percent">
            
            <div class="zone-selection">
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
          <div  className="button-container">
          <button id="create-button" onClick={() => setIsDialogOpen(true)}>Create New Region</button> 
          </div>
          <div id="delete-button" className="button-container">
          <button  onClick={handleDeleteRegion}>Delete Selected Region</button>    
          </div>    
             </div>
            
            
            <div class="states-in-zone">
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
              
              {state.label} ({state.value})
            </label>
            </div>
              ))
            ) : (
              <div>No states available for this region.</div>
            )}
            <div id="delete-button" className="button-container">
          <button id="remove-button" onClick={removeStateFromRegion}>Remove State from {selectedRegion} </button>
          </div>
            </div>
            
            
            <div class="states-outside-zone">
            <h2>Unassigned States</h2>
        {Array.isArray(unassignedStates) && unassignedStates.length > 0 ? (
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
              <button id="add-button" onClick={addStateToRegion}>Add to {selectedRegion} region</button>
            </div>
            <div id="add-state" className="button-container">
              <button onClick={() => openNewStateDialog(true)}>Add New State</button>
            </div>
            <div id="delete-button" className="button-container">
              <button onClick={() => deleteFromUnassigned()}>Delete from Unassigned</button>    
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
          <label>
            State Code:
            <input
              type="text"
              value={newStateCode}
              onChange={(e) => setNewStateCode(e.target.value)}
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
