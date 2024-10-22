import React from "react";
import "./UserCreation.css";
import TextField from "@mui/material/TextField";
import { MenuItem } from "@mui/material";

const UserCreation = () => {

  const organization = [
    {
      value: 'Admin',
      label: 'Admin',
    },
    {
      value: 'CA',
      label: 'CA',
    },
    {
      value: 'CCA',
      label: 'CCA',
    },
  ];
  
  return (
    <div className="userCreation">
      <div className="userCreationBody">
        <h2>Create User</h2>
        <div className="accountCreation">
          <TextField required id="name" label="Name" />
          {/* <TextField required id="organization" label="Organization" /> */}
          <TextField
          id="organization"
          select
          label="Organization"
          defaultValue=""
          helperText="Please select your organization"
        >
          {organization.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
          <TextField required id="email" label="Email" />
          <TextField required id="password" type="password" label="Password" />
        <div className="btnContainer">
          <button type="submit" className="commonBtn">
            Create
          </button>
        </div>
          </div>
      </div>
    </div>
  );
};

export default UserCreation;
