import React, { useEffect, useRef, useState } from "react";
import { Grid, h, PluginPosition } from "gridjs"; //datagrid js
import "./RevokedDataTable.css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";
// import { revocationReasons } from "../../Data";
import { jsPDF } from "jspdf";
import api from "../../Pages/axiosInstance";
import { autoTable } from "jspdf-autotable";
import { domain } from "../../Context/config";


const RevokedDataTable = () => {
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const wrapperRef = useRef(null);
  const gridRef = useRef(null); // Ref to store the grid instance

  const [revocationReasons,setRevocationReasons] = useState([]);

  useEffect(() => {
    fetch(`http://${domain}:8080/getAllRevocationReasons`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); 
      })
      .then(data => setRevocationReasons(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);
  
  const handleFilters = (e) => {
    const filtersElement = document.getElementById("filter");
    filtersElement.style.display = "block";
  };

  const handleFilterClose = (e) => {
    const filtersElement = document.getElementById("filter");
    filtersElement.style.display = "none";
  };

  function formatDate(isoDate) {
    const date = new Date(isoDate);

    const dateOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    const formattedDate = date.toLocaleDateString("en-GB", dateOptions);
    const formattedTime = date.toLocaleTimeString("en-GB", timeOptions);

    const formattedDateTime = `${formattedDate} ${formattedTime}`;

    return formattedDateTime;
  }
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
        "Issuer",
        "Revokation Date",
        "Reason",
      ],
    ];

    let transformedData = [];
    revocationData.forEach(entry => {
    const serial_number = entry[0];
    const issuer = entry[1];
    const revoke_date_time = entry[2];
    const reason = entry[3];

    // Creating object in desired format
    let transformedObject = {
        "serial_number": serial_number,
        "issuer":issuer,
        "revoke_date_time": revoke_date_time,
        "reason": reason,
        
    };
    transformedData.push(transformedObject);
});
    const data = transformedData.map((rev) => [
      rev.serial_number,
      rev.issuer,
      formatDate(rev.revoke_date_time),
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

  const fetchData = async () => {
    const filterData = {
      reasons: selectedReasons,
      startDate: startDate,
      endDate: endDate
    };
    try{
      const accessToken = api.getAccessToken();
      api.setAuthHeader(accessToken);
      const response = await api.axiosInstance.post("/revokedData", JSON.stringify(filterData));
      if(response.data){
        const data = await response.data;
        gridRef.current.updateConfig({
          data:data.map((params)=>[
            params.serial_number, params.IssuerCommonName, formatDate(params.revoke_date_time), params.reason
          ])
        });
        gridRef.current.forceRender();
      }
    }
    catch(err){
      console.error("Error fetching data: ", err);
    }

  };

  useEffect(() => {
    gridRef.current = new Grid({
      columns: ["Serial No","Issuer", "Revokation Date", "Reason"],
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
          textAlign: 'center'
        },
      },
      plugins: [
        {
          id: "downloadPlugin",
          component: () =>
            h("button", { className: "download-btn", onClick: ()=>handleDownload(gridRef.current.config.data) }, "Download Report"),
          position: PluginPosition.Footer,
        },
        // {
        //   id: "titlePlugin",
        //   component: () =>
        //     h(
        //       "h1",
        //       {
        //         className: "title-btn",
        //       },
        //       "Revoked Certificate"
        //     ),
        //   position: PluginPosition.Header,
        // },
        {
          id: "filterPlugin",
          component: () =>
            h(
              "button",
              {
                className: "filter-btn",
                onClick: () => handleFilters(),
              },
              "Filters"
            ),
          position: PluginPosition.Header,
        },
      ],
    });

    fetchData();
    gridRef.current.render(wrapperRef.current);

    return () => {
      gridRef.current.destroy();
    };
  }, []);

  const reasonsRef = useRef();
  const handleClearAll = () => {
    if (reasonsRef.current) reasonsRef.current.resetSelectedValues();
    setStartDate("");
    setEndDate("");
  };

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
            ref={reasonsRef}
          />
        </div>
        <div className="col">
          <div className="row date_picker">
            <label className="dateLable">Start Date</label>
            <input type="date" className="datepicker" onChange={handleStartDateChange} value={startDate}/>
            <label className="dateLable">End Date</label>
            <input type="date" className="datepicker" onChange={handleEndDateChange} value={endDate}/>
          </div>
          <br />
          <div className="filter-row">
          <button
              className="commonApply-btn clear"
              onClick={handleClearAll}
            >
              Clear
            </button>
          <button className="commonApply-btn cancel" onClick={handleFilterClose}>Cancel</button>
            <button className="commonApply-btn" onClick={applyFilter}>Apply</button>
          </div>
        </div>
      </div>

<h1>Revoked Certificate</h1>
      <div className="table-container" ref={wrapperRef} />
    </div>
  );
};

export default RevokedDataTable;
