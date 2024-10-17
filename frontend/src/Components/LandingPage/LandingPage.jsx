import React from "react";
import "./LandingPage.css";
import cdacLogo from "../../Images/cdac.png";
import ccaLogo from "../../Images/cca.png";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate(true);

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <>
      <header className="head-bg gradient-background">
        <nav className="navbar">
          <img className="landing-logo" src={ccaLogo} alt="CCA Logo" />
          <img className="landing-logo" src={cdacLogo} alt="CDAC logo" />
          <div className="nav-container">
            <p className="nav-item" onClick={handleLogin}>
              Login
            </p>
          </div>
        </nav>
        <div className="bg-circle-1"></div>
        <div className="bg-circle-2"></div>
        <div className="bg-circle-3"></div>
        <div className="bg-circle-4"></div>

        <div className="header-container">
          <h1>CERTIFYING AUTHORITIES</h1>
          <h1>SMART DASHBOARD</h1>
        </div>
      </header>

      <footer className="">
        <div className="containerFt">
          <p className="textFt">Developed by C-DAC Bengaluru</p>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
