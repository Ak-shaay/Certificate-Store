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
        <div className="menu-grid">
          <div className="menu-item" onClick={handleManageOrg}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              data-name="Layer 1"
              viewBox="0 0 24 24"
              id="building"
              width="36"
              height="36"
            >
              <path
                fill="#6563FF"
                d="M14,8h1a1,1,0,0,0,0-2H14a1,1,0,0,0,0,2Zm0,4h1a1,1,0,0,0,0-2H14a1,1,0,0,0,0,2ZM9,8h1a1,1,0,0,0,0-2H9A1,1,0,0,0,9,8Zm0,4h1a1,1,0,0,0,0-2H9a1,1,0,0,0,0,2Zm12,8H20V3a1,1,0,0,0-1-1H5A1,1,0,0,0,4,3V20H3a1,1,0,0,0,0,2H21a1,1,0,0,0,0-2Zm-8,0H11V16h2Zm5,0H15V15a1,1,0,0,0-1-1H10a1,1,0,0,0-1,1v5H6V4H18Z"
              ></path>
            </svg>
            <h2 className="item-title">Manage Organizations</h2>
            <p className="item-price"></p>
            {/* <p className="item-description">description</p> */}
          </div>
          <div className="menu-item" onClick={handleManageUser}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              id="users-alt"
              width="36"
              height="36"
            >
              <path
                fill="#6563FF"
                d="M12.3,12.22A4.92,4.92,0,0,0,14,8.5a5,5,0,0,0-10,0,4.92,4.92,0,0,0,1.7,3.72A8,8,0,0,0,1,19.5a1,1,0,0,0,2,0,6,6,0,0,1,12,0,1,1,0,0,0,2,0A8,8,0,0,0,12.3,12.22ZM9,11.5a3,3,0,1,1,3-3A3,3,0,0,1,9,11.5Zm9.74.32A5,5,0,0,0,15,3.5a1,1,0,0,0,0,2,3,3,0,0,1,3,3,3,3,0,0,1-1.5,2.59,1,1,0,0,0-.5.84,1,1,0,0,0,.45.86l.39.26.13.07a7,7,0,0,1,4,6.38,1,1,0,0,0,2,0A9,9,0,0,0,18.74,11.82Z"
              ></path>
            </svg>
            <h2 className="item-title">Manage Users</h2>
            <p className="item-description"></p>
            {/* <p className="item-price"></p> */}
          </div>
          <div className="menu-item" onClick={handleCreateOrg}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              data-name="Layer 1"
              viewBox="0 0 24 24"
              id="panel-add"
              width="36"
              height="36"
            >
              <path
                fill="#6563FF"
                d="M18 10h-4V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v5H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1ZM7 20H4V10h3Zm5 0H9V4h3Zm5 0h-3v-8h3Zm4-16h-1V3a1 1 0 0 0-2 0v1h-1a1 1 0 0 0 0 2h1v1a1 1 0 0 0 2 0V6h1a1 1 0 0 0 0-2Z"
              ></path>
            </svg>
            <h2 className="item-title">Add Organization</h2>
            <p className="item-description"></p>
            {/* <p className="item-price"></p> */}
          </div>
          <div className="menu-item" onClick={handleCreateUser}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              id="user-plus"
              width="36"
              height="36"
            >
              <path
                fill="#6563FF"
                d="M21,10.5H20v-1a1,1,0,0,0-2,0v1H17a1,1,0,0,0,0,2h1v1a1,1,0,0,0,2,0v-1h1a1,1,0,0,0,0-2Zm-7.7,1.72A4.92,4.92,0,0,0,15,8.5a5,5,0,0,0-10,0,4.92,4.92,0,0,0,1.7,3.72A8,8,0,0,0,2,19.5a1,1,0,0,0,2,0,6,6,0,0,1,12,0,1,1,0,0,0,2,0A8,8,0,0,0,13.3,12.22ZM10,11.5a3,3,0,1,1,3-3A3,3,0,0,1,10,11.5Z"
              ></path>
            </svg>
            <h2 className="item-title">Add User</h2>
            <p className="item-description"></p>
            {/* <p className="item-price"></p> */}
          </div>
          <div className="menu-item" onClick={handleSystemSettings}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              data-name="Layer 1"
              viewBox="0 0 24 24"
              id="setting"
              width="36"
              height="36"
            >
              <path
                fill="#6563FF"
                d="M19.9 12.66a1 1 0 0 1 0-1.32l1.28-1.44a1 1 0 0 0 .12-1.17l-2-3.46a1 1 0 0 0-1.07-.48l-1.88.38a1 1 0 0 1-1.15-.66l-.61-1.83a1 1 0 0 0-.95-.68h-4a1 1 0 0 0-1 .68l-.56 1.83a1 1 0 0 1-1.15.66L5 4.79a1 1 0 0 0-1 .48L2 8.73a1 1 0 0 0 .1 1.17l1.27 1.44a1 1 0 0 1 0 1.32L2.1 14.1a1 1 0 0 0-.1 1.17l2 3.46a1 1 0 0 0 1.07.48l1.88-.38a1 1 0 0 1 1.15.66l.61 1.83a1 1 0 0 0 1 .68h4a1 1 0 0 0 .95-.68l.61-1.83a1 1 0 0 1 1.15-.66l1.88.38a1 1 0 0 0 1.07-.48l2-3.46a1 1 0 0 0-.12-1.17ZM18.41 14l.8.9-1.28 2.22-1.18-.24a3 3 0 0 0-3.45 2L12.92 20h-2.56L10 18.86a3 3 0 0 0-3.45-2l-1.18.24-1.3-2.21.8-.9a3 3 0 0 0 0-4l-.8-.9 1.28-2.2 1.18.24a3 3 0 0 0 3.45-2L10.36 4h2.56l.38 1.14a3 3 0 0 0 3.45 2l1.18-.24 1.28 2.22-.8.9a3 3 0 0 0 0 3.98Zm-6.77-6a4 4 0 1 0 4 4 4 4 0 0 0-4-4Zm0 6a2 2 0 1 1 2-2 2 2 0 0 1-2 2Z"
              ></path>
            </svg>
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
