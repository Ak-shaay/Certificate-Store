import React, { useEffect, useState } from "react";
import "./UserCreation.css";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import api from "../../Pages/axiosInstance";
import refreshIcon from "../../Images/Icons/refresh.png";

const UserCreation = ({ onBack }) => {
  const [name, setName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [authorities, setAuthorities] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    organisation: "",
    email: "",
    password: "",
  });

  // Function to clear all form values
  const clearForm = () => {
    setName("");
    setOrganisation("");
    setEmail("");
    setPassword("");
  };
  useEffect(() => {
    const fetchIssuer = async () => {
      try {
        const accessToken = api.getAccessToken();
        api.setAuthHeader(accessToken);
        const response = await api.axiosInstance.post("/authorities");
        if (response.data) {
          response.data.unshift({ label: "CCA", value: "CCA" });
          response.data.unshift({ label: "Admin", value: "Admin" });
          setAuthorities(response.data);
        }
      } catch (err) {
        console.error("error : ", err);
      }
    };
    fetchIssuer();
  }, []);
  const handleGenPass = async () => {
    const msgSpan = document.getElementById("messageText");
    try {
      const accessToken = api.getAccessToken();
      if (accessToken) {
        api.setAuthHeader(accessToken);
        const response = await api.axiosInstance.get("/generatePassword");

        if (response.status === 200) {
          setPassword(response.data.password);          
          msgSpan.style.color = "green";
          setMessage(response.data.message);
        }
      }
    } catch (error) {
      msgSpan.style.color = "red";
      setMessage("Error generating Password");
    }
  };
  setTimeout(() => {
    setMessage(""); 
  }, 3000);

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

  const validate = () => {
    let valid = true;
    let errorMessages = { ...errors };

    if (!name) {
      errorMessages.name = "Name is required.";
      valid = false;
    } else {
      errorMessages.name = "";
    }

    if (!organisation) {
      errorMessages.organisation = "Organization is required.";
      valid = false;
    } else {
      errorMessages.organisation = "";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;
    if (!email) {
      errorMessages.email = "Email is required.";
      valid = false;
    } else if (!emailRegex.test(email)) {
      errorMessages.email = "Enter a valid email address.";
      valid = false;
    } else {
      errorMessages.email = "";
    }

    if (!password) {
      errorMessages.password = "Password is required.";
      valid = false;
    } else if (password.length < 8) {
      errorMessages.password = "Password must be at least 8 characters.";
      valid = false;
    } else if (!passRegex.test(password)) {
      errorMessages.email = "Enter a valid Password";
      valid = false;
    } else {
      errorMessages.password = "";
    }
    setErrors(errorMessages);
    return valid;
  };

  const handleSubmit = async (e) => {
    const msgSpan = document.getElementById("messageText");
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const accessToken = api.getAccessToken();
      api.setAuthHeader(accessToken);

      const response = await api.axiosInstance.post("/signupUser", {
        name,
        organisation,
        email,
        password,
      });

      if (response.status == 200) {
        msgSpan.style.color = "green";
        setMessage(response.data.message);
        clearForm();
      }

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error during signup:", err);
      clearForm();
      if (err.response) {
        msgSpan.style.color = "red";
        if (err.response.status === 409) {
          setMessage("User already exists. Please try with a different email.");
        } else if (err.response.status === 400) {
          setMessage(
            err.response.data.message || "Invalid email or password format."
          );
        } else if (err.response.status === 403) {
          setMessage("The email you entered is not valid.");
        } else {
          setMessage(
            "An error occurred while processing your request. Please try again later."
          );
        }
      } else {
        setMessage(
          "Network error. Please check your connection and try again."
        );
      }

      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  };

  return (
    <div className="userCreation">
      <div className="userCreationBody">
        <div
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop:'1.5rem',
            marginBottom:'1rem'
          }}
        >
          <h2 style={{ margin:0 }}>Create User</h2>
          <div style={{ position: "absolute", left: 0 }}>
          <button onClick={onBack} className="backButton">
            Back
          </button>
          </div>
        </div>
        <div className="accountCreation">
          <TextField
            required
            id="name"
            label="Name"
            value={name}
            onChange={handleNameChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            onChange={handleOrgChange}
            id="organization"
            select
            label="Organization"
            value={organisation}
            helperText={
              errors.organisation || "Please select your organization"
            }
            error={!!errors.organisation}
          >
            {authorities.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            required
            id="email"
            label="Email"
            value={email}
            onChange={handleEmailChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            required
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={handlePasswordChange}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <button
                    type="button"
                    id="smallBtn"
                    onClick={handleGenPass}
                  >
                    <img
                      src={refreshIcon}
                      alt="regenerate"
                    />
                  </button>
                </InputAdornment>
              ),
            }}
          />
          <div className="messageContainer">
  <span id="messageText">
    {message ? message : <>&nbsp;</>}
  </span>
</div>
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
