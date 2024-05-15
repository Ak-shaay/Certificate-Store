import React from "react";
import "./Account.css";
const Account = () => {
  return (
    <div class="MainAccount">
      <h3>Account</h3>
      <div class="AccountContainer">
        <div class="header">My Account</div>
        <hr className="" />
        <form id="forms">
          <div class="row">
            <div class="column">
              <div class="form-group">
                <label for="fname">Name</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="name"
                  disabled
                ></input>
              </div>
            </div>
            <div class="column">
              <div class="form-group">
                <label for="email">Email</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="email"
                  disabled
                ></input>
              </div>
            </div>
            <div class="column">
              <div class="form-group">
                <label for="organization">Organization</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="organization"
                  disabled
                ></input>
              </div>
            </div>
          </div>
          <div class="header mg-tp">Address</div>
          <hr className="" />
          <div class="row">
            <div class="column">
              <div class="form-group">
                <label for="address">Address</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="address"
                  disabled
                ></input>
              </div>
            </div>
            <div class="column">
              <div class="form-group">
                <label for="state">State</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="state"
                  disabled
                ></input>
              </div>
            </div>
            <div class="column">
              <div class="form-group">
                <label for="district">District</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="district"
                  disabled
                ></input>
              </div>
            </div>
          </div>
          <div class="header mg-tp">Change Password</div>
          <hr className="" />
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

export default Account;
