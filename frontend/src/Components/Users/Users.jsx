import React, { useEffect, useRef } from "react";
import "./Users.css";
import { Grid } from "gridjs";
const Users = () => {
    const wrapperRef = useRef(null);

  const grid = new Grid({
    columns: [ 
        { id: "UserID", name: "User ID", width: "150px" },
        { id: "Name", name: "Name", width: "150px" },
        { id: "Organization", name: "Organization", width: "150px" },
        { id: "Email", name: "Email", width: "150px" },
        { id: "Password", name: "Password", width: "150px" },
        { id: "Status", name: "Status", width: "100px" },],
    data: [],
    pagination: true,
    // sort: true,
    search: true,
    style: {
      th: {
        backgroundColor: "rgb(132 168 255 / 70%)",
        color: "white",
        textAlign: "center",
      },
      td: {
        borderRight: "none",
        borderLeft: "none",
        textAlign: 'center'
      },
    }
  });
  
  useEffect(() => {
    grid.render(wrapperRef.current);
  });
  return (
    <div className="usersBody">
      <div className="usersMain">
        <h2>Users</h2>
          <div className="userTableWrapper">
          <div ref={wrapperRef} />;
          </div>
      </div>
    </div>
  );
};

export default Users;
