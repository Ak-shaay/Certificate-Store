import React from "react";
import "./ChangePassword.css";
const ChangePassword = () => {
  return (
    <div class="MainAccount">
      {/* <h3>Account</h3> */}
      <div class="AccountContainer">
        <div class="header">Change Password</div>
        <hr className="" />
        <form id="forms">
          <div class="row">
            <div class="column">
              <div class="form-group">
                <label for="district">Current Password</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Current Password"
                  disabled
                ></input>
              </div>
            </div>
            <div class="column">
              <div class="form-group">
                <label for="district">New Password</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="New Password"
                  disabled
                ></input>
              </div>
            </div>
            <div class="column">
              <div class="form-group">
                <label for="district">Confirm Password</label>
                <input
                  type="text"
                  class="form-control"
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
