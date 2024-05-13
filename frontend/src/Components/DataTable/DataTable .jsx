import React, { useEffect, useRef } from "react";
import { Grid, h } from "gridjs"; //datagrid js
import "./DataTable.css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import download from "../../Images/download.png";
import verify from "../../Images/check-mark.png";
import exclamation from "../../Images/exclamation.png";
import { getIndianRegion,Issuers,IndianStates,IndianRegion } from "../../Data";


const DataTable = () => {

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
    server: {
      url: "http://localhost:8080/data",
      method: "POST",
      then: (data) =>
        data.map((ca) => [
          ca.cert_serial_no,
          ca.subject_name,
          ca.issuer_name,
          ca.issue_date,
          ca.subject_state,
          getIndianRegion( ca.subject_state),
          ca.expiry_date,
          "Status",
          null,
        ]),
    },
  });
  useEffect(() => {
    grid.render(wrapperRef.current);
  }, []);
  const handleMultiSelectChange = (selectedItems) => {
    console.log("Selected items:", selectedItems);
  };

  return (
    <div className="MainTable">
      <div className="filterWindow" id="filter">
        <span className="close" onClick={handleFilterClose}>
          X
        </span>
        <div className="multi-select-row">
          <MultiSelect
            options={Issuers}
            placeholder="Select Issuer"
            onChange={handleMultiSelectChange}
          />
          <MultiSelect options={IndianStates} placeholder="Select State" />
          <MultiSelect options={IndianRegion} placeholder="Select Region" />
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

export default DataTable;
