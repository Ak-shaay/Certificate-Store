import React, { useEffect, useRef, useState } from "react";
import { Grid, h, PluginPosition } from "gridjs"; //datagrid js
import "./RevokedDataTable.css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import { domain } from "../../Context/config";
import { revocationReasons } from "../../Data";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const RevokedDataTable = () => {
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

  async function handleDownload(revocationData) {
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

    let transformedData = [];
    revocationData.forEach(entry => {
    let serial_number = entry[0];
    let revoke_date_time = entry[1];
    let reason = entry[2];

    // Creating object in desired format
    let transformedObject = {
        "serial_number": serial_number,
        "revoke_date_time": revoke_date_time,
        "reason": reason,
        
    };
    transformedData.push(transformedObject);
});
    const data = transformedData.map((rev) => [
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
        table: {
          'font-size': '1.1em'
        },
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
            h("button", { className: "download-btn", onClick: ()=>handleDownload(gridRef.current.config.data) }, "Download Report"),
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
        <h2 className="filter-head">Filter</h2>
        <hr className="filter-line"/>
        <div className="multi-select-row">
          <MultiSelect
            options={revocationReasons}
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
          <div className="filter-row">
          <button className="commonApply-btn cancel" onClick={handleFilterClose}>Cancel</button>
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
