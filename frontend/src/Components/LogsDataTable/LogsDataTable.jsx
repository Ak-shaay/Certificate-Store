import React, { useEffect, useRef } from "react";
import { Grid } from "gridjs"; //datagrid js
import "./LogsDataTable.css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";

const LogsDataTable = () => {
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
      "Timestamp",
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
         log.timestamp
          
        ]
        ),
    },
  });
  useEffect(() => {
    grid.render(wrapperRef.current);
    
  }, []);

  const options = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ];
  const handleMultiSelectChange = (selectedItems) => {
    console.log("Selected items:", selectedItems);
  };

  return (
    <div className="MainTableLogs">
      {/* <div className="multi-select-row">
        <MultiSelect
          options={options}
          placeholder="Select CA"
          onChange={handleMultiSelectChange}
        />
        <MultiSelect options={options} placeholder="Select Issuer" />
        <MultiSelect options={options} placeholder="Select State" />
        <MultiSelect options={options} placeholder="Select Region" />
        <MultiSelect options={options} placeholder="Select Country" />
        <input type="date" class="datepicker"/>
        <input type="date" class="datepicker"/>
        <button class="applybtn">Apply</button>
      </div> */}
      <div className="table-container" ref={wrapperRef} />
    </div>
  );
};

export default LogsDataTable;
