import React, { useState, useEffect } from "react";
import "./Account.css";
import api from "../../Pages/axiosInstance";
import { domain } from "../../Context/config";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Skeleton from "@mui/material/Skeleton";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", sm: 500, md: 550 },
  background:
    "linear-gradient(rgb(248, 212, 154) -146.42%, rgb(255, 202, 113) -46.42%)",
  boxShadow: "0px 10px 20px 0px rgb(140, 140, 140)",
  borderRadius: "10px",
  padding: { xs: "20px", sm: "28px", md: "32px" },
  color: "black",
};

const Account = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event) => event.preventDefault();

 useEffect(() => {
  const fetchData = async () => {
    try {
      const accessToken = api.getAccessToken();
      if (accessToken) {
        api.setAuthHeader(accessToken);
      }

      const response = await api.axiosInstance.post("/profileData");

      if (response.data && response.data.profile) {
        setData(response.data.profile);
      } else {
        throw new Error("Invalid response data");
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  const handlePasswordChange = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setUpdateMsg("");
  };

  const updatePassword = async () => {
    const accessToken = api.getAccessToken();
    if (!accessToken) {
      setUpdateMsg("No access token found. Please log in.");
      return;
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      setUpdateMsg("Please fill all the details.");
      return;
    }

    if (oldPassword === newPassword) {
      setUpdateMsg("Old password cannot be used as new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setUpdateMsg("Passwords do not match.");
      return;
    }

    try {
      api.setAuthHeader(accessToken);
      const response = await api.axiosInstance.post("/updatePassword", {
        oldPassword,
        newPassword,
        confirmPassword,
      });

      if (response.status === 200) {
        setUpdateMsg(response.data.message + " Logging out...");
        setTimeout(() => {
          api.removeTokens();
          document.cookie = `certStore=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          window.location.href = domain+'/login';
        }, 3500);
      }
    } catch (err) {
      setUpdateMsg(
        err?.response?.data?.message || "Failed to update password."
      );
    }
  };

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
      >
        <Typography color="error" variant="h6">
          Error loading the page
        </Typography>
      </Box>
    );
  }

  return (
    <div className="MainAccount">
      <h2 className="cursive">Account</h2>

      {/* MUI Modal for Password Update */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <span
            className="close"
            onClick={handleClose}
            style={{ float: "right", cursor: "pointer", fontWeight: "bold" }}
          >
            X
          </span>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          <hr className="filter-line" />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel htmlFor="oldPassword">Current Password</InputLabel>
            <OutlinedInput
              sx={{
                backgroundColor: "papayawhip",
                fontSize: { xs: 14, sm: 16 },
                paddingY: "10px",
                height: { xs: 45, sm: 50 },
              }}
              id="oldPassword"
              type={showPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Current Password"
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel htmlFor="newPassword">New Password</InputLabel>
            <OutlinedInput
              sx={{
                backgroundColor: "papayawhip",
                fontSize: { xs: 14, sm: 16 },
                paddingY: "10px",
                height: { xs: 45, sm: 50 },
              }}
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowNewPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="New Password"
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel htmlFor="confirmPassword">Confirm Password</InputLabel>
            <OutlinedInput
              sx={{
                backgroundColor: "papayawhip",
                fontSize: { xs: 14, sm: 16 },
                paddingY: "10px",
                height: { xs: 45, sm: 50 },
              }}
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowConfirmPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Confirm Password"
            />
          </FormControl>

          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {updateMsg}
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <button className="commonApply-btn cancel" onClick={handleClose}>
              Cancel
            </button>
            <button className="commonApply-btn" onClick={updatePassword}>
              Update
            </button>
          </Box>
        </Box>
      </Modal>

      {/* Account Information */}
      <div className="AccountContainer" id="accountContainer">
        <div className="header">My Account</div>
        <hr />
        <form id="forms">
          <div className="row">
            <div className="column">
              <label>
                <b>Name : </b>
                {loading ? <Skeleton width={150} /> : data?.Name || "N/A"}
              </label>
            </div>
            <div className="column">
              <label>
                <b>Email : </b>
                {loading ? <Skeleton width={200} /> : data?.Email || "N/A"}
              </label>
            </div>
            <div className="column">
              <label>
                <b>Organization : </b>
                {loading ? <Skeleton width={180} /> : data?.Organization || "N/A"}
              </label>
            </div>
          </div>

          <div className="header mg-tp">Address</div>
          <hr />
          <div className="row">
            <div className="column">
              <label>
                <b>Locality : </b>
                {loading ? <Skeleton width={160} /> : data?.Address || "N/A"}
              </label>
            </div>
            <div className="column">
              <label>
                <b>State : </b>
                {loading ? <Skeleton width={120} /> : data?.State || "N/A"}
              </label>
            </div>
            <div className="column">
              <label>
                <b>Postal Code : </b>
                {loading ? <Skeleton width={80} /> : data?.PostalCode || "N/A"}
              </label>
            </div>
          </div>
          <br />
          {!loading && (
            <span className="forgotPassword" onClick={handlePasswordChange}>
              Change password?
            </span>
          )}
        </form>
      </div>
    </div>
  );
};

export default Account;
