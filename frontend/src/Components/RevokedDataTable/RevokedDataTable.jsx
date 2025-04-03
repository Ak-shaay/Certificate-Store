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
import { Backdrop, Button } from "@mui/material";

export default function RevokedDataTable() {

  const [controller, setController] = useState({
    page: 0,
    rowsPerPage: 10,
  });
  const [count, setCount] = useState(0);

  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("RevokeDateTime");

  const [revocationData, setRevocationData] = useState([]);
  const [revocationReasons, setRevocationReasons] = useState([]);
  const reasonsRef = useRef();

  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
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
        page: controller.page + 1,
        rowsPerPage: controller.rowsPerPage,
        order,
        orderBy
      };
      const accessToken = api.getAccessToken();
      if (accessToken) {
        api.setAuthHeader(accessToken);
        setLoading(true);
        const response = await api.axiosInstance.post(
          "/revokedData",
          JSON.stringify(filterData)
        );
        if (response.data) {
          setCount(response.data.count);
          // setRevocationData(response.data);
          setRevocationData((prevData) => response.data.result);
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
  }, [controller,order,orderBy]);

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
    if (revocationData.length === 0) return [];
    const rows = revocationData.map((entry) => {
      const serialNo = entry.SerialNumber;
      const issuer = entry.IssuerName;
      const revocationDate = entry.RevokeDateTime;
      const reason = entry.Reason;

      return createData(serialNo, issuer, revocationDate, reason);
    });

    return rows
  }, [revocationData, order, orderBy]);

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
                sortDirection={orderBy === "SerialNumber" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "SerialNumber"}
                  direction={orderBy === "SerialNumber" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "SerialNumber")}
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
                sortDirection={orderBy === "IssuerName" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "IssuerName"}
                  direction={orderBy === "IssuerName" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "IssuerName")}
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
                sortDirection={orderBy === "RevokeDateTime" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "RevokeDateTime"}
                  direction={orderBy === "RevokeDateTime" ? order : "asc"}
                  onClick={(event) =>
                    handleRequestSort(event, "RevokeDateTime")
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
                sortDirection={orderBy === "Reason" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "Reason"}
                  direction={orderBy === "Reason" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "Reason")}
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
                // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow key={row.serialNo + row.issuer}>
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
            <Button
              component="label"
              variant="outlined"
              tabIndex={-1}
              style={{ textTransform: "none" }}
              onClick={() => handleDownloadReport(revocationData)}
            >
              Download Report
            </Button>
          </div>
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
  );
}
