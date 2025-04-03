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
import MultiSelect from "../MultiSelect/MultiSelect";
import api from "../../Pages/axiosInstance";
import { usageOptions } from "../../Data";
import { Backdrop, Button } from "@mui/material";

const UsageDataTable = () => {
    const [controller, setController] = useState({
      page: 0,
      rowsPerPage: 10,
    });
    const [count, setCount] = useState(0);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("UsageDate");

  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [selectedUsage, setSelectedUsage] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function createData(serialNo, name, issuer, usageDate, remark) {
    return { serialNo, name, issuer, usageDate, remark };
  }

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

  async function handleDownloadReport(usageData) {
    if (usageData.length <= 0) {
      alert("No data available for download!!");
      return null;
    }
    const title = "Usage of Certificates";
    const headers = [
      ["Serial No", "Subject Name", "Issuer Name", "Used On", "Remark"],
    ];

    const data = usageData.map((entry) => ({
      serialNo: entry.SerialNumber,
      name: entry.SubjectName,
      issuer: entry.IssuerName,
      usageDate: entry.UsageDate,
      remark: entry.Remark,
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
  }

  const applyFilter = (e) => {
    e.preventDefault();
    fetchData();
    handleFilterClose();
  };

  async function fetchData() {
    try {
      const filterData = {
        usage: selectedUsage,
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
          "/usageData",
          JSON.stringify(filterData)
        );
        if (response.data) {
          setCount(response.data.count);
          setUsageData((prevData) => response.data.result);
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
    if (usageData.length === 0) return [];
    const rows = usageData.map((entry) => {
      const serialNo = entry.SerialNumber;
      const name = entry.SubjectName;
      const issuer = entry.IssuerName;
      const usageDate = entry.UsageDate;
      const remark = entry.Remark;

      return createData(serialNo, name, issuer, usageDate, remark);
    });

    return rows
  }, [usageData, order, orderBy]);

  const usageRef = useRef();

  const handleClearAll = () => {
    if (usageRef.current) usageRef.current.resetSelectedValues();
    setStartDate("");
    setEndDate("");
  };

  const handleUsageFilter = (selectedItems) => {
    setSelectedUsage(selectedItems.map((item) => item.value));
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  return (
    <div className="TableContainer">
      <h3>Certificate Usage</h3>
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
              options={usageOptions}
              placeholder="Select Usage"
              onChange={handleUsageFilter}
              ref={usageRef}
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
        </div>{" "}
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
                sortDirection={orderBy === "SubjectName" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "SubjectName"}
                  direction={orderBy === "SubjectName" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "SubjectName")}
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
                sortDirection={orderBy === "SubjectName" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "SubjectName"}
                  direction={orderBy === "SubjectName" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "SubjectName")}
                >
                  Subject Name
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
                sortDirection={orderBy === "UsageDate" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "UsageDate"}
                  direction={orderBy === "UsageDate" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "UsageDate")}
                >
                  Usage Time
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  color: "white",
                }}
                sortDirection={orderBy === "Remark" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "Remark"}
                  direction={orderBy === "Remark" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "Remark")}
                >
                  Remark
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
                .map((row, index) => (
                  <TableRow
                    key={`${row.serialNo}-${row.name}-${row.usageDate}`}
                  >
                    <TableCell sx={{ padding: "16px" }}>
                      {row.serialNo}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.name}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.issuer}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.usageDate}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.remark}
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
              onClick={() => handleDownloadReport(usageData)}
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
};

export default UsageDataTable;
