import React, { useRef, useState, useEffect } from "react";
import "../Css/Login.css";
import useAuth from "../Hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import api from "./axiosInstance";

const Login = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const userRef = useRef();
  const errRef = useRef();
  const timeoutRef = useRef(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const nameRegex =/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  useEffect(() => {
    geolocation();
  }, []);

  // If there's an error message stored in sessionStorage, set it in state
  useEffect(() => {
    const storedErrMsg = sessionStorage.getItem("errMsg");
    if (storedErrMsg) {
      setErrMsg(storedErrMsg);
      sessionStorage.removeItem("errMsg");  // Clear the error after setting
    }
  }, []);

  function geolocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }
  
  const handleForgot = async () => {
    navigate("/forgotpassword");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await api.axiosInstance.post("/login", {
        username,
        password,
        latitude,
        longitude,
      });
      if (response?.data?.accessToken) {
        const accessToken = await response.data.accessToken;
        const refreshToken = await response.data.refreshToken;
        api.setAccessToken(accessToken);
        api.setRefreshToken(refreshToken);
        setUsername("");
        setPassword("");
        setErrMsg("");
        navigate(from, { replace: true });
      } else {
        setErrMsg("Invalid username or password");
        sessionStorage.setItem("errMsg", "Invalid username or password. Please check your credentials.");
        errRef.current.focus();
      }
    } catch (err) {
      if (!err.response) {
        setErrMsg("No response from the server. Please try again later.");
        sessionStorage.setItem("errMsg", "No response from the server. Please try again later.");
      } else if (err.response.status === 400) {
        setErrMsg("Invalid username or password. Please check your credentials.");
        sessionStorage.setItem("errMsg", "Invalid username or password. Please check your credentials.");
      } else if (err.response.status === 401) {
        setErrMsg("Unauthorized access. Please check your credentials.");
        sessionStorage.setItem("errMsg", "Unauthorized access. Please check your credentials.");
      } else if (err.response.status === 403) {
        setErrMsg("Your account has been temporarily blocked. Please contact Admin.");
        sessionStorage.setItem("errMsg", "Your account has been temporarily blocked. Please contact Admin.");
      } else if (err.response.status === 423) {
        setErrMsg("Maximum attempts reached. Please try after 24 hours.");
        sessionStorage.setItem("errMsg", "Maximum attempts reached. Please try after 24 hours.");
      } else {
        setErrMsg("Unexpected error occurred. Please try again later.");
        sessionStorage.setItem("errMsg", "Unexpected error occurred. Please try again later.");
      }
      errRef.current.focus();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (errMsg) {
      timeoutRef.current = setTimeout(() => {
        setErrMsg(""); 
      }, 3000);
    } else {
      clearTimeout(timeoutRef.current);
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [errMsg]);

  return (
    <div className="bodylogin">
      <div className="container" id="container">
        <div className="form-container sign-in-container">
          <form onSubmit={handleSubmit}>
            <h1>Sign in</h1>
            <input
              type="text"
              placeholder="Username"
              id="username"
              value={username}
              name="username"
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              id="password"
              value={password}
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <a href="#" onClick={handleForgot}>
              Forgot your password?
            </a>
            <button className="loginbtn" type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
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
              <h1>Hello!</h1>
              <p>Enter your login credentials for a seamless experience.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
