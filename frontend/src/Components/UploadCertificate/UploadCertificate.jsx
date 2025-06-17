import React, { useEffect, useRef, useState } from "react";
import "./UploadCertificate.css";
import api from "../../Pages/axiosInstance";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

const UploadCertificate = () => {
  const [file, setFile] = useState(null); // Use null instead of {}
  const [msg, setMsg] = useState(""); // Message to display
  const [error, setError] = useState(false); // Show error block
  const [success, setSuccess] = useState(false); // Show success block
  const fileInputRef = useRef(null);

  // Handle file input change, update state
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile || null);
  };

  // Clear all state and reset file input
  const clearAll = () => {
    setFile(null);
    setMsg("");
    setError(false);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Convert file to base64 string
  const convertFileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });

  // Handle upload button click
  const handleFileUpload = async () => {
    if (!file || file.size === 0) {
      setError(true);
      setSuccess(false);
      setMsg("No file selected or the file is empty.");
      return;
    }

    try {
      const base64Cert = await convertFileToBase64(file);
      const accessToken = api.getAccessToken();
      api.setAuthHeader(accessToken);

      const response = await api.axiosInstance.post("/certificateUpload", {
        base64Cert,
      });

      if (response.status === 200) {
        setSuccess(true);
        setError(false);
        setMsg("Uploaded certificate successfully");
        // Clear only the file, keep message and success state so the success block shows
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setError(true);
        setSuccess(false);
        //  setMsg("Upload failed with status " + response.status);
        setMsg("Upload failed with status ");
      }
    } catch (err) {
      setSuccess(false);
      setError(true);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Default error message
      let errorMessage = "Server returned an error";

      if (err.response) {
        // Server responded with a status outside the 2xx range
        const serverMessage =
          err.response.data?.error || err.response.data?.message;

        errorMessage = `Upload failed : ${
          serverMessage || "Internal Server Error"
        }`;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please try again.";
      } else {
        errorMessage = `Unexpected error: ${err.message}`;
      }

      setMsg(errorMessage);
    }
  };

  // Automatically clear messages and success/error flags after 3 seconds
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => {
        setMsg("");
        setError(false);
        setSuccess(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [msg]);

  return (
    <div className="Maindash">
      <div className="upload-files-container">
        <div className="file-area">
          <h1 className="dynamic-message">CCA Certificate Upload</h1>
          <label className="label">
            <span className="browse-files">
              <input
                type="file"
                accept=".cer"
                className="default-file-input"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <span className="browse-files-text">browse file </span>
              <span> from device</span>
            </span>
          </label>
        </div>

        {/* Show file info only if file is selected */}
        {file && (
          <div className="file-info" id="file-info" style={{ display: "flex" }}>
            <span className="file-name">File Name: {file.name}</span> |
            <span className="file-size">
              Size: {(file.size / 1024).toFixed(1)} KB
            </span>
            <Tooltip title="Remove">
              <IconButton onClick={clearAll}>
                <DeleteIcon className="deleteIcon" />
              </IconButton>
            </Tooltip>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="error-block" style={{ display: "flex" }}>
            <span className="error">{msg}</span>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="success-block" style={{ display: "flex" }}>
            <span className="success">{msg}</span>
          </div>
        )}

        <button
          type="button"
          id="uploadCertificate"
          className="upload-btn"
          onClick={handleFileUpload}
        >
          Upload
        </button>
      </div>
    </div>
  );
};

export default UploadCertificate;
