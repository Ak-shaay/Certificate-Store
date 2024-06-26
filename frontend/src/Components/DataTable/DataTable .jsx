import React, { useEffect, useRef, useState } from "react";
import { Grid, h,PluginPosition } from "gridjs"; //datagrid js
import "./DataTable.css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import download from "../../Images/download.png";
import verify from "../../Images/check-mark.png";
import exclamation from "../../Images/exclamation.png";
import { getIndianRegion,Issuers,IndianStates,IndianRegion } from "../../Data";
import { domain } from "../../Context/config";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";



const DataTable = () => {
  

  var today = (new Date()).toISOString().split('T')[0];
  const wrapperRef = useRef(null);
  const gridRef = useRef(null);
  const [issuer,setIssuer]=useState([])
  const [state,setState]=useState([])
  const [region,setRegion]=useState([])
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [validityStartDate, setValidityStartDate] = useState("");
  const [validityEndDate, setValidityEndDate] = useState("");

  const handleFilters = (e) => {
    const filtersElement = document.getElementById("filter");
    const blurFilter = document.getElementById("applyFilter")
    blurFilter.style.filter = "blur(3px)";
    blurFilter.style.pointerEvents="none";
    filtersElement.style.display = "block";
  };

  const handleFilterClose = (e) => {
    const filtersElement = document.getElementById("filter");
    const blurFilter = document.getElementById("applyFilter")
    blurFilter.style.filter = "blur(0px)";
    blurFilter.style.pointerEvents="auto";
    filtersElement.style.display = "none";
  };
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
      "Status",
      ],
    ];
    let transformedData = [];
    issuedData.forEach(entry => {
    let cert_serial_no = entry[0];
    let subject_name = entry[1];
    let issuer_name = entry[2];
    let issue_date = entry[3];
    let subject_state = entry[4];
    let expiry_date = entry[6];

    // Creating object in desired format
    let transformedObject = {
        "cert_serial_no": cert_serial_no,
        "subject_name": subject_name,
        "subject_state": subject_state,
        "issuer_name": issuer_name,
        "issue_date": issue_date,
        "expiry_date": expiry_date
    };
    transformedData.push(transformedObject);
});

    const data = transformedData.map((ca) => [
      ca.cert_serial_no,
      ca.subject_name,
      ca.issuer_name,
      ca.issue_date,
      ca.subject_state,
      getIndianRegion( ca.subject_state),
      ca.expiry_date,
      "Status",
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

  const fetchData = () => {
    const filterData = {
      issuer:issuer,
      state:state,
      region:region,
      startDate: startDate,
      endDate: endDate,
      validityStartDate: validityStartDate,
      validityEndDate: validityEndDate
    };
    fetch(`http://${domain}:8080/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(filterData)
    })
      .then(response => response.json())
      .then(data => {
        gridRef.current.updateConfig({
          data: data.map((ca) => [
          ca.cert_serial_no,
          ca.subject_name,
          ca.issuer_name,
          ca.issue_date,
          ca.subject_state,
          getIndianRegion( ca.subject_state),
          ca.expiry_date,
          "Status",
        ])
        });
        gridRef.current.forceRender();
      })
      .catch(error => console.error("Error fetching data:", error));
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
      "Status",
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
                  alert(
                    `download "${row.cells[0].data}" "${row.cells[1].data}"`
                  ),
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
                  alert(`Verify "${row.cells[0].data}" "${row.cells[1].data}"`),
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
            h("button", { className: "download-btn", onClick: ()=> handleDownload(gridRef.current.config.data) }, "Download Report"),
          position: PluginPosition.Footer,
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
    setIssuer(selectedItems.map(item=> item.value))
  };
  const handleStateFilter = (selectedItems) => {
    setState(selectedItems.map(item=> item.value))
  };
  const handleRegionFilter = (selectedItems) => {
    setRegion(selectedItems.map(item=> item.value))
  };
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };
  const handleValidityStartDateChange = (e) => {
    setValidityStartDate(e.target.value);
  };

  const handleValidityEndDateChange = (e) => {
    setValidityEndDate(e.target.value);
  };
  return (
    <div className="MainTable">
      <div className="filterWindow" id="filter">
        <span className="close" onClick={handleFilterClose}>
          X
        </span>
        <h2 className="filter-head">Filter</h2>
        <hr className="filter-line"/>
        <div className="multi-select-row">
          <MultiSelect
            options={Issuers}
            placeholder="Select Issuer"
            onChange={handleIssuerFilter}
          />
          <MultiSelect options={IndianStates} onChange={handleStateFilter} placeholder="Select State" />
          <MultiSelect options={IndianRegion} onChange={handleRegionFilter} placeholder="Select Region" />
          </div>
          <div className="col">
          <div className="row date_picker">
            <label className="dateLable">Start Date</label>
            <input type="date" className="datepicker" />
            <label className="dateLable">End Date</label>
            <input type="date" className="datepicker" />
          </div>
          <br/>
          <hr/>
          <div className="filter-row">
          <button className="commonApply-btn cancel" onClick={handleFilterClose}>Cancel</button>
          <button className="commonApply-btn" onClick={applyFilter}>Apply</button>
        </div>
        </div>
      </div>
      <div><button className="common-btn" onClick={handleFilters}>
        Filters
      </button></div>

      <div className="table-container" id="applyFilter" ref={wrapperRef} ></div>
    </div>
  );
};

export default DataTable;
