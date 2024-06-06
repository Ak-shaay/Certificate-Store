import React from "react";
import "./Account.css";
const Account = () => {
  return (
    <div className="MainAccount">
      <h3>Account</h3>
      <div className="AccountContainer">
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
                  placeholder="name"
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
        </form>
      </div>
    </div>
  );
};

export default Account;
