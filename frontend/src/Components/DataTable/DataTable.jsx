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
import Alert from "@mui/material/Alert";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import api from "../../Pages/axiosInstance";
import MultiSelect from "../MultiSelect/MultiSelect";
import download from "../../Images/download.png";
import verify from "../../Images/check-mark.png";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ThumbUpOffAltOutlinedIcon from "@mui/icons-material/ThumbUpOffAltOutlined";
import "./DataTable.css";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Modal,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function DataTable() {
  const [controller, setController] = useState({
    page: 0,
    rowsPerPage: 10,
  });

  const severityColorMap = {
    Critical:"red",
    High: "orange",
    Medium: "#d9cc1dfa",
    Low: "green"
  };
  const [count, setCount] = useState(0);

  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("IssueDate");
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
  const [validity, setValidity] = useState(0);
  const subTypeRef = useRef();
  const regionRef = useRef();
  const stateRef = useRef();
  const issuerRef = useRef();

  const [verifyData, setVerifyData] = useState("");

  const [open, setOpen] = useState(false);
  const [backdrop, setBackdrop] = useState(false);

  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [backdropError, setBackdropError] = useState(false);
  const [errorGroups, setErrorGroups] = useState([]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenErrorModal = async (row) => {
    try {
      const data = { reqSerialNo: row.reqSerialNo };
      const accessToken = api.getAccessToken();

      if (accessToken) {
        api.setAuthHeader(accessToken);

        const response = await api.axiosInstance.post("/errorData", data);

        if (response.status === 200) {
          // console.log("res", response.data);
          setErrorGroups(response.data.errors);
          setBackdropError(true);
          setOpenErrorModal(true);
        } else {
          console.log("Error retrieving error data");
        }
      }
    } catch (error) {
      console.error("API error:", error);
    }
  };
  const handleCloseError = () => {
    setOpenErrorModal(false);
    setBackdropError(false);
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
    errorCount,
    rawCertificate,
    reqSerialNo
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
      errorCount,
      rawCertificate,
      reqSerialNo,
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
          "/data",
          JSON.stringify(filterData)
        );
        if (response.data) {
          setCount(response.data.count);
          setIssuerData((prevData) => response.data.result);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [controller, order, orderBy]);

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
      const errorCount = entry.errorCount;
      const rawCertificate = entry.RawCertificate;
      const reqSerialNo = entry.ReqSerialNo;

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
        errorCount,
        rawCertificate,
        reqSerialNo
      );
    });
    return rows;
  }, [issuerData, order, orderBy]);
  // filters
  const handleFilters = (e) => {
    setBackdrop(true);
    const filtersElement = document.getElementById("filter");
    filtersElement.style.display = "block";
  };

  const handleFilterClose = (e) => {
    setBackdrop(false);
    const filtersElement = document.getElementById("filter");
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
    setValidity(0);
  };
  const applyFilter = (e) => {
    e.preventDefault();
    fetchData();
    handleFilterClose();
  };
  // const handleDownload = async (rawCertificate, filename) => {
  //   const link = document.createElement("a");
  //   const file = new Blob([rawCertificate], { type: "text/plain" });
  //   link.href = URL.createObjectURL(file);
  //   link.download = filename + ".cer";
  //   link.click();
  //   URL.revokeObjectURL(link.href);
  // };

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
        "State",
        "Issuer SerialNo",
        "Issuer",
        "Issued Date",
        "Expiry Date",
        "Subject Type",
      ],
    ];

    const data = {
      issuer: issuer,
      subjectType: subjectType,
      state: state,
      region: region,
      selectedDate: selectedDate,
      startDate: startDate,
      endDate: endDate,
      validity: validity,
      order,
      orderBy,
      noPagination: true,
    };
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
      <h2 className="cursive">Issued Certificates</h2>
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={backdrop}
      >
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
            {/* <MultiSelect
              options={regions}
              onChange={handleRegionFilter}
              placeholder="Select Region"
              ref={regionRef}
            /> */}
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
              value={validity}
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
      </Backdrop>
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={backdropError}
      >
        <Modal
          open={openErrorModal}
          onClose={handleCloseError}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          closeAfterTransition
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: {
                xs: "90vw",
                sm: 500,
                md: 600,
              },
              maxHeight: {
                xs: "70vh",
                sm: "80vh",
                md: "80vh",
              },
              overflowY: "auto",
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: { xs: 2, sm: 3, md: 4 },
            }}
          >
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              gutterBottom
            >
              Certificate Errors
            </Typography>

            {errorGroups.length === 0 ? (
              <Typography>No error data available.</Typography>
            ) : (
              errorGroups.map((group, index) => (
                <Accordion key={index} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: "bold",
                        color: severityColorMap[group.ErrorSeverity] || "black",
                      }}
                    >
                      Severity: {group.ErrorSeverity}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ul style={{ paddingLeft: "1.5rem" }}>
                      {group.Errors.split(" | ").map((err, idx) => (
                        <li key={idx}>
                          <Typography variant="body2">{err}</Typography>
                        </li>
                      ))}
                    </ul>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Box>
        </Modal>
      </Backdrop>

      {/* verify from blockchain
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Fetching Information from the Blockchain"}
        </DialogTitle>
        <DialogContent>
          {bcLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          ) : verifyData.message === "Success" ? (
            <>
              <Typography component="div">
                <Box sx={{ fontWeight: "medium", m: 1 }}>
                  <b>Serial No: </b>
                  {verifyData.serialNumber}{" "}
                </Box>
                <Box sx={{ fontWeight: "medium", m: 1 }}>
                  <b>Subject Name: </b>
                  {verifyData.subjectName}{" "}
                </Box>
                <Box sx={{ fontWeight: "medium", m: 1 }}>
                  <b>Issuer Serial No: </b>
                  {verifyData.issuerSerialNo}
                </Box>
                <Box sx={{ fontWeight: "medium", m: 1 }}>
                  <b>Issued Date: </b>
                  {verifyData.issuedDate}
                </Box>
                <Box sx={{ fontWeight: "medium", m: 1 }}>
                  <b>Pre-Certificate Issued Date: </b> Not available
                </Box>
                <Box sx={{ fontWeight: "medium", m: 1 }}>
                  <b>Pre-Certificate SCT: </b> Not available
                </Box>
              </Typography>
              <Alert severity="success">Verification Successful</Alert>
            </>
          ) : (
            <Alert severity="warning">
              Couldn't find the requested certificate in blockchain
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog> */}

      <div className="table-header">
        <button className="filter-button" onClick={handleFilters}>
          Filters
        </button>
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
            <TableRow>
              <TableCell
                sx={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  color: "white",
                  backgroundColor: "rgba(136,163,254)",
                  top: 0,
                  position: "sticky",
                  zIndex: 1,
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
                  backgroundColor: "rgba(136,163,254)",
                  top: 0,
                  position: "sticky",
                  zIndex: 1,
                }}
                sortDirection={orderBy === "SubjectName" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "SubjectName"}
                  direction={orderBy === "SubjectName" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "SubjectName")}
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
                  top: 0,
                  position: "sticky",
                  zIndex: 1,
                }}
                sortDirection={orderBy === "IssuerName" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "IssuerName"}
                  direction={orderBy === "IssuerName" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "IssuerName")}
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
                  backgroundColor: "rgba(136,163,254)",
                  top: 0,
                  position: "sticky",
                  zIndex: 1,
                }}
                sortDirection={orderBy === "IssueDate" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "IssueDate"}
                  direction={orderBy === "IssueDate" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "IssueDate")}
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
                  backgroundColor: "rgba(136,163,254)",
                  top: 0,
                  position: "sticky",
                  zIndex: 1,
                }}
                sortDirection={orderBy === "ExpiryDate" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "ExpiryDate"}
                  direction={orderBy === "ExpiryDate" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "ExpiryDate")}
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
                  backgroundColor: "rgba(136,163,254)",
                  top: 0,
                  position: "sticky",
                  zIndex: 1,
                }}
                sortDirection={orderBy === "State" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "State"}
                  direction={orderBy === "State" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "State")}
                >
                  State
                </TableSortLabel>
              </TableCell>
              {/* <TableCell
                align="left"
                sx={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  color: "white",
                  backgroundColor: "rgba(136,163,254)",
                  top: 0, 
                  position: "sticky", 
                  zIndex: 1, 
                }}
              >
                Region
              </TableCell>
              */}
              <TableCell
                align="left"
                sx={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  color: "white",
                  backgroundColor: "rgba(136,163,254)",
                  top: 0,
                  position: "sticky",
                  zIndex: 1,
                }}
                sortDirection={orderBy === "SubjectType" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "SubjectType"}
                  direction={orderBy === "SubjectType" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "SubjectType")}
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
                  backgroundColor: "rgba(136,163,254)",
                  top: 0,
                  position: "sticky",
                  zIndex: 1,
                }}
              >
                <TableSortLabel
                  active={orderBy === "errorCount"}
                  direction={orderBy === "errorCount" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "errorCount")}
                >
                  Errors
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
              sortedRows.map((row) => (
                <TableRow key={row.serialNo + row.issuer}>
                  <TableCell sx={{ padding: "16px" }}>{row.serialNo}</TableCell>
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
                    {row.expiryDate}
                  </TableCell>
                  <TableCell align="left" sx={{ padding: "16px" }}>
                    {row.state}
                  </TableCell>
                  {/* <TableCell align="left" sx={{ padding: "16px" }}>
                    {row.region}
                  </TableCell> */}
                  <TableCell align="left" sx={{ padding: "16px" }}>
                    {row.subjectType}
                  </TableCell>
                  <TableCell align="left" sx={{ padding: "16px" }}>
                    {row.errorCount >= 1 ? (
                      <div
                        className="action-row"
                        onClick={() => {
                          handleOpenErrorModal(row);
                        }}
                        style={{
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                        title="Click to view errors"
                      >
                        <ErrorOutlineIcon sx={{ color: "red" }} />
                        <Typography variant="body2" color="red">
                          {row.errorCount} Error{row.errorCount > 1 ? "s" : ""}
                        </Typography>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <ThumbUpOffAltOutlinedIcon sx={{ color: "green" }} />
                        <Typography variant="body2" color="green">
                          No Errors
                        </Typography>
                      </div>
                    )}
                  </TableCell>
                  {/* <TableCell align="left" sx={{ padding: "16px" }}>
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
                  </TableCell> */}
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
              onClick={() => handleDownloadReport(issuerData)}
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
