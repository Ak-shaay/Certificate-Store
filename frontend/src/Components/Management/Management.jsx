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
      <div className="menu-container">
        <h1 className="menu-title">System Management</h1>
        <div className="menu-grid" onClick={handleManageOrg}>
          <div className="menu-item">
            <h2 className="item-title">Manage Organizations</h2>
            <p className="item-price"></p>
            {/* <p className="item-description">description</p> */}
          </div>
          <div className="menu-item" onClick={handleManageUser}>
            <h2 className="item-title">Manage Users</h2>
            <p className="item-description"></p>
            {/* <p className="item-price"></p> */}
          </div>
          <div className="menu-item" onClick={handleCreateOrg}>
            <h2 className="item-title">Add Organization</h2>
            <p className="item-description"></p>
            {/* <p className="item-price"></p> */}
          </div>
          <div className="menu-item" onClick={handleCreateUser}>
            <h2 className="item-title">Add User</h2>
            <p className="item-description"></p>
            {/* <p className="item-price"></p> */}
          </div>
          <div className="menu-item" onClick={handleSystemSettings}>
            <h2 className="item-title">System Parameters</h2>
            <p className="item-description"></p>
            {/* <p className="item-price"></p> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Management;
