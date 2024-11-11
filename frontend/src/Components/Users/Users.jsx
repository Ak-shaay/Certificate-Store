import React, { useEffect, useRef } from "react";
import "./Users.css";
import { Grid } from "gridjs";
import api from "../../Pages/axiosInstance";

const Users = ({ onBack }) => {
    const wrapperRef = useRef(null);
    const gridRef = useRef(null);
  
  const fetchData = async() => {
    try{
      const accessToken = api.getAccessToken();
      api.setAuthHeader(accessToken);
      const response = await api.axiosInstance.post("/getAllUsers");
      if(response.data){
        const data= await response.data;        
        gridRef.current.updateConfig({
          data: data.map((item)=>[
            item.UserEmail,
            item.Name,
           item.AuthName,
            item.Role,
            item.LoginStatus,
          ])
        })
        gridRef.current.forceRender();
      }
    }
    catch(err){
      console.error("Error fetching data: ", err);
    }
  };

  useEffect(() => {
    gridRef.current = new Grid({
      columns: [ 
        // { id: "UserID", name: "User ID", width: "150px" },
        { id: "Email", name: "Email", width: "150px" },
        { id: "Name", name: "Name", width: "150px" },
        { id: "Organization", name: "Organization", width: "150px" },
        { id: "Role", name: "Role", width: "150px" },
        // { id: "Password", name: "Password", width: "150px" },
        { id: "Status", name: "Status", width: "100px" },],
    data: [],
      pagination: true,
      sort: true,
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
      },
    });

    fetchData();
    gridRef.current.render(wrapperRef.current);

    return () => {
      gridRef.current.destroy();
    };
  }, []);

  return (
    <div className="usersBody">
      <div className="usersMain">
      <div className="backClass">
      <button onClick={onBack} className="backButton">Back</button></div>
        <h2>Users</h2>
          <div className="userTableWrapper">
          <div ref={wrapperRef} />
          </div>
      </div>
    </div>
  );
};

export default Users;
