import React from "react";
import "./ChangePassword.css";
const ChangePassword = () => {
  return (
    <div className="MainAccount">
      {/* <h3>Account</h3> */}
      <div className="AccountContainer">
        <div className="header">Change Password</div>
        <hr className="" />
        <form id="forms">
          <div className="row">
            <div className="column">
              <div className="form-group">
                <label for="district">Current Password</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Current Password"
                  disabled
                ></input>
              </div>
            </div>
            <div className="column">
              <div className="form-group">
                <label for="district">New Password</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="New Password"
                  disabled
                ></input>
              </div>
            </div>
            <div className="column">
              <div className="form-group">
                <label for="district">Confirm Password</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Confirm Password"
                  disabled
                ></input>
              </div>
            </div>
          </div>
          <button className="loginbtn">Save</button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
