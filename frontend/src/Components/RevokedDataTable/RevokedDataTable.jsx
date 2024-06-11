import React, { useEffect, useRef, useState } from "react";
import { Grid, h, PluginPosition } from "gridjs"; //datagrid js
import "./RevokedDataTable.css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import { domain } from "../../Context/config";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const RevokedDataTable = () => {
  let revocationData = '';
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const wrapperRef = useRef(null);
  const gridRef = useRef(null); // Ref to store the grid instance

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

    const title = "Issuer Certificates";
    const headers = [
      [
        "Serial No",
        "Revokation Date",
        "Reason",
      ],
    ];

    const data = revocationData.map((rev) => [
      rev.serial_number,
      rev.revoke_date_time,
      rev.reason,
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
    doc.save("Revocation_report.pdf");
  }

  const applyFilter = (e) => {
    e.preventDefault();
    fetchData();
    handleFilterClose();
  };

  const fetchData = () => {
    const filterData = {
      reasons: selectedReasons,
      startDate: startDate,
      endDate: endDate
    };

    fetch(`http://${domain}:8080/revokedData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(filterData)
    })
      .then(response => response.json())
      .then(data => {
        revocationData=data;
        gridRef.current.updateConfig({
          data: data.map(rev => [rev.serial_number, rev.revoke_date_time, rev.reason])
        });
        gridRef.current.forceRender();
      })
      .catch(error => console.error("Error fetching data:", error));
  };

  useEffect(() => {
    gridRef.current = new Grid({
      columns: ["Serial No", "Revokation Date", "Reason"],
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
    { label: "Cessation of use", value: "Cessation of use" },
    { label: "Key compromised", value: "Key compromised" },
    { label: "Other", value: "other" },
  ];

  const handleMultiSelectChange = (selectedItems) => {
    setSelectedReasons(selectedItems.map(item => item.value));
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };
  return (
    <div className="MainTableRevoked">
      <div className="filterWindow" id="filter">
        <span className="close" onClick={handleFilterClose}>
          X
        </span>
        <div className="multi-select-row">
          <MultiSelect
            options={options}
            placeholder="Select Reason"
            onChange={handleMultiSelectChange}
          />
        </div>
        <div className="col">
          <div className="row date_picker">
            <label className="dateLable">Start Date</label>
            <input type="date" className="datepicker" onChange={handleStartDateChange} />
            <label className="dateLable">End Date</label>
            <input type="date" className="datepicker" onChange={handleEndDateChange} />
          </div>
          <br />
          <div className="row date_picker">
            <button className="commonApply-btn" onClick={applyFilter}>Apply</button>
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

export default RevokedDataTable;
