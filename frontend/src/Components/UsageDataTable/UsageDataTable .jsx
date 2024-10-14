import React, { useEffect, useState,useRef } from "react";
import { Grid, h,PluginPosition } from "gridjs"; //datagrid js
import "./UsageDataTable .css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import api from "../../Pages/axiosInstance";
import { usageOptions } from "../../Data";

const UsageDataTable = () => {
  const wrapperRef = useRef(null);
  const gridRef = useRef(null);
  const [selectedUsage, setSelectedUsage] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleFilters = (e) => {
    const filtersElement = document.getElementById("filter");
    filtersElement.style.display = "block";
  };

  const handleFilterClose = (e) => {
    const filtersElement = document.getElementById("filter");
    filtersElement.style.display = "none";
  };

  async function handleDownload(usageData) {
    if(usageData.length<=0){
      alert("No data available for download!!")
      return null
    }
    const title = "Usage of Certificates";
    const headers = [
      [
     "Serial No","Subject Name","Issuer Name", "Used On", "Remark",// "Count"
      ],
    ];

    let data = [];
    usageData.forEach(entry => {
    const serial_number = entry[0];
    const IssuerCommonName = entry[1];
    const commonName = entry[2]
    const time_stamp = entry[3];
    const remark = entry[4];
    // const count = entry[5];


    // Creating object in desired format
    let transformedObject = {
      serial_number: serial_number,
        issuer_name:IssuerCommonName,
        commonName: commonName,
        time_stamp: time_stamp,
        remark: remark,
        // count: count,
    };
    data.push(transformedObject);
});

try{
  const accessToken = api.getAccessToken();
    api.setAuthHeader(accessToken);
    const response = await api.axiosInstance.post("/report",{data,title,headers});
    if(response.data){
      alert("An email has been sent to your registered mail address. Please check your inbox. This may take a few minutes")
    }}
    catch (error) {
    console.error(error);
   alert("No response from the server. Please try again later.");
  }
  }

  const applyFilter = (e) => {
    e.preventDefault();
    fetchData();
    handleFilterClose();
  };

  const fetchData = async() => {
    const filterData = {
      usage:selectedUsage,
      startDate: startDate,
      endDate: endDate
    };

    try{
      const accessToken = api.getAccessToken();
      api.setAuthHeader(accessToken);
      const response = await api.axiosInstance.post("/usageData", JSON.stringify(filterData));
      if(response.data){
        const data= await response.data;
        gridRef.current.updateConfig({
          data: data.map((use)=>[
            use.serial_number,
            use.subject_common_name,
            use.IssuerCommonName,
            use.time_stamp,
            use.remark,
            // use.count
          ])
        })
        gridRef.current.forceRender();
      }
    }
    catch(err){
      console.error("Error fetching data: ", err);
    }
  };

  useEffect(() => {
    gridRef.current = new Grid({
      columns: ["Serial No", "Subject Name","Issuer Name","Used On", "Remark"],
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
          textAlign: 'center'
        },
      },
      plugins: [
        {
          id: "downloadPlugin",
          component: () =>
            h("button", { className: "download-btn", onClick:()=> handleDownload(gridRef.current.config.data) }, "Download Report"),
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
        //       "Certificate Usage"
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

  const usageRef = useRef();


  const handleClearAll = () => {
    if (usageRef.current) usageRef.current.resetSelectedValues();
    setStartDate("");
    setEndDate("");
  };
  const handleUsageFilter = (selectedItems) => {
    setSelectedUsage(selectedItems.map(item => item.value));
    console.log(selectedUsage);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };
  return (
    <div className="MainTableUsage">
      <div className="filterWindow" id="filter">
        <span className="close" onClick={handleFilterClose}>
          X
        </span>
        <h2 className="filter-head">Filter</h2>
        <hr className="filter-line"/>
        <div className="multi-select-row">
          <MultiSelect
            options={usageOptions}
            placeholder="Select Usage"
            onChange={handleUsageFilter}
            ref={usageRef}
          />
          </div>
          <div className="col">
          <div className="row date_picker">
            <label className="dateLable">Start Date</label>
            <input type="date" onChange={handleStartDateChange} className="datepicker" value={startDate}/>
            <label className="dateLable">End Date</label>
            <input type="date" onChange={handleEndDateChange} className="datepicker" value={endDate}/>
          </div>
          <br/>
          <div className="filter-row">
          <button
              className="commonApply-btn clear"
              onClick={handleClearAll}
            >
              Clear
            </button>
          <button className="commonApply-btn cancel" onClick={handleFilterClose}>Cancel</button>
          <button className="commonApply-btn"  onClick={applyFilter}>Apply</button>
        </div>
        </div>
      </div>
      <h1>Certificate Usage</h1>
      <div className="table-container" ref={wrapperRef} />
    </div>
  );
};

export default UsageDataTable;
