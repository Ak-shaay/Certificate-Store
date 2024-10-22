import React, { useRef, useState, useEffect } from "react";
import "../Css/Login.css";
import cdacLogo from "../Images/cdac.png";
import ccaLogo from "../Images/cca.png";
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

  const nameRegex = /^(?![@$!%*?&.])(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

  useEffect(() => {
    geolocation();
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
  const handleForgot=(async () => {
navigate("/forgotpassword");
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (latitude === null || longitude === null) {
    //   alert("Please enable location services to proceed.");
    //   return;
    // }
    
    // if(!nameRegex.test(username)){
    //   setErrMsg("Please enter a valid username");
    //   return;
    // }
    // if(!passRegex.test(password)){
    //   setErrMsg("Please enter a valid password");
    //   return;
    // }

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
        api.setAccessToken(accessToken)
        api.setRefreshToken(refreshToken)
        setUsername("");
        setPassword("");
        setErrMsg("");
        navigate(from, { replace: true });
        // console.log("from", from);
      } else {
        setErrMsg("Invalid username or password");
        errRef.current.focus();
      }
    } catch (err) {
      if (!err.response) {
        setErrMsg("No response from the server. Please try again later.");
      } else if (err.response.status === 400) {
        setErrMsg(
          "Invalid username or password. Please check your credentials."
        );
      } else if (err.response.status === 401) {
        setErrMsg("Unauthorized access. Please check your credentials.");
      } else if (err.response.status === 423) {
        setErrMsg(
          "Maximum attempts reached.Please try after 24 hr." +
            err.response.data.timeStamp
        );
      } else {
        setErrMsg("Unexpected error occurred. Please try again later.");
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
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [errMsg]);

  return (
    <div className="bodylogin">
      {/* <nav className="navbarLogin">
          <img className="landing-logo" src={ccaLogo} alt="CCA Logo" />
          <img className="landing-logo" src={cdacLogo} alt="CDAC logo" />
        </nav> */}
      <div className="container" id="container">
        <div className="form-container sign-in-container">
          <form method="post" onSubmit={handleSubmit}>
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
            <a href="#" onClick={handleForgot}>Forgot your password?</a>
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
              {/* <img className="bg-img" src={cdacLogo} alt="logo" /> */}
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
