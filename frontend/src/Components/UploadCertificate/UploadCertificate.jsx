import React, { useState } from "react";
import "./UploadCertificate.css";
import api from "../../Pages/axiosInstance";

const UploadCertificate = () => {
  const [file, setFile] = useState({});
  const [msg, setMsg] = useState(""); // Message to display
  const [error, setError] = useState(false); // To control the error block visibility
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      document.querySelector(".file-info").style.display = "flex";
    } else {
      document.querySelector(".file-info").style.display = "none";
    }
  };

function clearAll(){
  document.querySelector(".file-info").style.display = "none";
  setFile({})
}

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        resolve(reader.result.split(",")[1]); // Remove the Data URL prefix (e.g., 'data:cert/pem;base64,')
      };
      reader.onerror = reject;
    });
  };

  const handleFileUpload = async () => {
    if (file && file.size > 0) {
      const data = new FormData();
      data.append("certificate", file);

      try {
        const base64Cert = await convertFileToBase64(file);
        const accessToken = api.getAccessToken();
        api.setAuthHeader(accessToken);

        const response = await api.axiosInstance.post("/certificateUpload", {
          base64Cert,
        });

        if (response.status === 200) {
          setSuccess(true);
          setMsg("Uploaded certificate successfully");
          clearAll()
          setError(false); // Hide error block if upload is successful
        }
      } catch (error) {
        setError(true);
        setSuccess(false); // Hide success block if there's an error
        clearAll()
        // Check if the error response is available
        if (error.response) {
          setMsg(error.response.data || "Unknown error");
        } else {
          setMsg("Network or other error: " + error.message);
        }
      }
    } else {
      setError(true);
      setSuccess(false); // Hide success block if no file is selected
      setMsg("No file selected or the file is empty.");
    }
  };
  setTimeout(() => {
    setMsg("");
  }, 3000);
  setTimeout(() => {
    setError("");
  }, 3000);

  return (
    <div className="Maindash">
      <div className="upload-files-container">
        <div className="file-area">
          <h1 className="dynamic-message">Certificate Upload</h1>
          <label className="label">
            <span className="browse-files">
              <input
                type="file"
                className="default-file-input"
                onChange={handleFileChange}
              />
              <span className="browse-files-text">browse file </span>
              <span> from device</span>
            </span>
          </label>
        </div>
        <div className="file-info" id="file-info" style={{ display: "none" }}>
          <span className="file-name">File Name : {file?.name || null}</span> |
          <span className="file-size">
            Size : {(file?.size / 1024).toFixed(1) || null} KB
          </span>
        </div>
        <div
          className="error-block"
          style={{ display: error ? "flex" : "none" }}
        >
          <span className="error">
            {msg}
          </span>
        </div>

        <div
          className="success-block"
          style={{ display: success ? "flex" : "none" }}
        >
          <span className="success">
            {msg}
          </span>
        </div>
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
