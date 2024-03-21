import React from "react";
import "./LandingPage.css";
import cdacLogo from "../../Images/cdaclogoRound.png";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate(true);

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <>
      <header class="head-bg gradient-background">
        <nav class="navbar">
          <img class="landing-logo" src={cdacLogo} alt="" />
          <div class="nav-container">
            <p class="nav-item" onClick={handleLogin}>
              Login
            </p>
          </div>
        </nav>
        <div class="bg-circle-1"></div>
        <div class="bg-circle-2"></div>
        <div class="bg-circle-3"></div>
        <div class="bg-circle-4"></div>

        <div class="header-container">
          <h1>CERTIFYING AUTHORITIES</h1>
          <h1>SMART DASHBOARD</h1>
        </div>
      </header>

      <footer class="">
        <div class="containerFt">
          <p class="textFt">Developed by C-DAC Bengaluru</p>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
