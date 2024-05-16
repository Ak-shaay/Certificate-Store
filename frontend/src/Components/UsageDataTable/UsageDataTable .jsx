import React, { useEffect, useRef } from "react";
import { Grid } from "gridjs"; //datagrid js
import "./UsageDataTable .css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import { domain } from "../../Context/config";

const UsageDataTable = () => {
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
    columns: ["Serial No", "Used On", "Remark", "Count"],
    server: {
      url: "http://"+domain+":8080/usageData",
      method: "POST",
      then: (data) =>
        data.map((use) => [
          use.serial_number,
          use.time_stamp,
          use.remark,
          use.count,
        ]),
    },
  });
  useEffect(() => {
    grid.render(wrapperRef.current);
  }, []);

  const options = [
    { label: "Signing", value: "Signing" },
    { label: "Encryption", value: "Encryption" },
    { label: "other", value: "other" },
  ];
  const handleMultiSelectChange = (selectedItems) => {
    console.log("Selected items:", selectedItems);
  };

  return (
    <div className="MainTableUsage">
      <div className="filterWindow" id="filter">
        <span className="close" onClick={handleFilterClose}>
          X
        </span>
        <div className="multi-select-row">
          <MultiSelect
            options={options}
            placeholder="Select Usage"
            onChange={handleMultiSelectChange}
          />
          </div>
          <div className="col">
          <div className="row date_picker">
            <label className="dateLable">Start Date</label>
            <input type="date" className="datepicker" />
            <label className="dateLable">End Date</label>
            <input type="date" className="datepicker" />
          </div>
          <br/>
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

export default UsageDataTable;
