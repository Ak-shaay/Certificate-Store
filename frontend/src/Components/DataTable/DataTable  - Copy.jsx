import React, { useEffect, useRef, useState } from "react";
import { Grid } from "gridjs"; //datagrid js
import "./DataTable.css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";

const DataTable = () => {
  const wrapperRef = useRef(null);

  const grid = new Grid({
    pagination: {
      enabled: true,
      limit: 8,
    },
    sort: true,
    // search: {
    //   server: {
    //     url: (prev, keyword) => `${prev}?search=${keyword}`
    //   }
    // },
    search: true,
    columns: [
      "Name",
      "Issuer",
      "Date",
      "State",
      "Region",
      "Country",
      "Validity",
    ],
    server: {
      url: "http://localhost/data",
      method: "POST",
      then: (data) =>
        data.results.map((ca) => [
          ca.name,
          ca.issuer,
          ca.date,
          ca.state,
          ca.region,
          ca.country,
          ca.validity,
        ]),
    },
  });
  useEffect(() => {
    grid.render(wrapperRef.current);
  }, []);

  const options = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" }
  ];
  const handleMultiSelectChange = (selectedItems) => {
    console.log("Selected items:", selectedItems);
  };

  return (
    <div className="MainTable">
       <div className="multi-select-row">
        <MultiSelect options={options} placeholder="Select CA" onChange={handleMultiSelectChange} />
        <MultiSelect options={options} placeholder="Select Issuer" />
        <MultiSelect options={options} placeholder="Select State" />
        <MultiSelect options={options} placeholder="Select Region" />
        <MultiSelect options={options} placeholder="Select Country" />
      </div>
      <div className="table-container" ref={wrapperRef} />
    </div>
  );
};

export default DataTable;
