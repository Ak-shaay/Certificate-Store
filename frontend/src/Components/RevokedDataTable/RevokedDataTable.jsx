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
import { domain } from "../../Context/config";

// import "./DataTable.css";

export default function RevokedDataTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("serialNo");
  const [authNumber, setAuthNumber] = useState("");
  const [revocationData, setRevocationData] = useState([]);
  const [revocationReasons, setRevocationReasons] = useState([]);
  const reasonsRef = useRef();

  const [loading, setLoading] = useState(true);

  const [selectedReasons, setSelectedReasons] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function createData(serialNo, issuer, revocationDate, reason) {
    return {
      serialNo,
      issuer,
      revocationDate,
      reason,
    };
  }

  async function fetchData() {
    try {
      const filterData = {
        reasons: selectedReasons,
        startDate: startDate,
        endDate: endDate,
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
          "/revokedData",
          JSON.stringify(filterData)
        );
        if (response.data) {
          setRevocationData(response.data);
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

  // get all revocation reasons
  useEffect(() => {
    fetch(`http://${domain}:8080/getAllRevocationReasons`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => setRevocationReasons(data))
      .catch((error) => console.error("Error fetching data:", error));
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
    if (revocationData.length === 0) return [];
    const rows = revocationData.map((entry) => {
      const serialNo = entry.SerialNumber;
      const issuer = entry.IssuerName;
      const revocationDate = entry.RevokeDateTime;
      const reason = entry.Reason;

      return createData(serialNo, issuer, revocationDate, reason);
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
  }, [revocationData, order, orderBy]);

  // filters
  const handleFilters = (e) => {
    const filtersElement = document.getElementById("filter");
    // const blurFilter = document.getElementById("applyFilter");
    // blurFilter.style.filter = "blur(3px)";
    // blurFilter.style.pointerEvents = "none";
    filtersElement.style.display = "block";
  };

  const handleFilterClose = (e) => {
    const filtersElement = document.getElementById("filter");
    // const blurFilter = document.getElementById("applyFilter");
    // blurFilter.style.filter = "blur(0px)";
    // blurFilter.style.pointerEvents = "auto";
    filtersElement.style.display = "none";
  };
  const handleMultiSelectChange = (selectedItems) => {
    setSelectedReasons(selectedItems.map((item) => item.value));
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleClearAll = () => {
    if (reasonsRef.current) reasonsRef.current.resetSelectedValues();
    setStartDate("");
    setEndDate("");
  };
  const applyFilter = (e) => {
    e.preventDefault();
    fetchData();
    handleFilterClose();
  };

  const handleDownloadReport = async (revocationData) => {
    if (!revocationData.length) {
      alert("No data available for download!!");
      return;
    }

    const title = "Revoked Certificates";
    const headers = [["Serial No", "Issuer", "Revokation Date", "Reason"]];

    const data = revocationData.map((entry) => ({
      serialNo: entry.SerialNumber,
      issuer: entry.IssuerName,
      revocationDate: entry.RevokeDateTime,
      reason: entry.Reason,
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
      <h3>Revoked Certificate</h3>
      <div className="filterWindow" id="filter">
        <span className="close" onClick={handleFilterClose}>
          X
        </span>
        <h2 className="filter-head">Filter</h2>
        <hr className="filter-line" />
        <div className="multi-select-row">
          <MultiSelect
            options={revocationReasons}
            placeholder="Select Reason"
            onChange={handleMultiSelectChange}
            ref={reasonsRef}
          />
        </div>
        <div className="row date_picker">
          <label className="dateLable">Start Date</label>
          <input
            type="date"
            className="datepicker"
            onChange={handleStartDateChange}
            value={startDate}
          />
          <label className="dateLable">End Date</label>
          <input
            type="date"
            className="datepicker"
            onChange={handleEndDateChange}
            value={endDate}
          />
        </div>
        <hr />
        <div className="filter-row">
          <button className="commonApply-btn clear" onClick={handleClearAll}>
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
                sortDirection={orderBy === "serialNo" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "serialNo"}
                  direction={orderBy === "serialNo" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "serialNo")}
                >
                  Serial No
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  color: "white",
                }}
                sortDirection={orderBy === "issuer" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "issuer"}
                  direction={orderBy === "issuer" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "issuer")}
                >
                  Issuer Name
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  color: "white",
                }}
                sortDirection={orderBy === "revocationDate" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "revocationDate"}
                  direction={orderBy === "revocationDate" ? order : "asc"}
                  onClick={(event) =>
                    handleRequestSort(event, "revocationDate")
                  }
                >
                  Revocation Date
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  color: "white",
                }}
                sortDirection={orderBy === "reason" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "reason"}
                  direction={orderBy === "reason" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "reason")}
                >
                  Revocation Reason
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
                  <TableRow key={row.serialNo}>
                    <TableCell sx={{ padding: "16px" }}>
                      {row.serialNo}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.issuer}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.revocationDate}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.reason}
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
              onClick={() => handleDownloadReport(revocationData)}
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
