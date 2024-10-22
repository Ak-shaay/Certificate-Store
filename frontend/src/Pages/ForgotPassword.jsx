import React, { useRef, useState,useEffect } from "react";
import "../Css/Login.css";
import cdaclogo from "../Images/cdac.png";
import { domain } from "../Context/config";
import { useNavigate, useLocation } from "react-router-dom";


const ForgotPassword = () => {
  const navigate = useNavigate();
  const userRef = useRef();
  const errRef = useRef();
  const timeoutRef = useRef(null);
  const [email, setEmail] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
  
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
  
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          email: email,
        }),
        redirect: "follow"
      };
  
      const response = await fetch("http://" + domain + ":8080/email", requestOptions);
      const result = await response.json();
  
      if (!response.ok) {
        setErrMsg(result.error || "An error occurred");
      } else {
        setErrMsg(result); 
      }
    } catch (error) {
      console.error(error);
      setErrMsg("No response from the server. Please try again later.");
    } finally {
      setLoading(false); 
    }
  };
  useEffect(() => {
    if (errMsg) {
      timeoutRef.current = setTimeout(() => {
        setErrMsg(""); 
      }, 3000); 
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [errMsg]);

  const handleBack=(async () => {
    navigate("/login");
      });
  return (
    <div className="bodylogin">
      <div className="container" id="container">
        <div className="form-container sign-in-container">
          <form method="post" onSubmit={handleSubmit}>
            <h1>Email</h1>
            <input
              type="text"
              placeholder="Email"
              id="email"
              value={email}
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <div className="buttonGroup">
             <button className="backbtn" disabled={loading} onClick={handleBack}>Back</button>
            <button className="loginbtn" type="submit" disabled={loading}>
              {loading ? "Please wait..." : "Send"}
            </button>
            </div>
            <p
              ref={errRef}
              className={errMsg ? "errmsg" : "offscreen"}
              aria-live="assertive"
            >
              {errMsg}
            </p>
          </form>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-right">
              {/* <img className="bg-img" src={cdaclogo} alt="logo" /> */}
              <h1>Hello!</h1>
              <p>Enter your Email address for resetting the password.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
