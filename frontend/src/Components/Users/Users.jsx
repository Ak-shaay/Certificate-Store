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
        <div
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop:'1.5rem',
            marginBottom:'1rem'
          }}
        >
          <h2 style={{ margin:0 }}>Users</h2>
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
                    <TableCell align="left" sx={{ padding: "16px" }}>
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
