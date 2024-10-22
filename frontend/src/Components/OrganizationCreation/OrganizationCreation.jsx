import React, { useState } from "react";
import "./OrganizationCreation.css";
import TextField from "@mui/material/TextField";

const OrganizationCreation = () => {
  const [certificate, setCertificate] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCertificate(file);
      console.log("File selected:", file);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setCertificate(file);
      console.log("File dropped:", file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="orgCreation">
      <div className="orgCreationBody">
        <h2>Create Organization</h2>
        <div className="accountCreation">
          <div className="fileContainer">
            <div
              className={`fileUpload ${dragOver ? "drag-over" : ""}`}
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <p>
                {certificate
                  ? certificate.name
                  : "Drag & drop a file here or click to upload"}
              </p>
              <input
                type="file"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="fileInput"
              />
              <label htmlFor="fileInput" className="fileUploadLabel">
                Choose File
              </label>
            </div>
          </div>
          <div className="accountContainer">
            <TextField required id="name" label="Name" />
            <TextField required id="email" label="Email" />
            <TextField required id="address" label="Address" />
            <TextField required id="state" label="State" />
            <TextField required id="postal-code" label="Postal Code" />
          </div>
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

export default OrganizationCreation;
