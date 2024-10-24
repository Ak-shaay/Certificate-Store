import React, { useState } from "react";
import "./UserCreation.css";
import TextField from "@mui/material/TextField";
import { MenuItem } from "@mui/material";

const UserCreation = () => {
  const [name, setName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const organization = [
    { value: "Admin", label: "Admin" },
    { value: "CA", label: "CA" },
    { value: "CCA", label: "CCA" },
  ];
  const handleNameChange = (e) => {
    setName(e.target.value);
  };
  const handleOrgChange = (e) => {
    setOrganisation(e.target.value);
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  function handleSubmit() {
    console.log(name, email, password, organisation);
  }
  return (
    <div className="userCreation">
      <div className="userCreationBody">
        <h2>Create User</h2>
        <div className="accountCreation">
          <TextField
            required
            id="name"
            label="Name"
            onChange={(e) => {
              handleNameChange(e);
            }}
          />
          <TextField
            onChange={handleOrgChange}
            id="organization"
            select
            label="Organization"
            value={organisation}
            helperText="Please select your organization"
          >
            {organization.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            required
            id="email"
            label="Email"
            onChange={(e) => {
              handleEmailChange(e);
            }}
          />
          <TextField
            required
            id="password"
            type="password"
            label="Password"
            onChange={(e) => {
              handlePasswordChange(e);
            }}
          />
          <div className="btnContainer">
            <button type="submit" className="commonBtn" onClick={handleSubmit}>
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCreation;
