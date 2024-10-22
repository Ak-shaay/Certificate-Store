import React from "react";
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
import ForgotPassword from "./Pages/ForgotPassword";
import Organization from "./Components/Organization/Organization";
import SystemParameters from "./Components/SystemParameters/SystemParameters";
import OrganizationCreation from "./Components/OrganizationCreation/OrganizationCreation";
import UserCreation from "./Components/UserCreation/UserCreation";
import Users from "./Components/Users/Users";

function App() {

  return (
    <Routes>
        <Route path="/" element={<Layout/>}>
          {/* Public routes */}
          <Route path="" element={<LandingPage/>}/>
          <Route path="login" element={<Login />}/>
          <Route path="forgotpassword" element={<ForgotPassword />}/>
          <Route path="unauthorized" element={<Unauthorized/>}/>
          {/* Protected Routes */}
          <Route element={<RequireAuth allowedRoles={["CA", "CCA", "Admin"]}/>}>
          <Route path="dashboard" element={<Dashboard />}/>
          </Route>
          <Route element={<RequireAuth allowedRoles={["Admin"]}/>}>
          <Route path="systemparameters" element={<SystemParameters />}/>
          <Route path="organizations" element={<Organization />}/>
          <Route path="users" element={<Users />}/>
          <Route path="create/organization" element={<OrganizationCreation />}/>
          <Route path="create/user" element={<UserCreation />}/>
          </Route>
          {/* catch all for missing routes */}
          <Route path="*" element={<Missing/>}/>
        </Route>
    </Routes>
  );
}

export default App;
