import React, { useState, useEffect } from "react";
import "./SystemParameters.css";
import api from "../../Pages/axiosInstance";

const SystemParameters = () => {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [statesInRegion, setStatesInRegion] = useState([]);
  const [unassignedStates, setUnassignedStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStateDialogOpen, setIsStateDialogOpen] = useState(false); // State for new state dialog
  const [newRegionName, setNewRegionName] = useState("");
  const [newStateName, setNewStateName] = useState(""); // New state name
  // Fetch regions and states on component mount
  useEffect(() => {
    fetchRegions();
    fetchUnassignedStates();
  }, []);

  async function fetchRegions() {
    try {
      const accessToken = api.getAccessToken();
      if (accessToken) {
        api.setAuthHeader(accessToken);
      }
      const response = await api.axiosInstance.get("/region");
      if (response.status == 200) {
        const data = response.data;
        setRegions(data.filter((region) => region.label !== "unassigned"));
        if (data.length > 0) {
          const firstRegion = data[0].label;
          setSelectedRegion(firstRegion);
          fetchStatesByRegion(firstRegion);
        }
      } else {
        throw new Error("Error fetching regions");
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  }
  async function fetchUnassignedStates() {
    try {
      const accessToken = api.getAccessToken();
      if (accessToken) {
        api.setAuthHeader(accessToken);
      }
      const response = await api.axiosInstance.post("/getStatesByRegion", {
        regions: ["unassigned"],
      });
      if (response.status == 200) {
        const data = response.data;
        setUnassignedStates(data || []);
      } else {
        throw new Error("Error fetching regions");
      }
    } catch (error) {
      console.error("Error fetching unassigned states:", error);
    }
  }

  async function fetchStatesByRegion(region) {
    try {
      const accessToken = api.getAccessToken();
      if (accessToken) {
        api.setAuthHeader(accessToken);
      }
      const response = await api.axiosInstance.post("/getStatesByRegion", {
        regions: [region],
      });
      if (response.status == 200) {
        const data = response.data;
        setStatesInRegion(data || []);
      } else {
        throw new Error("Error fetching regions");
      }
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
      const accessToken = api.getAccessToken();
      if (accessToken) {
        api.setAuthHeader(accessToken);
      }
      const response = await api.axiosInstance.post("/moveStatesOfRegion", {
        region: selectedRegion,
        state: selectedState,
        action: "remove",
        newRegion: "unassigned",
      });
      if (response.status == 200) {
        fetchStatesByRegion(selectedRegion);
        fetchUnassignedStates();
      } else {
        throw new Error("Error processing the request");
      }
    } catch (error) {
      console.error("Error processing the request", error);
    }
  }

  async function addStateToRegion() {
    try {
      const accessToken = api.getAccessToken();
      if (accessToken) {
        api.setAuthHeader(accessToken);
      }
      const response = await api.axiosInstance.post("/moveStatesOfRegion", {
        region: "unassigned", 
        state: selectedState,
        action: "add", 
        newRegion: selectedRegion, 
      });
      if (response.status == 200) {
        fetchStatesByRegion(selectedRegion); 
        fetchUnassignedStates(); 
      } else {
        throw new Error("Error processing the request");
      }
    } catch (error) {
      console.error("Error processing the request", error);
    }
  }

  async function createNewRegion() {
    if (!newRegionName) {
      alert("Region name is required!");
      return;
    }
    try {
      const accessToken = api.getAccessToken();
      if (accessToken) {
        api.setAuthHeader(accessToken);
      }
      const response = await api.axiosInstance.post("/addRegion",{ region: newRegionName });
      if (response.status == 200) {
        fetchRegions();
      setIsDialogOpen(false);
      setNewRegionName("");
      } else {
        throw new Error("Error processing the request");
      }
    } catch (error) {
      console.error("Error processing the request:", error);
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
      const accessToken = api.getAccessToken();
      if (accessToken) {
        api.setAuthHeader(accessToken);
      }
      const response = await api.axiosInstance.post("/updateStatesOfRegion",{
        region: "unassigned",
        oldValue: null,
        newLabel: newStateName,
        newValue: newStateName,
      });
      if (response.status !== 200) {
        throw new Error("Failed to save new state");
      }
      fetchUnassignedStates();
      setIsStateDialogOpen(false);
    } catch (error) {
      console.error("Error saving the new state:", error);
    }
  }

  function closeNewStateDialog() {
    setIsStateDialogOpen(false);
  }

  async function handleDeleteRegion() {
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
    // { region: selectedRegion }
    try {
      const accessToken = api.getAccessToken();
      if (accessToken) {
        api.setAuthHeader(accessToken);
      }
      const response = await api.axiosInstance.post("/removeRegion",{ region: selectedRegion });
      if (response.status !== 200) {
        throw new Error("Failed to delete region.");
      }
      alert(`Region ${selectedRegion} has been deleted.`);
        // Refresh the list of regions after deletion
        fetchRegions();
        // Reset the selected region
        setSelectedRegion("");
        setStatesInRegion([]);
    } catch (error) {
      console.error("Error deleting region:", error);
      alert("There was an error deleting the region.");
    }
  }
  return (
    <div className="spBody">
      <div className="mainSp">
        <h2>Manage System Parameters</h2>
        <div className="mainContainer">
          <div className="gridContainer">
            <h3>Select Region</h3>
            {regions.map((region) => (
              <div key={region.value} className="list">
                <label>{region.label}</label>
                <input
                  type="radio"
                  name="region"
                  value={region.label}
                  checked={selectedRegion === region.label}
                  onChange={handleRegionChange}
                />
              </div>
            ))}
            <div className="button-container">
              <button id="greenBtn" onClick={() => setIsDialogOpen(true)}>
                Create New Region
              </button>
            </div>
            <div className="button-container">
              <button id="redBtn" onClick={handleDeleteRegion}>
                Delete Selected Region
              </button>
            </div>
          </div>

          <div className="gridContainer">
            <h3>States in {selectedRegion}</h3>
            {Array.isArray(statesInRegion) && statesInRegion.length > 0 ? (
              statesInRegion.map((state) => (
                <div key={state.value} className="list">
                  <label>{state.label}</label>
                  <input
                    type="radio"
                    name="stateInRegion"
                    value={state.value}
                    checked={selectedState === state.value}
                    onChange={handleStateSelection}
                  />
                </div>
              ))
            ) : (
              <div>No states available for this region.</div>
            )}
            <div className="button-container">
              <button id="redBtn" onClick={removeStateFromRegion}>
                Remove State from {selectedRegion}{" "}
              </button>
            </div>
          </div>

          <div className="gridContainer">
            <h3>Unassigned States</h3>
            {Array.isArray(unassignedStates) && unassignedStates.length > 0 ? (
              unassignedStates.map((state) => (
                <div key={state.value} className="list">
                  <label>
                    {state.label} ({state.value})
                  </label>
                  <input
                    type="checkbox"
                    name="unassignedState"
                    value={state.value}
                    checked={selectedState === state.value}
                    onChange={handleStateSelection}
                  />
                </div>
              ))
            ) : (
              <div>No unassigned states available.</div>
            )}
            <div>
              <div className="button-container">
                <button id="blueBtn" onClick={addStateToRegion}>
                  Add to {selectedRegion} region
                </button>
              </div>
              <div className="button-container">
                <button id="blueBtn" onClick={() => openNewStateDialog(true)}>
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
              <button id="blueBtn" onClick={handleSaveNewState}>
                Save
              </button>
              <button id="redBtn" onClick={closeNewStateDialog}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemParameters;
