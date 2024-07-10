import React, { useState, useEffect } from "react";
import "./Account.css";
import api from "../../Pages/axiosInstance";
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
  const updatePassword= ()=>{
    alert("Update password Onclick")
  }
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
 return (
    <div className="MainAccount">
      <h3>Account</h3>
      <div className="filterWindow" id="filter">
        <span className="close" onClick={handleFilterClose}>
          X
        </span>
        <h2 className="filter-head">Update Password</h2>
        <hr className="filter-line" />
        <input
          id="authCode"
          type="password"
          name="authCode"
          placeholder="Authentication code"
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
        <br />
        <hr />
        <div className="filter-row">
          <button
            className="commonApply-btn cancel"
            onClick={handleFilterClose}
          >
            Cancel
          </button>
          <button className="commonApply-btn" onClick={updatePassword}>Update</button>
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
                  placeholder={data[0].UserName}
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
                  placeholder="email"
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
                  placeholder="organization"
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
                  placeholder="address"
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
                  placeholder="state"
                  disabled
                ></input>
              </div>
            </div>
            <div className="column">
              <div className="form-group">
                <label htmlFor="district">District</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="district"
                  disabled
                ></input>
              </div>
            </div>
          </div>
          <br/>
          <span className="forgotPassword" onClick={handlePasswordChange}>
            Update password?
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
