import React from "react";
import Cards from "../Cards/Cards";
import Table from "../Table/Table";
import "./MainDash.css";
// import Cookies from "js-cookie";

const MainDash = () => {
  // const cookieValue = Cookies.get("userCookie");
  return (
    <div className="MainDash">
      <h1>Welcome!</h1>
      <Cards />
      <Table />
    </div>
  );
};

export default MainDash;
