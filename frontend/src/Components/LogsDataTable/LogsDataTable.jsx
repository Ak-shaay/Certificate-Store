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
  const wrapperRef = useRef(null);

  function DownloadButtonPlugin() {
    return h(
      "button",
      { className: `download-btn`, onClick: handleDownload },
      "Download Logs"
    );
  }
  const grid = new Grid({
    pagination: {
      enabled: true,
      limit: 8,
    },
    sort: true,
    search: true,
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
    server: {
      url: "http://" + domain + ":8080/logs",
      method: "POST",
      then: (data) => {
        logData = data;
        return data.map((log) => [
          log.id,
          log.session_id,
          log.user_id,
          log.action,
          log.ip_address,
          log.timestamp,
          log.latitude,
          log.longitude,
        ]);
      },
    },
  });
  grid.plugin.add({
    id: "downloadPlugin",
    component: () => DownloadButtonPlugin(),
    position: PluginPosition.Footer,
  });
  useEffect(() => {
    grid.render(wrapperRef.current);
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
          <div className="row date_picker">
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
