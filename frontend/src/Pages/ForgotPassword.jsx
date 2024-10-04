import React, { useRef, useState } from "react";
import "../Css/Login.css";
import cdaclogo from "../Images/cdaclogoRound.png";
import { useNavigate, useLocation, redirect } from "react-router-dom";
import { domain } from "../Context/config";

const ForgotPassword = () => {
  const userRef = useRef();
  const errRef = useRef();
  const [email, setEmail] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const myHeaders =new Headers();
      myHeaders.append("Content-Type","application/json");

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body:JSON.stringify({
          "email": email,
        }),
        redirect:"follow"
      }
      fetch("http://"+domain+"/email", requestOptions)
      .then((response)=>{
        setErrMsg(response.text());
        setLoading(false);
      }).then((result)=>{
        setErrMsg(result);
        setLoading(false);
      })
      .catch((error) => {console.error(error)
        setLoading(false)
      });  
    } catch (error) {
      console.log(error);
      setLoading(false);
      setErrMsg("No response from the server. Please try again later.");
      errRef.current.focus();
    }
  };

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
            <button className="loginbtn" type="submit" disabled={loading}>
              {loading ? "Please wait..." : "Send"}
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
              <p>Enter your Email address for resetting the password.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
