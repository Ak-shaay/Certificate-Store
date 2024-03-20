import React, { useEffect, useRef } from "react";
import { Grid, h } from "gridjs"; //datagrid js
import "./DataTable.css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import download from "../../Images/download.png";
import verify from "../../Images/check-mark.png";
import exclamation from "../../Images/exclamation.png";


const DataTable = () => {
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
      "Country",
      "Validity",
      "Status",
      {
        name: 'Actions',
        formatter: (cell, row) => {
            return h('div', {className:'action-row'}, [
                h('div', {
                    className: '',
                    onClick: () => alert(`view "${row.cells[0].data}" "${row.cells[1].data}"`)
                }, [
                    h('img', { src: exclamation, alt: 'View' ,className: 'action-img',title:'View'})
                ]),
                h('div', {
                    className: '',
                    onClick: () => alert(`download "${row.cells[0].data}" "${row.cells[1].data}"`)
                }, [
                    h('img', { src: download, alt: 'Download',className: 'action-img', title:'Download' })
                ]),
                h('div', {
                    className: '',
                    onClick: () => alert(`Verify "${row.cells[0].data}" "${row.cells[1].data}"`)
                }, [
                    h('img', { src: verify, alt: 'Verifying' ,className: 'action-img', title:'Verify'})
                ])
            ]);
        }
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
          "region",
          "India",
          ca.expiry_date,
          "Status",
         null,
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
    <div className="MainTable">
      <div className="multi-select-row">
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
      </div>
      <div className="table-container" ref={wrapperRef} />
    </div>
  );
};

export default DataTable;
