import React, { useEffect, useState } from "react";
import "./Management.css";
import ManageOrganizations from "../Organization/Organization";
import ManageUsers from "../Users/Users";
import CreateOrganization from "../OrganizationCreation/OrganizationCreation";
import CreateUser from "../UserCreation/UserCreation";
import SystemSettings from "../SystemParameters/SystemParameters";

const Management = ({ selectedView }) => {
  const [activeComponent, setActiveComponent] = useState(null);
  const [showManagement, setShowManagement] = useState(true);

  
 useEffect(() => {
  if (selectedView === "portalManagement") {
    setActiveComponent(null);
    setShowManagement(true);
  }
}, [selectedView]);

  const handleNavigation = (component) => {
    setActiveComponent(component);
    setShowManagement(false);
  };

  const handleBack = () => {
    setActiveComponent(null);
    setShowManagement(true);
  };

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "ManageOrganizations":
        return <ManageOrganizations onBack={handleBack} />;
      case "ManageUsers":
        return <ManageUsers onBack={handleBack} />;
      case "CreateOrganization":
        return <CreateOrganization onBack={handleBack} />;
      case "CreateUser":
        return <CreateUser onBack={handleBack} />;
      case "SystemSettings":
        return <SystemSettings onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {showManagement ? (
        <div className="menu-container">
          <h1 className="menu-title">System Management</h1>
          <div className="menu-grid">
            <div
              className="menu-item"
              onClick={() => handleNavigation("ManageOrganizations")}
            >
              <h2 className="item-title">Manage Organizations</h2>
            </div>
            <div
              className="menu-item"
              onClick={() => handleNavigation("ManageUsers")}
            >
              <h2 className="item-title">Manage Users</h2>
            </div>
            <div
              className="menu-item"
              onClick={() => handleNavigation("CreateOrganization")}
            >
              <h2 className="item-title">Add Organization</h2>
            </div>
            <div
              className="menu-item"
              onClick={() => handleNavigation("CreateUser")}
            >
              <h2 className="item-title">Add User</h2>
            </div>
            <div
              className="menu-item"
              onClick={() => handleNavigation("SystemSettings")}
            >
              <h2 className="item-title">System Parameters</h2>
            </div>
          </div>
        </div>
      ) : (
        <div className="active-component-container">
          {renderActiveComponent()}
        </div>
      )}
    </div>
  );
};

export default Management;
