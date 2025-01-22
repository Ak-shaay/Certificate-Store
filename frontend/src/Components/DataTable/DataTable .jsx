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
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import api from "../../Pages/axiosInstance";
import MultiSelect from "../MultiSelect/MultiSelect";
import download from "../../Images/download.png";
import verify from "../../Images/check-mark.png";
import "./DataTable.css";

export default function DataTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("serialNo");
  const [authNumber, setAuthNumber] = useState("");
  const [issuerData, setIssuerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bcLoading, setBcLoading] = useState(true);

  const [authorities, setAuthorities] = useState();
  const [issuer, setIssuer] = useState([]);
  const [subjectType, setSubjectType] = useState([]);
  const [state, setState] = useState([]);
  const [subType, setSubType] = useState([]);
  const [region, setRegion] = useState([]);
  const [regions, setRegions] = useState([]);
  const [stateByRegion, setStateByRegion] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [validity, setValidity] = useState("");
  const subTypeRef = useRef();
  const regionRef = useRef();
  const stateRef = useRef();
  const issuerRef = useRef();

  const [verifyData, setVerifyData] = useState("");

  const [open, setOpen] = useState(false);

  const handleVerify = async (row) => {
    setVerifyData("");
    setOpen(true);
    try {
      const data = {
        serialNo: row.serialNo,
        issuerSerialNo: row.issuerSlNo,
        issuerName: row.issuer,
      };

      const accessToken = api.getAccessToken();
      if (accessToken) {
        api.setAuthHeader(accessToken);
        setBcLoading(true);

        const response = await api.axiosInstance.post(
          "/blockchain/verify",
          JSON.stringify(data)
        );

        if (response.status === 200) {
          setVerifyData(response.data.message);
        } else setVerifyData("");

        setBcLoading(false);
      }
    } catch (error) {
      // console.log(error);
      setBcLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  function createData(
    serialNo,
    name,
    issuer,
    issuerSlNo,
    issuedDate,
    state,
    region,
    expiryDate,
    subjectType,
    rawCertificate
  ) {
    return {
      serialNo,
      name,
      issuer,
      issuerSlNo,
      issuedDate,
      state,
      region,
      expiryDate,
      subjectType,
      rawCertificate,
    };
  }

  async function fetchData() {
    try {
      const filterData = {
        issuer: issuer,
        subjectType: subjectType,
        state: state,
        region: region,
        selectedDate: selectedDate,
        startDate: startDate,
        endDate: endDate,
        validity: validity,
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
          "/data",
          JSON.stringify(filterData)
        );
        if (response.data) {
          setIssuerData(response.data);
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

  // get all the authorities
  useEffect(() => {
    const fetchIssuer = async () => {
      try {
        const accessToken = api.getAccessToken();
        api.setAuthHeader(accessToken);
        const response = await api.axiosInstance.post("/authorities");
        if (response.data) {
          setAuthorities(response.data);
        }
      } catch (err) {
        console.error("error : ", err);
      }
    };
    fetchIssuer();
  }, []);

  // get subjects type
  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const accessToken = api.getAccessToken();
        api.setAuthHeader(accessToken);
        const response = await api.axiosInstance.post("/getSubType");
        if (response.data) {
          setSubType(response.data);
        }
      } catch (err) {
        console.error("error : ", err);
      }
    };
    fetchSubject();
  }, []);

  // get regions
  useEffect(() => {
    const fetchRegion = async () => {
      try {
        const accessToken = api.getAccessToken();
        if (accessToken) {
          api.setAuthHeader(accessToken);
        }
        const response = await api.axiosInstance.post("/region");
        if (response.status == 200) {
          setRegions(response.data);
        }
      } catch (error) {
        console.error("Error fetching the data: ", error);
      }
    };
    fetchRegion();
  }, []);
  // get states by region
  async function getStates(region) {
    try {
      const accessToken = api.getAccessToken();
      if (accessToken) {
        api.setAuthHeader(accessToken);
      }
      const response = await api.axiosInstance.post("/getStatesByRegion", {
        regions: region,
      });
      if (response.status == 200) {
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching data : ", error);
      return [];
    }
  }
  // fetch the states if the region changes
  useEffect(() => {
    const fetchStatesByRegion = async () => {
      try {
        const states = await getStates(region);
        setStateByRegion(states);
      } catch (error) {
        console.error("Error fetching states by region:", error);
      }
    };
    fetchStatesByRegion();
  }, [region]);

  const handleRegionFilter = async (selectedItems) => {
    const selectedRegions = selectedItems.map((item) => item.value);
    setRegion(selectedRegions);
    const statesByRegion = await getStates(selectedRegions);
    setStateByRegion(statesByRegion);
  };

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
    if (issuerData.length === 0) return [];
    const rows = issuerData.map((entry) => {
      const serialNo = entry.SerialNumber;
      const name = entry.SubjectName;
      const issuer = entry.IssuerName;
      const issuerSlNo = entry.IssuerSlNo;
      const issuedDate = entry.IssueDate;
      const state = entry.State;
      const region = entry.Region;
      const expiryDate = entry.ExpiryDate;
      const subjectType = entry.SubjectType;
      const rawCertificate = entry.RawCertificate;

      return createData(
        serialNo,
        name,
        issuer,
        issuerSlNo,
        issuedDate,
        state,
        region,
        expiryDate,
        subjectType,
        rawCertificate
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
  }, [issuerData, order, orderBy]);

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
  const handleIssuerFilter = (selectedItems) => {
    setIssuer(selectedItems.map((item) => item.value));
  };
  const handleSubTypeFilter = (selectedItems) => {
    setSubjectType(selectedItems.map((item) => item.value));
  };
  const handleStateFilter = (selectedItems) => {
    setState(selectedItems.map((item) => item.value));
  };
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };
  const handleValidity = (e) => {
    setValidity(e.target.value);
  };

  const handleClearAll = () => {
    if (subTypeRef.current) subTypeRef.current.resetSelectedValues();
    if (regionRef.current) regionRef.current.resetSelectedValues();
    if (stateRef.current) stateRef.current.resetSelectedValues();
    if (issuerRef.current) issuerRef.current.resetSelectedValues();
    setSelectedDate("");
    setStartDate("");
    setEndDate("");
    setValidity("");
  };
  const applyFilter = (e) => {
    e.preventDefault();
    fetchData();
    handleFilterClose();
  };
  const handleDownload = async (rawCertificate, filename) => {
    const link = document.createElement("a");
    const file = new Blob([rawCertificate], { type: "text/plain" });
    link.href = URL.createObjectURL(file);
    link.download = filename + ".cer";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleDownloadReport = async (issuedData) => {
    if (!issuedData.length) {
      alert("No data available for download!!");
      return;
    }

    const title = "Issued Certificates";
    const headers = [
      [
        "Serial No",
        "Name",
        "Issuer",
        "Issued Date",
        "State",
        "Region",
        "Expiry Date",
        "Subject Type",
      ],
    ];

    const data = issuedData.map((entry) => ({
      serialNo: entry.SerialNumber,
      name: entry.SubjectName,
      issuer: entry.IssuerName,
      issued: entry.IssueDate,
      state: entry.State,
      region: entry.Region,
      expiry: entry.ExpiryDate,
      subjectType: entry.SubjectType,
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
      <h3>Issued Certificates</h3>
      <div className="filterWindow" id="filter">
        <span className="close" onClick={handleFilterClose}>
          X
        </span>
        <h2 className="filter-head">Filter</h2>
        <hr className="filter-line" />
        <div className="multi-select-row">
          {authNumber == 1 || authNumber == null ? (
            <MultiSelect
              options={authorities}
              placeholder="Select Issuer"
              onChange={handleIssuerFilter}
              value={issuer}
              ref={issuerRef}
            />
          ) : (
            <></>
          )}
          <MultiSelect
            options={subType}
            onChange={handleSubTypeFilter}
            placeholder="Subject Type"
            ref={subTypeRef}
          />
          <MultiSelect
            options={regions}
            onChange={handleRegionFilter}
            placeholder="Select Region"
            ref={regionRef}
          />
          <MultiSelect
            options={stateByRegion}
            onChange={handleStateFilter}
            placeholder="Select State"
            ref={stateRef}
          />
        </div>
        <div className="row dateFilter">
          <select
            className="datepicker"
            name="date"
            id="date"
            value={selectedDate}
            onChange={handleDateChange}
          >
            <option value="" disabled>
              Select your option
            </option>
            <option value="issued">Issued Date</option>
            <option value="expiry">Expiry Date</option>
          </select>
          <div className="dateGroup">
            <label className="dateLabel">from</label>
            <input
              type="date"
              className="datepicker"
              onChange={handleStartDateChange}
              value={startDate}
            />
          </div>
          <div className="dateGroup">
            <label className="dateLabel">to</label>
            <input
              type="date"
              className="datepicker"
              disabled={startDate === ""}
              onChange={handleEndDateChange}
              value={endDate}
            />
          </div>
        </div>
        <div className="row validity">
          <label className="validityLabel">Validity </label>
          <input
            type="number"
            className="datepicker"
            step="1"
            min="0"
            max="10"
            onChange={handleValidity}
          />
          <label className="validityLabel">Year(s)</label>
        </div>
        <br />
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
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Fetching Information from blockchain"}
        </DialogTitle>
        <DialogContent>
          {bcLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          ) : verifyData === "Success" ? (
            <Alert severity="success">Verification Successful</Alert>
          ) : (
            <Alert severity="warning">
              Couldn't Find the requested certificate in blockchain
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>

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
                sortDirection={orderBy === "issuer" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "issuer"}
                  direction={orderBy === "issuer" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "issuer")}
                >
                  Issuer
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  color: "white",
                }}
                sortDirection={orderBy === "issuedDate" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "issuedDate"}
                  direction={orderBy === "issuedDate" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "issuedDate")}
                >
                  Issued Date
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  color: "white",
                }}
                sortDirection={orderBy === "state" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "state"}
                  direction={orderBy === "state" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "state")}
                >
                  State
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  color: "white",
                }}
                sortDirection={orderBy === "region" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "region"}
                  direction={orderBy === "region" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "region")}
                >
                  Region
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  color: "white",
                }}
                sortDirection={orderBy === "expiryDate" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "expiryDate"}
                  direction={orderBy === "expiryDate" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "expiryDate")}
                >
                  Expiry Date
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
                <TableSortLabel
                  active={orderBy === "subjectType"}
                  direction={orderBy === "subjectType" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "subjectType")}
                >
                  Subject Type
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
                  <TableRow key={row.serialNo}>
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
                      {row.issuedDate}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.state}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.region}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.expiryDate}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      {row.subjectType}
                    </TableCell>
                    <TableCell align="left" sx={{ padding: "16px" }}>
                      <div className="action-row">
                        <img
                          src={download}
                          alt="download"
                          className="action-img"
                          title="Download"
                          onClick={() =>
                            handleDownload(
                              row.rawCertificate,
                              row.serialNo + "_" + row.issuer
                            )
                          }
                        />
                        <img
                          src={verify}
                          alt="verify"
                          className="action-img"
                          title="Verify"
                          onClick={() => handleVerify(row)}
                        />
                      </div>
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
              onClick={() => handleDownloadReport(issuerData)}
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
