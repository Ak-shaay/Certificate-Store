import React, { useEffect, useRef, useState } from "react";
import { Grid, h, PluginPosition } from "gridjs"; //datagrid js
import "./DataTable.css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import download from "../../Images/download.png";
import verify from "../../Images/check-mark.png";
import exclamation from "../../Images/exclamation.png";
import { getIndianRegion, IndianRegion, getStatesByRegions, subType } from "../../Data";
import { jsPDF } from "jspdf";
import api from "../../Pages/axiosInstance";

const DataTable = () => {
  // var today = (new Date()).toISOString().split('T')[0];
  const wrapperRef = useRef(null);
  const gridRef = useRef(null);
  const [issuer, setIssuer] = useState([]);
  const [subjectType, setSubjectType] = useState([]);
  const [state, setState] = useState([]);
  const [region, setRegion] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [validity, setValidity] = useState("");
  const [stateByRegion, setStateByRegion] = useState([]);
  const [authNumber, setAuthNumber] = useState("");
  const [authorities, setAuthorities] = useState();
  const [rawCertificate,setRawCertificate]= useState('')
  const [certificateFileName,setcertificateFileName]= useState('')

  const handleFilters = (e) => {
    const filtersElement = document.getElementById("filter");
    const blurFilter = document.getElementById("applyFilter");
    blurFilter.style.filter = "blur(3px)";
    blurFilter.style.pointerEvents = "none";
    filtersElement.style.display = "block";
  };

  const handleFilterClose = (e) => {
    const filtersElement = document.getElementById("filter");
    const blurFilter = document.getElementById("applyFilter");
    blurFilter.style.filter = "blur(0px)";
    blurFilter.style.pointerEvents = "auto";
    filtersElement.style.display = "none";
  };

  //download option
  const handleDownloadCert = (rawCertificate,filename) => {
    setRawCertificate(rawCertificate)
    setcertificateFileName(filename)
    const filtersElement = document.getElementById("download");
    const blurFilter = document.getElementById("applyFilter");
    blurFilter.style.filter = "blur(3px)";
    blurFilter.style.pointerEvents = "none";
    filtersElement.style.display = "block";
  };

  const handleDownloadCertClose = (e) => {
    const filtersElement = document.getElementById("download");
    const blurFilter = document.getElementById("applyFilter");
    blurFilter.style.filter = "blur(0px)";
    blurFilter.style.pointerEvents = "auto";
    filtersElement.style.display = "none";
  };
  const handleCertDownload = (e) => {
    const link = document.createElement("a");
         const file = new Blob([rawCertificate], { type: 'text/plain' });
         link.href = URL.createObjectURL(file);
         link.download = certificateFileName+".cer";
         link.click();
         URL.revokeObjectURL(link.href);
  };

  useEffect(() => {
    const fetchIssuer = async () => {
      try {
        const accessToken = api.getAccessToken();
        api.setAuthHeader(accessToken);
        const response = await api.axiosInstance.post("/authorities");
        if (response.data) {
          // console.log("response:",response.data);
          setAuthorities(response.data);
        }
      } catch (err) {
        console.error("error : ", err);
      }
    };
    fetchIssuer();
  }, []);

  async function handleDownload(issuedData) {
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "landscape"; // portrait or landscape

    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(10);

    const title = "Issuer Certificates";
    const headers = [
      [
        "Serial No",
        "Name",
        "Issuer",
        "Date",
        "State",
        "Region",
        "Validity",
        "Subject Type",
      ],
    ];
    let transformedData = [];
    issuedData.forEach((entry) => {
      let cert_serial_no = entry[0];
      let subject_name = entry[1];
      let issuer_name = entry[2];
      let issue_date = entry[3];
      let subject_state = entry[4];
      // region logic
      let expiry_date = entry[6];
      let subject_Type = entry[7];

      // Creating object in desired format
      let transformedObject = {
        cert_serial_no: cert_serial_no,
        subject_name: subject_name,
        subject_state: subject_state,
        issuer_name: issuer_name,
        issue_date: issue_date,
        expiry_date: expiry_date,
        subject_Type:subject_Type,
      };
      transformedData.push(transformedObject);
    });

    const data = transformedData.map((ca) => [
      ca.cert_serial_no,
      ca.subject_name,
      ca.issuer_name,
      ca.issue_date,
      ca.subject_state,
      getIndianRegion(ca.subject_state),
      ca.expiry_date,
      ca.subject_Type,
    ]);

    let content = {
      startY: 50,
      head: headers,
      body: data,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
    };

    doc.text(title, marginLeft, 40);
    await doc.autoTable(content);
    doc.save("Certificates_report.pdf");
  }
  const applyFilter = (e) => {
    e.preventDefault();
    fetchData();
    handleFilterClose();
  };

  const fetchData = async () => {
    const filterData = {
      issuer: issuer,
      subjectType:subjectType,
      state: state,
      region: region,
      startDate: startDate,
      endDate: endDate,
      validity: validity,
    };
    try {
      const accessToken = api.getAccessToken();
      const decodedToken = accessToken
        ? JSON.parse(atob(accessToken.split(".")[1]))
        : null;
      const authNo = decodedToken ? decodedToken.authNo : [];
      const username = decodedToken ? decodedToken.username : [];
      setAuthNumber(authNo);

      if (accessToken) {
        api.setAuthHeader(accessToken);
        const response = await api.axiosInstance.post(
          "/data",
          JSON.stringify(filterData)
        );
        if (response.data) {
          const data = await response.data;
          gridRef.current.updateConfig({
            data: data.map((cert) => [
              cert.SerialNumber,
              cert.Subject_CommonName,
              cert.IssuerCommonName,
              cert.IssueDate,
              cert.Subject_ST,
              getIndianRegion(cert.Subject_ST),
              cert.ExpiryDate,
              cert.subject_Type,
              cert.RawCertificate
              // "Status"
            ]),
          });
          gridRef.current.forceRender();
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    gridRef.current = new Grid({
      columns: [
        "Serial No",
        "Name",
        "Issuer",
        "Date",
        "State",
        "Region",
        "Validity",
        "Subject Type",
        {
          name: "Actions",
          formatter: (cell, row) => {
            return h("div", { className: "action-row" }, [
              h(
                "div",
                {
                  className: "",
                  onClick: () =>
                    alert(`view "${row.cells[0].data}" "${row.cells[1].data}"`),
                },
                [
                  h("img", {
                    src: exclamation,
                    alt: "View",
                    className: "action-img",
                    title: "View",
                  }),
                ]
              ),
              h(
                "div",
                {
                  className: "",
                  onClick: () =>
                    handleDownloadCert(row.cells[8].data, row.cells[0].data+"_"+row.cells[1].data)
                },
                [
                  h("img", {
                    src: download,
                    alt: "Download",
                    className: "action-img",
                    title: "Download",
                  }),
                ]
              ),
              h(
                "div",
                {
                  className: "",
                  onClick: () =>
                    alert(
                      `Verify "${row.cells[0].data}" "${row.cells[1].data}"`
                    ),
                },
                [
                  h("img", {
                    src: verify,
                    alt: "Verifying",
                    className: "action-img",
                    title: "Verify",
                  }),
                ]
              ),
            ]);
          },
        },
      ],
      data: [],
      pagination: true,
      sort: true,
      search: true,
      style: {
        th: {
          backgroundColor: "rgb(132 168 255 / 70%)",
          color: "white",
          textAlign: "center",
        },
        td: {
          borderRight: "none",
          borderLeft: "none",
        },
      },
      plugins: [
        {
          id: "downloadPlugin",
          component: () =>
            h(
              "button",
              {
                className: "download-btn",
                onClick: () => handleDownload(gridRef.current.config.data),
              },
              "Download Report"
            ),
          position: PluginPosition.Footer,
        },
        {
          id: "titlePlugin",
          component: () =>
            h(
              "h1",
              {
                className: "title-btn",
              },
              "Issued Certificate"
            ),
          position: PluginPosition.Header,
        },
        {
          id: "filterPlugin",
          component: () =>
            h(
              "button",
              {
                className: "filter-btn",
                onClick: () => handleFilters(),
              },
              "Filters"
            ),
          position: PluginPosition.Header,
        },
      ],
    });

    fetchData();
    gridRef.current.render(wrapperRef.current);

    return () => {
      gridRef.current.destroy();
    };
  }, []);

  const handleIssuerFilter = (selectedItems) => {
    setIssuer(selectedItems.map((item) => item.value));
  };
  const handleSubTypeFilter = (selectedItems) => {
    setSubjectType(selectedItems.map((item) => item.value));
  };
  const handleStateFilter = (selectedItems) => {
    setState(selectedItems.map((item) => item.value));
  };
  const handleRegionFilter = (selectedItems) => {
    setRegion(selectedItems.map((item) => item.value));
    setStateByRegion(getStatesByRegions(region));
  };

  useEffect(() => {
    setStateByRegion(getStatesByRegions(region));
  }, [region]);
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };
  const handleValidity = (e) => {
    setValidity(e.target.value);
  };

  return (
    <div className="MainTable">
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
            />
          ) : (
            <></>
          )}
          <MultiSelect
          options={subType}
          onChange={handleSubTypeFilter}
            placeholder="Subject Type"
          />
          <MultiSelect
            options={IndianRegion}
            onChange={handleRegionFilter}
            placeholder="Select Region"
          />
          <MultiSelect
            options={stateByRegion}
            onChange={handleStateFilter}
            placeholder="Select State"
          />
        </div>
        <div className="col">
          <div className="row date_picker">
            <label className="dateLable">Start Date</label>
            <input
              type="date"
              className="datepicker"
              onChange={handleStartDateChange}
            />
            <label className="dateLable">End Date</label>
            <input
              type="date"
              className="datepicker"
              disabled={startDate === "" }
              onChange={handleEndDateChange}
            />
          </div>

          <div className="row date_picker">
            <label className="dateLable">Validity </label>
            <input
             disabled={startDate === ""}
              type="number"
              className="datepicker"
              step="1"
              min="0"
              max="5"
              onChange={handleValidity}
            />
            <label className="dateLable">Year(s)</label>
          </div>
          <br />
          <hr />
          <div className="filter-row">
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
      <div className="" id="download">
        <span className="close" onClick={handleDownloadCertClose}>
          X
        </span>
        <h2 className="filter-head">Download</h2>
        <hr className="filter-line" />
          <textarea className="text-area" rows="20" cols="40" disabled={true} value={rawCertificate} ></textarea>
          <button className="commonApply-btn" onClick={handleCertDownload}>Download</button>
        </div>
      <div className="table-container" id="applyFilter" ref={wrapperRef}></div>
    </div>
  );
};

export default DataTable;
