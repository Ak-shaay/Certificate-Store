import React, { useEffect, useState, useMemo, useRef } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import TableSortLabel from "@mui/material/TableSortLabel";
import api from "../../Pages/axiosInstance";
import "./Users.css";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const Users = ({ onBack }) => {
  const [controller, setController] = useState({
    page: 0,
    rowsPerPage: 10,
  });
  const [count, setCount] = useState(0);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("authName");
  const [authNumber, setAuthNumber] = useState("");
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function createData(userEmail, name, authName, role, loginStatus) {
    return {
      userEmail,
      name,
      authName,
      role,
      loginStatus,
    };
  }
  const handleAction = async (action, userId) => {
    const message =
      action === "enable"
        ? `Are you sure you want to enable user  ${userId}?`
        : `Are you sure you want to disable user ${userId}?`;

    const confirmed = window.confirm(message);
    if (confirmed) {
      try {
        const accessToken = api.getAccessToken();
        api.setAuthHeader(accessToken);
        const response = await api.axiosInstance.post("/changeStatus", {
          userId,
          action,
        });

        if (response.status == 200) {
          alert(`Successfully updated status of ${userId}`);
          fetchData();
        } else {
          alert("Failed to perform the action.");
        }
      } catch (error) {
        alert("Error occurred while performing the action.");
        console.error(error);
      }
    }
  };
  const handleUserDelete = async (userId) => {
    const message = `Are you sure you want to delete user  ${userId}?`;

    const confirmed = window.confirm(message);
    if (confirmed) {
      try {
        const accessToken = api.getAccessToken();
        api.setAuthHeader(accessToken);
        const response = await api.axiosInstance.post("/deleteUser", {
          userId,
        });

        if (response.status === 200) {
          alert(`Successfully deleted user ${userId}`);
          fetchData();
        } else {
          alert("Failed to delete user account.");
        }
      } catch (error) {
        alert("Error occurred while performing the action.");
        console.error(error);
      }
    }
  };
  const handlePasswordChangeSubmit = async () => {
    const passRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;

    if (!passRegex.test(newPassword)) {
      setPasswordError(
        "Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character."
      );
      return;
    }

    try {
      const accessToken = api.getAccessToken();
      api.setAuthHeader(accessToken);
      const response = await api.axiosInstance.post("/resetPassword", {
        userId: selectedUserId,
        password:newPassword,
      });

      if (response.status === 200) {
        alert(`Password successfully reset for ${selectedUserId}`);
        setOpenDialog(false);
        fetchData();
      } else {
        alert("Failed to reset password.");
      }
    } catch (error) {
      console.error(error);
      alert("Error occurred while resetting password.");
    }
  };

  async function fetchData() {
    try {
      const filterData = {
        page: controller.page + 1,
        rowsPerPage: controller.rowsPerPage,
        order,
        orderBy,
      };
      const accessToken = api.getAccessToken();
      const decodedToken = accessToken
        ? JSON.parse(atob(accessToken.split(".")[1]))
        : null;
      const authNo = decodedToken ? decodedToken.authNo : [];
      setAuthNumber(authNo);

      if (accessToken) {
        api.setAuthHeader(accessToken);
        setLoading(true);
        const response = await api.axiosInstance.post(
          "/getAllUsers",
          JSON.stringify(filterData)
        );
        if (response.data) {
          setCount(response.data.count);
          setUserData((prevData) => response.data.result);
        }
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [controller, order, orderBy]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setController((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleChangeRowsPerPage = (event) => {
    setController({
      ...controller,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0,
    });
  };

  const sortedRows = useMemo(() => {
    if (userData.length === 0) return [];
    const rows = userData.map((entry) => {
      const userEmail = entry.UserEmail;
      const name = entry.Name;
      const authName = entry.AuthName;
      const role = entry.Role;
      const loginStatus = entry.LoginStatus;

      return createData(userEmail, name, authName, role, loginStatus);
    });

    return rows;
  }, [userData, order, orderBy]);

  return (
    <div className="usersBody">
      <div className="usersMain">
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Reset Password for {selectedUserId}</DialogTitle>
          <DialogContent>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError(""); 
              }}
              sx={{ mt: 2 }}
              error={!!passwordError}
              helperText={
                passwordError ||
                "Min 8 characters, with uppercase, lowercase, number, and special character"
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handlePasswordChangeSubmit}
              color="primary"
              variant="contained"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        <div
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "1.5rem",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ margin: 0, color: "rgb(60 87 153)" }}>Users</h2>
          <div style={{ position: "absolute", left: 0 }}>
            <button onClick={onBack} className="backButton">
              Back
            </button>
          </div>
        </div>
        <TableContainer
          component={Paper}
          style={{
            borderRadius: "8px",
            maxHeight: "80vh", // required for stickyHeader
            overflow: "auto", // enable scroll to make sticky work
          }}
        >
          <Table
            stickyHeader
            sx={{ minWidth: 650 }}
            aria-label="simple table"
            style={{ borderCollapse: "collapse" }}
          >
            <TableHead>
              <TableRow style={{ backgroundColor: "rgba(136,163,254, 0.83)" }}>
                <TableCell
                  sx={{
                    padding: "16px",
                    border: "1px solid #ddd",
                    color: "white",
                    backgroundColor: "rgba(136,163,254)",
                    top: 0, // make it sticky at top
                    position: "sticky", // fallback in case stickyHeader fails
                    zIndex: 1, // prevent it from being hidden behind other elements
                  }}
                  sortDirection={orderBy === "UserEmail" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "UserEmail"}
                    direction={orderBy === "UserEmail" ? order : "asc"}
                    onClick={(event) => handleRequestSort(event, "UserEmail")}
                  >
                    User Email
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    padding: "16px",
                    border: "1px solid #ddd",
                    color: "white",
                    backgroundColor: "rgba(136,163,254)",
                    top: 0, // make it sticky at top
                    position: "sticky", // fallback in case stickyHeader fails
                    zIndex: 1, // prevent it from being hidden behind other elements
                  }}
                  sortDirection={orderBy === "Name" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "Name"}
                    direction={orderBy === "Name" ? order : "asc"}
                    onClick={(event) => handleRequestSort(event, "Name")}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    padding: "16px",
                    border: "1px solid #ddd",
                    color: "white",
                    backgroundColor: "rgba(136,163,254)",
                    top: 0, // make it sticky at top
                    position: "sticky", // fallback in case stickyHeader fails
                    zIndex: 1, // prevent it from being hidden behind other elements
                  }}
                  sortDirection={orderBy === "AuthName" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "AuthName"}
                    direction={orderBy === "AuthName" ? order : "asc"}
                    onClick={(event) => handleRequestSort(event, "AuthName")}
                  >
                    AuthName
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    padding: "16px",
                    border: "1px solid #ddd",
                    color: "white",
                    backgroundColor: "rgba(136,163,254)",
                    top: 0, // make it sticky at top
                    position: "sticky", // fallback in case stickyHeader fails
                    zIndex: 1, // prevent it from being hidden behind other elements
                  }}
                  sortDirection={orderBy === "Role" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "Role"}
                    direction={orderBy === "Role" ? order : "asc"}
                    onClick={(event) => handleRequestSort(event, "Role")}
                  >
                    Role
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    padding: "16px",
                    border: "1px solid #ddd",
                    color: "white",
                    backgroundColor: "rgba(136,163,254)",
                    top: 0, // make it sticky at top
                    position: "sticky", // fallback in case stickyHeader fails
                    zIndex: 1, // prevent it from being hidden behind other elements
                  }}
                  sortDirection={orderBy === "LoginStatus" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "LoginStatus"}
                    direction={orderBy === "LoginStatus" ? order : "asc"}
                    onClick={(event) => handleRequestSort(event, "LoginStatus")}
                  >
                    Login Status
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    padding: "16px",
                    border: "1px solid #ddd",
                    color: "white",
                    backgroundColor: "rgba(136,163,254)",
                    top: 0, // make it sticky at top
                    position: "sticky", // fallback in case stickyHeader fails
                    zIndex: 1, // prevent it from being hidden behind other elements
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : sortedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No Data Available
                  </TableCell>
                </TableRow>
              ) : (
                sortedRows.map((row) => (
                  <TableRow key={row.userEmail}>
                    <TableCell sx={{ padding: "16px" }}>
                      {row.userEmail}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.name}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.authName}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.role}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.loginStatus}
                    </TableCell>
                    {/* <TableCell align="left" sx={{ padding: "16px" }}>
                      <div className="action-row">
                        {row.loginStatus !== "active" ? (
                          <>
                            <button
                              className="actionButton1"
                              onClick={() =>
                                handleAction("enable", row.userEmail)
                              }
                            >
                              enable
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="actionButton2"
                              onClick={() =>
                                handleAction("disable", row.userEmail)
                              }
                            >
                              disable
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell> */}
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      <div className="action-row">
                        {row.loginStatus !== "active" ? (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            sx={{ mr: 1 }}
                            onClick={() =>
                              handleAction("enable", row.userEmail)
                            }
                          >
                            Enable
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            sx={{ mr: 1 }}
                            onClick={() =>
                              handleAction("disable", row.userEmail)
                            }
                          >
                            Disable
                          </Button>
                        )}

                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => {
                            setSelectedUserId(row.userEmail);
                            setNewPassword("");
                            setPasswordError("");
                            setOpenDialog(true);
                          }}
                        >
                          Change Password
                        </Button>

                        <Button
                          variant="contained"
                          color="warning"
                          size="small"
                          onClick={() => handleUserDelete(row.userEmail)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="table-footer">
            <div className="downloadContainer"></div>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={count} // Use totalRecords instead of filtered data length
              rowsPerPage={controller.rowsPerPage}
              page={controller.page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </TableContainer>
      </div>
    </div>
  );
};

export default Users;
