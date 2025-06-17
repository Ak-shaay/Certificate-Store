import React, { useEffect, useState } from "react";
import "./OrganizationCreation.css";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import api from "../../Pages/axiosInstance";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";


const OrganizationCreation = ({ onBack }) => {
  const [certificate, setCertificate] = useState(null);
  const [image, setImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commonName, setCommonName] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Function to clear all form values
  const clearForm = () => {
    setCertificate(null);
    setCommonName("");
    setSerialNo("");
    setEmail("");
    setOrganization("");
    setAddress("");
    setState("");
    setPostalCode("");
    setImage(null);
  };

  // Function to show message and clear after 3 seconds
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 3000); // Clear message after 3 seconds
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setCertificate(file);
    }
  };

  const handleImageChange = async (e) => {
    const image = e.target.files[0];
    if (image) {
      const size = image.size / 1024;
      const type = image.type;

      if (size > 200) {
        alert("Image size must not exceed 200KB");
        return;
      }

      if (type !== "image/png") {
        alert("Image must be in PNG format");
        return;
      }
      const imageUrl = URL.createObjectURL(image);
      const img = new Image();
      img.src = imageUrl;

      async function imgSize(img) {
        // Check image dimensions
        if (img.width > 150 || img.height > 150) {
          alert("Image dimensions must not exceed 150px by 150px");
          return;
        }
      }
      imgSize(img);

      setImage(image);
    }
  };

  // Handle file drop (drag and drop)
  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setCertificate(file);
    }
  };

  // Upload file to the server
  const fileUpload = async (certificate) => {
    try {
      const base64Cert = await convertFileToBase64(certificate);

      const accessToken = api.getAccessToken();
      api.setAuthHeader(accessToken);

      const response = await api.axiosInstance.post("/extractCert", {
        base64Cert,
      });

      if (response.status === 200) {
        showMessage("Certificate uploaded successfully.");
        setCommonName(response.data.commonName || "");
        setOrganization(response.data.organization || "");
        setSerialNo(response.data.serialNumber || "");
        setAddress(response.data.address || "");
        setState(response.data.state || "");
        setPostalCode(response.data.postalcode || "");
      } else {
        showMessage("Failed: Certificate does not belong to a registered CA");
        clearForm(); // Clear values on failure
      }
    } catch (err) {
      console.error("Error occurred while uploading the certificate", err);
      showMessage(
        "Error: Something went wrong while uploading the certificate."
      );
      clearForm(); // Clear values on error
    }
  };

  useEffect(() => {
    if (certificate) {
      fileUpload(certificate);
    }
  }, [certificate]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  // Convert file to Base64
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

  // Handle input field changes
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleCreateOrg = async () => {
    try {
      setIsLoading(true);
      if (
        !commonName ||
        !serialNo ||
        !email ||
        !organization ||
        !address ||
        !state ||
        !postalCode ||
        !image
      ) {
        showMessage("All fields are required.");
        return;
      }
      // Email validation (basic format check)
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(email)) {
        showMessage("Please enter a valid email address.");
        return;
      }

      const postalCodePattern = /^[1-9]{1}\d{2}\s?\d{3}$/;
      if (!postalCodePattern.test(postalCode)) {
        showMessage("Please enter a valid postal code.");
        return;
      }
      if (image) {
        const size = image.size / 1024;
        const type = image.type;

        if (size > 200) {
          showMessage("Image size must not exceed 200KB");
          return;
        }

        if (type !== "image/png") {
          showMessage("Image must be in PNG format");
          return;
        }
        const imageUrl = URL.createObjectURL(image);

        const img = new Image();
        img.src = imageUrl;

        // Use a promise to handle image loading
        const loadImage = new Promise((resolve, reject) => {
          img.onload = () => {
            resolve(img);
          };
          img.onerror = (e) => {
            reject(new Error("Failed to load image"));
          };
        });

        try {
          const loadedImage = await loadImage;

          if (loadedImage.width > 100 || loadedImage.height > 100) {
            showMessage("Image dimensions must not exceed 100px by 100px");
            return;
          }
        } catch (error) {
          console.error(error);
          showMessage("There was an error loading the image.");
        }
      }
      const base64Img = await convertFileToBase64(image);
      const accessToken = api.getAccessToken();
      api.setAuthHeader(accessToken);

      const response = await api.axiosInstance.post("/signup", {
        commonName,
        serialNo,
        email,
        organization,
        address,
        state,
        postalCode,
        base64Img,
      });
      if (response.status === 200) {
        showMessage("Organization created successfully.");
        clearForm(); // Clear form after successful submission
      } else {
        showMessage("Failed to create organization.");
      }
    } catch (error) {
      console.error("Error creating organization: " + error);
      showMessage("Error creating organization.");
      clearForm(); // Clear form after failure
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="orgCreation">
      <div className="orgCreationBody">
        <div
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "1.5rem",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ margin: 0 ,color:'rgb(60 87 153)'}}>Create Organization</h2>
          <div style={{ position: "absolute", left: 0 }}>
            <button onClick={onBack} className="backButton">
              Back
            </button>
          </div>
        </div>
        <div className="orgMain">
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
                  : "Drag & drop certificate file here or click to upload"}
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
          {message && (
            <div className="messageContainer">
              <span id="messageText">{message}</span>
            </div>
          )}

          <div className="accountContainer">
            <TextField
              required
              id="commonName"
              label="Common Name"
              value={commonName || ""}
              onChange={handleInputChange(setCommonName)}
              placeholder="Enter common name"
            />
            <TextField
              required
              id="organization"
              label="Organization"
              value={organization || ""}
              onChange={handleInputChange(setOrganization)}
              placeholder="Enter organization name"
            />
            <TextField
              required
              id="email"
              label="Email"
              value={email || ""}
              onChange={handleInputChange(setEmail)}
              placeholder="Enter email"
            />
            <TextField
              required
              id="address"
              label="Address"
              value={address || ""}
              onChange={handleInputChange(setAddress)}
              placeholder="Enter address"
            />
            <TextField
              required
              id="state"
              label="State"
              value={state || ""}
              onChange={handleInputChange(setState)}
              placeholder="Enter state"
            />
            <TextField
              required
              id="postalcode"
              label="Postal Code"
              value={postalCode || ""}
              onChange={handleInputChange(setPostalCode)}
              placeholder="Enter postal code"
            />
            <Tooltip
  title="Please upload a PNG image with a maximum size of 200KB and dimensions of 150x150px"
  placement="top"
>
  <Button variant="text" size="medium" component="label">
    <div className="imgBtn">
      <span className="imgName">
        {image?.name}
        {image && (
          <Tooltip title="Remove">
            <IconButton onClick={() => setImage(null)} size="small">
              <DeleteIcon className="deleteIcon" />
            </IconButton>
          </Tooltip>
        )}
      </span>
      Upload Image
      <input
        type="file"
        accept=".png"
        hidden
        onChange={handleImageChange}
      />
    </div>
  </Button>
</Tooltip>

          </div>
          <div className="btnContainer">
            <button
              type="submit"
              className="commonBtn"
              onClick={handleCreateOrg}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create"}
            </button>
            <Button
              type="button"
              variant="outlined"
              className="clearBtn"
              onClick={clearForm}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationCreation;
