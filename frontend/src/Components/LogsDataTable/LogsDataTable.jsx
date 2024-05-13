import React, { useEffect, useRef } from "react";
import { Grid } from "gridjs"; //datagrid js
import "./LogsDataTable.css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import {Issuers} from "../../Data";

const LogsDataTable = () => {
  const handleFilters = (e) => {
    const filtersElement = document.getElementById("filter");
    filtersElement.style.display = "block";
  };

  const handleFilterClose = (e) => {
    const filtersElement = document.getElementById("filter");
    filtersElement.style.display = "none";
  };
  const wrapperRef = useRef(null);

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
      url: "http://localhost:8080/logs",
      method: "POST",
      then: (data) =>
        data.map((log) => [
          log.id,
          log.session_id,
          log.user_id,
          log.action,
          log.ip_address,
          log.timestamp,
          log.latitude,
          log.longitude,
        ]),
    },
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
            <button className="apply-btn">Apply</button>
          </div>
        </div>
      </div>
      <button class="filter-btn" onClick={handleFilters}>
        Filters
      </button>
      <div className="table-container" ref={wrapperRef} />
    </div>
  );
};

export default LogsDataTable;
