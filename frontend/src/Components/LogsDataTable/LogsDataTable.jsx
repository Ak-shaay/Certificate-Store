import React, { useEffect, useRef } from "react";
import { Grid, h, PluginPosition } from "gridjs"; //datagrid js
import "./LogsDataTable.css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import { Issuers } from "../../Data";
import { domain } from "../../Context/config";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const LogsDataTable = () => {
  let logData = "";
  const wrapperRef = useRef(null);
  const gridRef = useRef(null);

  const handleFilters = (e) => {
    const filtersElement = document.getElementById("filter");
    filtersElement.style.display = "block";
  };

  const handleFilterClose = (e) => {
    const filtersElement = document.getElementById("filter");
    filtersElement.style.display = "none";
  };

  async function handleDownload(e) {
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "landscape"; // portrait or landscape

    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(10);

    const title = "Report";
    const headers = [
      [
        "Id",
        "Session Id",
        "User Id",
        "Action",
        "IP address",
        "Timestamp",
        "Latitude",
        "Longitude",
      ],
    ];

    const data = logData.map((log) => [
      log.id,
      log.session_id,
      log.user_id,
      log.action,
      log.ip_address,
      log.timestamp,
      log.latitude,
      log.longitude,
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
    doc.save("report.pdf");
  }

  const fetchData = () => {
    const filterData = {
    };

    fetch(`http://${domain}:8080/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(filterData)
    })
      .then(response => response.json())
      .then(data => {
        logData=data;
        gridRef.current.updateConfig({
          data: data.map((log) => [
          log.id,
          log.session_id,
          log.user_id,
          log.action,
          log.ip_address,
          log.timestamp,
          log.latitude,
          log.longitude,
        ]),
        });
        gridRef.current.forceRender();
      })
      .catch(error => console.error("Error fetching data:", error));
  };

 useEffect(() => {
    gridRef.current = new Grid({
      columns: [
      "Id",
      "Session Id",
      "User Id",
      "Action",
      "IP address",
      "Timestamp",
      "Latitude",
      "Longitude",
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
            h("button", { className: "download-btn", onClick: handleDownload }, "Download Report"),
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


  const options = [
    { label: "Login", value: "Login" },
    { label: "Logout", value: "Logout" },
    { label: "Other", value: "Other" },
  ];
  const handleMultiSelectChange = (selectedItems) => {
    console.log("Selected items:", selectedItems);
  };

  return (
    <div className="MainTableLogs">
      <div className="filterWindow" id="filter">
        <span className="close" onClick={handleFilterClose}>
          X
        </span>
        <h2 className="filter-head">Filter</h2>
        <hr className="filter-line"/>
        <div className="multi-select-row">
          <MultiSelect
            options={Issuers}
            placeholder="Select User"
            onChange={handleMultiSelectChange}
          />
          <MultiSelect options={options} placeholder="Select Action" />
        </div>
        <div className="col">
          <div className="row date_picker">
            <label className="dateLable">Start Date</label>
            <input type="date" className="datepicker" />
            <label className="dateLable">End Date</label>
            <input type="date" className="datepicker" />
          </div>
          <br />
          <div className="filter-row">
          <button className="commonApply-btn cancel" onClick={handleFilterClose}>Cancel</button>
            <button className="commonApply-btn">Apply</button>
          </div>
        </div>
      </div>
      <button className="common-btn" onClick={handleFilters}>
        Filters
      </button>
      <div className="table-container" ref={wrapperRef} />
    </div>
  );
};

export default LogsDataTable;
