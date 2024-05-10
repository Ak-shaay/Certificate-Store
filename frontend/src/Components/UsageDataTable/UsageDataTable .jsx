import React, { useEffect, useRef } from "react";
import { Grid } from "gridjs"; //datagrid js
import "./UsageDataTable .css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";

const UsageDataTable  = () => {
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
      "Used On",
      "Remark",
      "Count"
    ],
    server: {
      url: "http://localhost:8080/usageData",
      method: "POST",
      then: (data) =>
        data.map((use) => [
          use.serial_number,
          use.time_stamp,
          use.remark,
          use.count,
          
        ]
        ),
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
      <div className="multi-select-row">
      <MultiSelect
          options={options}
          placeholder="Select Usage"
          onChange={handleMultiSelectChange}
        />
        <input type="date" class="datepicker"/>
        <input type="date" class="datepicker"/>
        <button class="applybtn">Apply</button>
      </div>
      <div className="table-container" ref={wrapperRef} />
    </div>
  );
};

export default UsageDataTable ;
