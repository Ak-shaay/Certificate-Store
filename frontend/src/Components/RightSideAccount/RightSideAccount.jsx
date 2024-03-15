import React from "react";
import './RightSideAccount.css'
import img1 from "../../Images/cdaclogoRound.png";
const RightSideAccount = () => {
    
  return (
    <div class="RightMain">
        <h3> </h3>
        <div class="ProfileContainer">
    <div class="Profile">
        <img src={img1} alt="profile image"/>
        <div class="ProfileData">
            <h3 class="ProfileName">CDAC</h3>
            <div class="ProfileStatus">
                <div class="ProfileStatus1">
                    <span>Certificates</span>
                    <p>2</p>
                </div>
                <div class="ProfileStatus2">
                    <span>Issued</span>
                    <p>100</p>
                </div>
                <div class="ProfileStatus3">
                    <span>Active</span>
                    <p>88</p>
                </div>
            </div>
        </div>
    </div>
</div>

    </div>
  );
};

export default RightSideAccount;
