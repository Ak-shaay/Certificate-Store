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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("serialNo");
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
      const accessToken = api.getAccessToken();
      const decodedToken = accessToken
        ? JSON.parse(atob(accessToken.split(".")[1]))
        : null;
      const authNo = decodedToken ? decodedToken.authNo : [];
      setAuthNumber(authNo);

      if (accessToken) {
        api.setAuthHeader(accessToken);
        setLoading(true);
        const response = await api.axiosInstance.post("/getAllUsers");
        if (response.data) {
          setUserData(response.data);
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
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

    const comparator = (a, b) => {
      if (a[orderBy] < b[orderBy]) {
        return order === "asc" ? -1 : 1;
      }
      if (a[orderBy] > b[orderBy]) {
        return order === "asc" ? 1 : -1;
      }
      return 0;
    };

    return rows.slice().sort(comparator);
  }, [userData, order, orderBy]);

  return (
    <div className="usersBody">
      <div className="usersMain">
        <div className="backClass">
          <button onClick={onBack} className="backButton">
            Back
          </button>
        </div>
        <h2>Users</h2>
        <TableContainer
          component={Paper}
          style={{
            borderRadius: "8px",
          }}
        >
          <Table
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
                  }}
                  sortDirection={orderBy === "userEmail" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "userEmail"}
                    direction={orderBy === "userEmail" ? order : "asc"}
                    onClick={(event) => handleRequestSort(event, "userEmail")}
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
                  }}
                  sortDirection={orderBy === "name" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={(event) => handleRequestSort(event, "name")}
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
                  }}
                  sortDirection={orderBy === "authName" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "authName"}
                    direction={orderBy === "authName" ? order : "asc"}
                    onClick={(event) => handleRequestSort(event, "authName")}
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
                  }}
                  sortDirection={orderBy === "role" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "role"}
                    direction={orderBy === "role" ? order : "asc"}
                    onClick={(event) => handleRequestSort(event, "role")}
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
                  }}
                  sortDirection={orderBy === "loginStatus" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "loginStatus"}
                    direction={orderBy === "loginStatus" ? order : "asc"}
                    onClick={(event) => handleRequestSort(event, "loginStatus")}
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
                sortedRows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
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
            <TablePagination
              rowsPerPageOptions={[5, 10, 20]}
              component="div"
              count={sortedRows.length}
              rowsPerPage={rowsPerPage}
              page={page}
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
