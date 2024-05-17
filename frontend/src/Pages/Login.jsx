import React, { useRef, useState, useEffect } from "react";
import "../Css/Login.css";
import cdaclogo from "../Images/cdaclogoRound.png";
import axios from "axios";
import useAuth from "../Hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { domain } from "../Context/config";

const LOGIN_URL = "http://"+domain+":8080/login";

const Login = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const userRef = useRef();
  const errRef = useRef();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (latitude === null || longitude === null) {
    //   alert("Please enable location services to proceed.");
    //   return;
    // }

    try {
      setLoading(true);

      const response = await axios.post(
        LOGIN_URL,
        { username, password, latitude, longitude },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (response?.data?.accessToken) {
        localStorage.setItem("token", JSON.stringify(response.data));
        setUsername("");
        setPassword("");
        setErrMsg("");
        navigate(from, { replace: true });
        console.log("from", from);
      } else {
        setErrMsg("Invalid username or password");
        errRef.current.focus();
      }
    } catch (err) {
      console.log("err:",err);
      if (!err.response) {
        setErrMsg("No response from the server. Please try again later.");
      } else if (err.response.status === 400) {
        setErrMsg(
          "Invalid username or password. Please check your credentials."
        );
      } else if (err.response.status === 401) {
        setErrMsg("Unauthorized access. Please check your credentials.");
      } else if (err.response.status === 423) {
        setErrMsg("Maximum attempts reached.Please try after 24 hr."+ err.response.data.timeStamp);
      } else {
        setErrMsg("Unexpected error occurred. Please try again later.");
      }
      errRef.current.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bodylogin">
      <div className="container" id="container">
        <div className="form-container sign-in-container">
          <form method="post" onSubmit={handleSubmit}>
            <h1>Sign in</h1>
            <input
              type="text"
              placeholder="Name"
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
            <a href="#">Forgot your password?</a>
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
              <img className="bg-img" src={cdaclogo} alt="logo" />
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
