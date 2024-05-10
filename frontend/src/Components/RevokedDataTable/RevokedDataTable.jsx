import React, { useEffect, useRef } from "react";
import { Grid } from "gridjs"; //datagrid js
import "./RevokedDataTable.css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";

const RevokedDataTable = () => {
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
      "Revokation Date",
      "Reason",
    ],
    server: {
      url: "http://localhost:8080/revokedData",
      method: "POST",
      then: (data) =>
        data.map((rev) => [
          rev.serial_number,
          rev.revoke_date_time,
          rev.reason
          
        ]
        ),
    },
  });
  useEffect(() => {
    grid.render(wrapperRef.current);
    
  }, []);

  const options = [
    { label: "Certificate compromised", value: "Certificate compromised" },
    { label: "Key compromised", value: "Key compromised" },
    { label: "Other", value: "other" },
  ];
  const handleMultiSelectChange = (selectedItems) => {
    console.log("Selected items:", selectedItems);
  };

  return (
    <div className="MainTableRevoked">
      <div className="multi-select-row">
      <MultiSelect
          options={options}
          placeholder="Select Reason"
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

export default RevokedDataTable;
