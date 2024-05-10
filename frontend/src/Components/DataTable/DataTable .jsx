import React, { useEffect, useRef } from "react";
import { Grid, h } from "gridjs"; //datagrid js
import "./DataTable.css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import download from "../../Images/download.png";
import verify from "../../Images/check-mark.png";
import exclamation from "../../Images/exclamation.png";


const DataTable = () => {

  function getIndianRegion(state) {
    const regions = {
        'Andhra Pradesh': 'South',
        'Arunachal Pradesh': 'Northeast',
        'Assam': 'Northeast',
        'Bihar': 'East',
        'Chhattisgarh': 'Central',
        'Goa': 'West',
        'Gujarat': 'West',
        'Haryana': 'North',
        'Himachal Pradesh': 'North',
        'Jharkhand': 'East',
        'Karnataka': 'South',
        'Kerala': 'South',
        'Madhya Pradesh': 'Central',
        'Maharashtra': 'West',
        'Manipur': 'Northeast',
        'Meghalaya': 'Northeast',
        'Mizoram': 'Northeast',
        'Nagaland': 'Northeast',
        'Odisha': 'East',
        'Punjab': 'North',
        'Rajasthan': 'West',
        'Sikkim': 'Northeast',
        'Tamil Nadu': 'South',
        'Telangana': 'South',
        'Tripura': 'Northeast',
        'Uttar Pradesh': 'North',
        'Uttarakhand': 'North',
        'West Bengal': 'East',
        'Andaman and Nicobar Islands': 'South',
        'Chandigarh': 'North',
        'Dadra and Nagar Haveli': 'West',
        'Daman and Diu': 'West',
        'Delhi': 'North',
        'Lakshadweep': 'South',
        'Puducherry': 'South',
        'AP': 'South',
        'AR': 'Northeast',
        'AS': 'Northeast',
        'BR': 'East',
        'CG': 'Central',
        'GA': 'West',
        'GJ': 'West',
        'HR': 'North',
        'HP': 'North',
        'JH': 'East',
        'KA': 'South',
        'KL': 'South',
        'MP': 'Central',
        'MH': 'West',
        'MN': 'Northeast',
        'ML': 'Northeast',
        'MZ': 'Northeast',
        'NL': 'Northeast',
        'OD': 'East',
        'PB': 'North',
        'RJ': 'West',
        'SK': 'Northeast',
        'TN': 'South',
        'TS': 'South',
        'TR': 'Northeast',
        'UP': 'North',
        'UK': 'North',
        'WB': 'East',
        'AN': 'South',
        'CH': 'North',
        'DN': 'West',
        'DD': 'West',
        'DL': 'North',
        'LD': 'South',
        'PY': 'South'
    };
    
    return regions[state] || 'Unknown';
}

const handleFilters = (e) => {
  const filtersElement = document.getElementById('filter');
      filtersElement.style.display = 'block';
}

const handleFilterClose = (e) => {
  const filtersElement = document.getElementById('filter');
      filtersElement.style.display = 'none';
}
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
          getIndianRegion( ca.subject_state),
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
      <div className="filterWindow" id="filter">
        <span className="close" onClick={handleFilterClose}>X</span>
        <div className="multi-select-row">
      <MultiSelect
          options={options}
          placeholder="Select Issuer"
          onChange={handleMultiSelectChange}
        />
        <MultiSelect options={options} placeholder="Select State" />
        <MultiSelect options={options} placeholder="Select Region" />
        <input type="date" class="datepicker"/>
        <input type="date" class="datepicker"/>
       <button className="apply-btn">Apply</button>
       </div>
      </div>
      <button class="filter-btn" onClick={handleFilters}>Filters</button>
      
      <div className="table-container" ref={wrapperRef} />
    </div>
  );
};

export default DataTable;
