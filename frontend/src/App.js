import React,{useState} from "react";
import "./App.css";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Unauthorized from "./Components/Unauthorized/Unauthorized";
import Missing from "./Components/Missing/Missing";
import Layout from "./Components/Layout/Layout";
import RequireAuth from "./Components/RequireAuth";
import {
  Route,
  Routes,
} from "react-router-dom";
import LandingPage from "./Components/LandingPage/LandingPage";

function App() {
  const [currentUser, setCurrentUser] = useState("");

  return (
    <Routes>
        <Route path="/" element={<Layout/>}>
          {/* Public routes */}
          <Route path="" element={<LandingPage/>}/>
          <Route path="login" element={<Login setCurrentUser={setCurrentUser}/>}/>
          <Route path="unauthorized" element={<Unauthorized/>}/>
          {/* Protected Routes */}
          <Route element={<RequireAuth allowedRoles={["CA", "CCA", "Admin"]}/>}>
          <Route path="dashboard" element={<Dashboard username={currentUser}/>}/>
          </Route>
          {/* catch all for missing routes */}
          <Route path="*" element={<Missing/>}/>
        </Route>
    </Routes>
  );
}

export default App;
