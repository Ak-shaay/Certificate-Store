import React, { useState, useEffect } from "react";
import "./Account.css";
import api from "../../Pages/axiosInstance";
import { domain } from "../../Context/config";

const Account = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

        setData(response.data.profileData);        
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const handlePasswordChange = () => {
    const filtersElement = document.getElementById("filter");
    const blurFilter = document.getElementById("accountContainer");
    blurFilter.style.filter = "blur(3px)";
    blurFilter.style.pointerEvents = "none";
    filtersElement.style.display = "block";
  };
  const handleFilterClose = (e) => {
    const filtersElement = document.getElementById("filter");
    const blurFilter = document.getElementById("accountContainer");
    blurFilter.style.filter = "blur(0px)";
    blurFilter.style.pointerEvents = "auto";
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
        console.log("this is error: ", err.response.data.message)
        document.getElementById("updatePasswordMsg").textContent = err.response.data.message;
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
      <h3>Account</h3>
      <div className="filterWindow" id="filter">
        <span className="close" onClick={handleFilterClose}>
          X
        </span>
        <h2 className="filter-head">Change Password</h2>
        <hr className="filter-line" />
        <input
          id="oldPassword"
          type="password"
          name="oldPassword"
          placeholder="Old Password"
          required
        />
        <input
          id="newPassword"
          type="password"
          name="newPassword"
          placeholder="New password"
          required
        />
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          placeholder="Confirm new password"
          required
        />
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
      <div className="AccountContainer" id="accountContainer">
        <div className="header">My Account</div>
        <hr className="" />
        <form id="forms">
          <div className="row">
            <div className="column">
              <div className="form-group">
                <label htmlFor="fname">Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={data[0].AuthName}
                  disabled
                ></input>
              </div>
            </div>
            <div className="column">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={data[0].Email}
                  disabled
                ></input>
              </div>
            </div>
            <div className="column">
              <div className="form-group">
                <label htmlFor="organization">Organization</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={data[0].Organization}
                  disabled
                ></input>
              </div>
            </div>
          </div>
          <div className="header mg-tp">Address</div>
          <hr className="" />
          <div className="row">
            <div className="column">
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={data[0].Address}
                  disabled
                ></input>
              </div>
            </div>
            <div className="column">
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={data[0].State}
                  disabled
                ></input>
              </div>
            </div>
            <div className="column">
              <div className="form-group">
                <label htmlFor="Postal Code">Postal Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={data[0].Postal_Code}
                  disabled
                ></input>
              </div>
            </div>
          </div>
          <br />
          <span className="forgotPassword" onClick={handlePasswordChange}>
            Change password?
          </span>
          <div>
            <button className="loginbtn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Account;
