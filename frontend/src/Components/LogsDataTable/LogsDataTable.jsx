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
import MultiSelect from "../MultiSelect/MultiSelect";
import { Backdrop } from "@mui/material";

export default function LogsDataTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("serialNo");
  const [logData, setLogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorities, setAuthorities] = useState();
  const [selectedUser, setSelectedUser] = useState([]);
  const [selectedAction, setSelectedAction] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [open, setOpen] = useState(false);
  const authRef = useRef();
  const actionRef = useRef();

  // remomve and add to backend
  const options = [
    { label: "Login", value: "Login" },
    { label: "Logout", value: "Logout" },
    { label: "Other", value: "Other" },
  ];

  function createData(
    logID,
    userId,
    action,
    remark,
    ipAddress,
    timestamp,
    latitude,
    longitude
  ) {
    return {
      logID,
      userId,
      action,
      remark,
      ipAddress,
      timestamp,
      latitude,
      longitude,
    };
  }

  async function fetchData() {
    try {
      const filterData = {
        user: selectedUser,
        action: selectedAction,
        startDate: startDate,
        endDate: endDate,
      };
      const accessToken = api.getAccessToken();
      if (accessToken) {
        api.setAuthHeader(accessToken);
        setLoading(true);
        const response = await api.axiosInstance.post(
          "/logs",
          JSON.stringify(filterData)
        );
        if (response.data) {
          setLogData(response.data);
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

  // get all users
  useEffect(() => {
    const fetchIssuer = async () => {
      try {
        const accessToken = api.getAccessToken();
        const decodedToken = accessToken
          ? JSON.parse(atob(accessToken.split(".")[1]))
          : null;
        const authNo = decodedToken ? decodedToken.authNo : [];
        api.setAuthHeader(accessToken);
        const response = await api.axiosInstance.post("/authorities");
        if (response.data) {
          if (authNo == null) {
            response.data.push({ label: "CCA", value: "CCA" });
            response.data.push({ label: "Admin", value: "admin" });
          }
          if (authNo == 1) {
            response.data.push({ label: "CCA", value: "CCA" });
          }
          setAuthorities(response.data);
        }
      } catch (err) {
        console.error("error : ", err);
      }
    };
    fetchIssuer();
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
    if (logData.length === 0) return [];
    const rows = logData.map((entry) => {
      const logID = entry.LogsSrNo;
      const userId = entry.UserEmail;
      const action = entry.ActionType;
      const remark = entry.Remark;
      const ipAddress = entry.IpAddress;
      const timestamp = entry.TimeStamp;
      const latitude = entry.Latitude;
      const longitude = entry.Longitude;

      return createData(
        logID,
        userId,
        action,
        remark,
        ipAddress,
        timestamp,
        latitude,
        longitude
      );
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
  }, [logData, order, orderBy]);

  // filters
  const handleFilters = (e) => {
    setOpen(true);
    const filtersElement = document.getElementById("filter");
    filtersElement.style.display = "block";
  };

  const handleFilterClose = (e) => {
    setOpen(false);
    const filtersElement = document.getElementById("filter");
    filtersElement.style.display = "none";
  };

  const handleUserFilter = (selectedItems) => {
    setSelectedUser(selectedItems.map((item) => item.value));
  };
  const handleActtionFIlter = (selectedItems) => {
    setSelectedAction(selectedItems.map((item) => item.value));
  };
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleClearAll = () => {
    if (authRef.current) authRef.current.resetSelectedValues();
    if (actionRef.current) actionRef.current.resetSelectedValues();
    setStartDate("");
    setEndDate("");
  };
  const applyFilter = (e) => {
    e.preventDefault();
    fetchData();
    handleFilterClose();
  };

  const handleDownloadReport = async (logData) => {
    if (!logData.length) {
      alert("No data available for download!!");
      return;
    }

    const title = "Logs";
    const headers = [
      [
        "Log ID",
        "User ID",
        "Action",
        "Remark",
        "IP Address",
        "Timestamp",
        "Latitude",
        "Longitude",
      ],
    ];

    const data = logData.map((entry) => ({
      logID: entry.LogsSrNo,
      userId: entry.UserEmail,
      action: entry.ActionType,
      remark: entry.Remark,
      ipAddress: entry.IpAddress,
      timestamp: entry.TimeStamp,
      latitude: entry.Latitude,
      longitude: entry.Longitude,
    }));

    try {
      const accessToken = api.getAccessToken();
      api.setAuthHeader(accessToken);

      const response = await api.axiosInstance.post("/report", {
        data,
        title,
        headers,
      });

      if (response.data) {
        alert(
          "An email has been sent to your registered mail address. Please check your inbox. This may take a few minutes"
        );
      }
    } catch (error) {
      console.error(error);
      alert("No response from the server. Please try again later.");
    }
  };

  return (
    <div className="TableContainer">
      <h3>Activity Logs</h3>
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={open}
      >
        <div className="filterWindow" id="filter">
          <span className="close" onClick={handleFilterClose}>
            X
          </span>
          <h2 className="filter-head">Filter</h2>
          <hr className="filter-line" />
          <div className="multi-select-row">
            <MultiSelect
              options={authorities}
              placeholder="Select User"
              onChange={handleUserFilter}
              ref={authRef}
            />
            <MultiSelect
              options={options}
              onChange={handleActtionFIlter}
              placeholder="Select Action"
              ref={actionRef}
            />
          </div>
          <div className="col">
            <div className="row date_picker">
              <label className="dateLable">Start Date</label>
              <input
                type="date"
                onChange={handleStartDateChange}
                className="datepicker"
                value={startDate}
              />
              <label className="dateLable">End Date</label>
              <input
                type="date"
                onChange={handleEndDateChange}
                className="datepicker"
                value={endDate}
              />
            </div>
            <br />
            <div className="filter-row">
              <button
                className="commonApply-btn clear"
                onClick={handleClearAll}
              >
                Clear
              </button>
              <button
                className="commonApply-btn cancel"
                onClick={handleFilterClose}
              >
                Cancel
              </button>
              <button className="commonApply-btn" onClick={applyFilter}>
                Apply
              </button>
            </div>
          </div>
        </div>
      </Backdrop>

      <div className="table-header">
        <button className="filter-button" onClick={handleFilters}>
          Filters
        </button>
      </div>
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
                sortDirection={orderBy === "logID" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "logID"}
                  direction={orderBy === "logID" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "logID")}
                >
                  Log ID
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  color: "white",
                }}
                sortDirection={orderBy === "userId" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "userId"}
                  direction={orderBy === "userId" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "userId")}
                >
                  User Name
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  color: "white",
                }}
                sortDirection={orderBy === "action" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "action"}
                  direction={orderBy === "action" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "action")}
                >
                  Action
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  color: "white",
                }}
                sortDirection={orderBy === "remark" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "remark"}
                  direction={orderBy === "remark" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "remark")}
                >
                  Remark
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  color: "white",
                }}
                sortDirection={orderBy === "ipAddress" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "ipAddress"}
                  direction={orderBy === "ipAddress" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "ipAddress")}
                >
                  IP Address
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  color: "white",
                }}
                sortDirection={orderBy === "timestamp" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "timestamp"}
                  direction={orderBy === "timestamp" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "timestamp")}
                >
                  Timestamp
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  color: "white",
                }}
                sortDirection={orderBy === "latitude" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "latitude"}
                  direction={orderBy === "latitude" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "latitude")}
                >
                  Latitude
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  color: "white",
                }}
                sortDirection={orderBy === "longitude" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "longitude"}
                  direction={orderBy === "longitude" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "longitude")}
                >
                  Longitude
                </TableSortLabel>
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
                  <TableRow key={row.logID}>
                    <TableCell sx={{ padding: "16px" }}>{row.logID}</TableCell>
                    <TableCell sx={{ padding: "16px" }}>{row.userId}</TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.action}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.remark}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.ipAddress}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.timestamp}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.latitude}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.longitude}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>

        <div className="table-footer">
          <div className="downloadContainer">
            <button
              className="download-btn"
              onClick={() => handleDownloadReport(logData)}
            >
              Download Report
            </button>
          </div>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
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
  );
}
