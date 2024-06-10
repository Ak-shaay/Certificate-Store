import React, { useEffect, useRef, useState } from "react";
import { Grid } from "gridjs"; //datagrid js
import "./RevokedDataTable.css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import { domain } from "../../Context/config";

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
    gridRef.current = new Grid({ // Assigning the grid instance to the ref
      pagination: {
        enabled: true,
        limit: 8,
      },
      sort: true,
      search: true,
      columns: [
        "Serial No",
        "Revokation Date",
        "Reason",
      ],
      data: [],
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
