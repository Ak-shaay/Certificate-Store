import React from "react";
import "./Management.css";

const Management = () => {
  const handleManageOrg = async () => {
    window.open("/organizations", "_blank");
  };
  const handleManageUser = async () => {
    window.open("/users", "_blank");
  };
  const handleCreateOrg = async () => {
    window.open("/create/organization", "_blank");
  };
  const handleCreateUser = async () => {
    window.open("/create/user", "_blank");
  };
  const handleSystemSettings = async () => {
    window.open("/systemparameters", "_blank");
  };
  return (
    <div>
      <div class="menu-container">
        <h1 class="menu-title">System Management</h1>
        <div class="menu-grid" onClick={handleManageOrg}>
          <div class="menu-item">
            <h2 class="item-title">Manage Organizations</h2>
            <p class="item-price"></p>
            {/* <p class="item-description">description</p> */}
          </div>
          <div class="menu-item" onClick={handleManageUser}>
            <h2 class="item-title">Manage Users</h2>
            <p class="item-description"></p>
            {/* <p class="item-price"></p> */}
          </div>
          <div class="menu-item" onClick={handleCreateOrg}>
            <h2 class="item-title">Add Organization</h2>
            <p class="item-description"></p>
            {/* <p class="item-price"></p> */}
          </div>
          <div class="menu-item" onClick={handleCreateUser}>
            <h2 class="item-title">Add User</h2>
            <p class="item-description"></p>
            {/* <p class="item-price"></p> */}
          </div>
          <div class="menu-item" onClick={handleSystemSettings}>
            <h2 class="item-title">System Parameters</h2>
            <p class="item-description"></p>
            {/* <p class="item-price"></p> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Management;
