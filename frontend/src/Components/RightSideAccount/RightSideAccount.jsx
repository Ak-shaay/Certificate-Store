import React from "react";
import "./RightSideAccount.css";

import img1 from "../../Images/cdaclogoRound.png";
const RightSideAccount = () => {
  return (
<div className="MainAccount">
    <div className="RightMain">
      <h3> </h3>
      <div className="ProfileContainer">
        <div className="Profile">
          <img src={img1} alt="profile image" />
          <div className="ProfileData">
            <h3 className="ProfileName">CDAC</h3>
            <div className="ProfileStatus">
              <div className="ProfileStatus1">
                <span>Certificates</span>
                <p>--</p>
              </div>
              <div className="ProfileStatus2">
                <span>Issued</span>
                <p>--</p>
              </div>
              <div className="ProfileStatus3">
                <span>Active</span>
                <p>--</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default RightSideAccount;
