import React, { useState, useEffect } from "react";
import "./Account.css";
import api from "../../Pages/axiosInstance";
import { domain } from "../../Context/config";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import { Backdrop } from "@mui/material";

const Account = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = api.getAccessToken();
        if (accessToken) {
          api.setAuthHeader(accessToken);
        }
        const response = await api.axiosInstance.get("/profileData");
        if (response.status !== 200) {
          setTimeout(() => {
            api.removeTokens();
            document.cookie = `certStore=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            // Redirect to the login page or perform any other necessary actions
            window.location.href = "http://" + domain + ":3000"; // Redirect to landing page
          }, 2000);
          throw new Error("Network response was not ok");
        }
        setData(response.data.profile);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const handlePasswordChange = () => {
    setOpen(true);
    const filtersElement = document.getElementById("filter");
    // const blurFilter = document.getElementById("accountContainer");
    // blurFilter.style.filter = "blur(3px)";
    // blurFilter.style.pointerEvents = "none";
    filtersElement.style.display = "block";
  };
  const handleFilterClose = (e) => {
    setOpen(false);
    const filtersElement = document.getElementById("filter");
    // const blurFilter = document.getElementById("accountContainer");
    // blurFilter.style.filter = "blur(0px)";
    // blurFilter.style.pointerEvents = "auto";
    filtersElement.style.display = "none";
  };
  //update password api call
  const updatePassword = async () => {
    const accessToken = api.getAccessToken();
    if (accessToken) {
      try {
        const oldPassword = document.getElementById("oldPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword =
          document.getElementById("confirmPassword").value;

        if (!oldPassword || !newPassword || !confirmPassword) {
          document.getElementById("updatePasswordMsg").textContent =
            "Please fill all the details.";
          setTimeout(() => {
            document.getElementById("updatePasswordMsg").textContent = "";
          }, 3000);
          return;
        }
        // Validation: Ensure newPassword and old passwords are different
        if (oldPassword == newPassword) {
          document.getElementById("updatePasswordMsg").textContent =
            "Old password cannot be used as new password.";
          setTimeout(() => {
            document.getElementById("updatePasswordMsg").textContent = "";
          }, 3000);
          return;
        }

        // Validation: Ensure newPassword and confirmPassword match
        if (newPassword !== confirmPassword) {
          document.getElementById("updatePasswordMsg").textContent =
            "Passwords do not match.";
          setTimeout(() => {
            document.getElementById("updatePasswordMsg").textContent = "";
          }, 3000);
          return;
        }

        api.setAuthHeader(accessToken);
        const response = await api.axiosInstance.post("/updatePassword", {
          oldPassword,
          newPassword,
          confirmPassword,
        });
        if (response.status == 200) {
          const passResp = response.data;
          document.getElementById("updatePasswordMsg").textContent =
            passResp.message + " Automatic logout processing...";
          setTimeout(() => {
            api.removeTokens();
            document.cookie = `certStore=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            // Redirect to the login page or perform any other necessary actions
            window.location.href = "http://" + domain + ":3000"; // Redirect to landing page
          }, 3800);
        }
      } catch (err) {
        console.log("this is error: ", err);
        document.getElementById("updatePasswordMsg").textContent =
          err.response.data.message;
        setTimeout(() => {
          document.getElementById("updatePasswordMsg").textContent = "";
        }, 8000);
      }
    } else {
      document.getElementById("updatePasswordMsg").textContent =
        "No access token found. Please log in.";
      setTimeout(() => {
        document.getElementById("updatePasswordMsg").textContent = "";
      }, 3000);
    }
  };
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return (
    <div className="MainAccount">
      <h2 className="cursive">Account</h2>
      <Backdrop  sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
  open={open}>
      <div className="filterWindow" id="filter">
        <span className="close" onClick={handleFilterClose}>
          X
        </span>
        <h2 className="filter-head">Change Password</h2>
        <hr className="filter-line" />
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel htmlFor="oldPassword">Current Password</InputLabel>
          <OutlinedInput
            className="passwordFrom"
            id="oldPassword"
            type="password"
            name="oldPassword"
            label="Old Password"
            required
          />
        </FormControl>
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel htmlFor="newPassword">New Password</InputLabel>
          <OutlinedInput
            className="passwordFrom"
            id="newPassword"
            type="password"
            name="newPassword"
            label="New Password"
            required
          />
        </FormControl>
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel htmlFor="confirmPassword">Confirm Password</InputLabel>
          <OutlinedInput
            className="passwordFrom"
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            label="New Password"
            required
          />
        </FormControl>
        <span id="updatePasswordMsg"></span>
        <br />
        <hr />
        <div className="filter-row">
          <button
            className="commonApply-btn cancel"
            onClick={handleFilterClose}
          >
            Cancel
          </button>
          <button className="commonApply-btn" onClick={updatePassword}>
            Update
          </button>
        </div>
      </div>
      </Backdrop>
      <div className="AccountContainer" id="accountContainer">
        <div className="header">My Account</div>
        <hr className="" />
        <form id="forms">
          <div className="row">
            <div className="column">
              <label htmlFor="fname">
                <b>Name : </b>
                {data.Name}
              </label>
            </div>
            <div className="column">
              <label htmlFor="email">
                <b>Email : </b>
                {data.Email}
              </label>
            </div>
            <div className="column">
              <label htmlFor="organization">
                <b>Organization : </b>
                {data.Organization}
              </label>
            </div>
          </div>
          <div className="header mg-tp">
            <b></b>Address
          </div>
          <hr className="" />
          <div className="row">
            <div className="column">
              <label htmlFor="address">
                <b>Locality : </b>
                {data.Address}
              </label>
            </div>
            <div className="column">
              <label htmlFor="state">
                <b>State : </b>
                {data.State}
              </label>
            </div>
            <div className="column">
              <label htmlFor="Postal Code">
                <b>Postal Code : </b>
                {data.PostalCode}
              </label>
            </div>
          </div>
          <br />
          <span className="forgotPassword" onClick={handlePasswordChange}>
            Change password?
          </span>
        </form>
      </div>
    </div>
  );
};

export default Account;
