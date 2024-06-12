import React, { useEffect, useRef } from "react";
import { Grid, h,PluginPosition } from "gridjs"; //datagrid js
import "./UsageDataTable .css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import { domain } from "../../Context/config";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const UsageDataTable = () => {
  let usageData = '';
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

    const title = "Usage of Certificates";
    const headers = [
      [
     "Serial No", "Used On", "Remark", "Count"
      ],
    ];

    const data = usageData.map((use) => [
      use.serial_number,
          use.time_stamp,
          use.remark,
          use.count,
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
    doc.save("Usage_of_Certificates_report.pdf");
  }
  const wrapperRef = useRef(null);

  function DownloadButtonPlugin() {
    return h(
      "button",
      { className: `download-btn`, onClick: handleDownload },
      "Download Report"
    );
  }
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
      then: (data) =>{
        usageData=data;
        return data.map((use) => [
          use.serial_number,
          use.time_stamp,
          use.remark,
          use.count,
        ]);
      },
    },
    style: {
      th: {
        'background-color': 'rgb(132 168 255 / 70%)',
        color: 'white',
        'text-align': 'center'
      },
      td:{
        'border-right': 'none',
        'border-left': 'none',
      }
    }
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
        <h2 className="filter-head">Filter</h2>
        <hr className="filter-line"/>
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

export default UsageDataTable;
