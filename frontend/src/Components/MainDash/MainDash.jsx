import React from "react";
import Cards from "../Cards/Cards";
import Table from "../Table/Table";
import "./MainDash.css";
// import Cookies from "js-cookie";

const MainDash = () => {
  // const cookieValue = Cookies.get("userCookie");
    const token = localStorage.getItem("token");
    const decodedToken = token ? JSON.parse(atob(token.split('.')[1])): null;
    const username = decodedToken ? decodedToken.username : "";
  return (
    <div className="MainDash">
      
      <h1>Welcome! {username}</h1>
      <Cards />
      <Table />
    </div>
  );
};

export default MainDash;
