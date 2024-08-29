import React, { useEffect,useState, useRef } from "react";
import { Grid, h, PluginPosition } from "gridjs"; //datagrid js
import "./LogsDataTable.css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import { domain } from "../../Context/config";
import { jsPDF } from "jspdf";
import api from "../../Pages/axiosInstance";
import { autoTable } from "jspdf-autotable";

const LogsDataTable = () => {
  let logData = "";
  const [authorities, setAuthorities] = useState();
  const [selectedUser, setSelectedUser] = useState([]);
  const [selectedAction, setSelectedAction] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const wrapperRef = useRef(null);
  const gridRef = useRef(null);

  const handleFilters = (e) => {
    const filtersElement = document.getElementById("filter");
    filtersElement.style.display = "block";
  };

  const handleFilterClose = (e) => {
    const filtersElement = document.getElementById("filter");
    filtersElement.style.display = "none";
  };
  useEffect(() => {
    const fetchIssuer = async () => {
      try {
        const accessToken = api.getAccessToken();
        api.setAuthHeader(accessToken);
        const response = await api.axiosInstance.post("/authorities");
        if (response.data) {
          response.data.push({ label: "CCA", value: "CCA" })
          response.data.push({ label: "Admin", value: "admin" })
          // console.log("issue:",response.data);
          setAuthorities(response.data);
        }
      } catch (err) {
        console.error("error : ", err);
      }
    };
    fetchIssuer();
  }, []);
  async function handleDownload(logData) {
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "landscape"; // portrait or landscape

    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(10);

    const title = "Report";
    const headers = [
      [
        "Id",
        "Session Id",
        "User Id",
        "Action",
        "IP address",
        "Timestamp",
        "Latitude",
        "Longitude",
      ],
    ];
    let transformedData = [];
    logData.forEach(entry => {
    let id = entry[0];
    let session_id = entry[1];
    let user_id = entry[2];
    let action = entry[3];
    let ip_address = entry[4];
    let timestamp = entry[6];
    let latitude = entry[7];
    let longitude = entry[8];

    // Creating object in desired format
    let transformedObject = {
        "id": id,
        "session_id": session_id,
        "user_id": user_id,
        "action": action,
        "ip_address": ip_address,
        "timestamp": timestamp,
        "latitude": latitude,
        "longitude": longitude,

    };
    transformedData.push(transformedObject);
});

    const data = transformedData.map((log) => [
      log.id,
      log.session_id,
      log.user_id,
      log.action,
      log.ip_address,
      log.timestamp,
      log.latitude,
      log.longitude,
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
    doc.save("report.pdf");
  }

  const applyFilter = (e) => {
    e.preventDefault();
    fetchData();
    handleFilterClose();
  };

  const fetchData = () => {
    const filterData = {
      user:selectedUser,
      action:selectedAction,
      startDate: startDate,
      endDate: endDate

    };

    fetch(`http://${domain}:8080/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(filterData)
    })
      .then(response => response.json())
      .then(data => {
        logData=data;
        gridRef.current.updateConfig({
          data: data.map((log) => [
          log.id,
          log.session_id,
          log.user_id,
          log.action,
          log.ip_address,
          log.timestamp,
          log.latitude,
          log.longitude,
        ]),
        });
        gridRef.current.forceRender();
      })
      .catch(error => console.error("Error fetching data:", error));
  };

 useEffect(() => {
    gridRef.current = new Grid({
      columns: [
      "Id",
      "Session Id",
      "User Id",
      "Action",
      "IP address",
      "Timestamp",
      "Latitude",
      "Longitude",
    ],
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
        },
      },
      plugins: [
        {
          id: "titlePlugin",
          component: () =>
            h(
              "h1",
              {
                className: "title-btn",
              },
              "Activity Logs"
            ),
          position: PluginPosition.Header,
        },
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
        {
          id: "downloadPlugin",
          component: () =>
            h("button", { className: "download-btn", onClick:()=> handleDownload(gridRef.current.config.data) }, "Download Report"),
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


  const options = [
    { label: "Login", value: "Login" },
    { label: "Logout", value: "Logout" },
    { label: "Other", value: "Other" },
  ];
  const handleUserFilter = (selectedItems) => {
    setSelectedUser(selectedItems.map(item => item.value));
  };
  const handleActtionFIlter = (selectedItems) => {
    setSelectedAction(selectedItems.map(item => item.value));
  };
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  return (
    <div className="MainTableLogs">
      <div className="filterWindow" id="filter">
        <span className="close" onClick={handleFilterClose}>
          X
        </span>
        <h2 className="filter-head">Filter</h2>
        <hr className="filter-line"/>
        <div className="multi-select-row">
          <MultiSelect
            options={authorities}
            placeholder="Select User"
            onChange={handleUserFilter}
          />
          <MultiSelect options={options}  onChange={handleActtionFIlter} placeholder="Select Action" />
        </div>
        <div className="col">
          <div className="row date_picker">
            <label className="dateLable">Start Date</label>
            <input type="date" onChange={handleStartDateChange} className="datepicker" />
            <label className="dateLable">End Date</label>
            <input type="date" onChange={handleEndDateChange} className="datepicker" />
          </div>
          <br />
          <div className="filter-row">
          <button className="commonApply-btn cancel" onClick={handleFilterClose}>Cancel</button>
            <button className="commonApply-btn"  onClick={applyFilter} >Apply</button>
          </div>
        </div>
      </div>
      <div className="table-container" ref={wrapperRef} />
    </div>
  );
};

export default LogsDataTable;
