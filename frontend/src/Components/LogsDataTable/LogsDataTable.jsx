import React, { useEffect,useState, useRef } from "react";
import { Grid, h, PluginPosition } from "gridjs"; //datagrid js
import "./LogsDataTable.css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";
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
  const [authNumber, setAuthNumber] = useState("");
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
  useEffect(() => {
    const fetchIssuer = async () => {
      try {
        const accessToken = api.getAccessToken();
        const decodedToken = accessToken
        ? JSON.parse(atob(accessToken.split(".")[1]))
        : null;
      const authNo = decodedToken ? decodedToken.authNo : [];
        api.setAuthHeader(accessToken);
        const response = await api.axiosInstance.post("/authorities");
        if (response.data) {
          if(authNo==null){
          response.data.push({ label: "CCA", value: "CCA" })
          response.data.push({ label: "Admin", value: "admin" })
          }
          if(authNo==1){
            response.data.push({ label: "CCA", value: "CCA" })
            }
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
        "User Id",
        "Action",
        "Remarks",
        "IP address",
        "Timestamp",
        "Latitude",
        "Longitude",
      ],
    ];
    let transformedData = [];
    logData.forEach(entry => {
    let id = entry[0];
    let user_id = entry[1];
    let action = entry[2];
    let remark = entry[3];
    let ip_address = entry[4];
    let timestamp = entry[5];
    let latitude = entry[6];
    let longitude = entry[7];

    // Creating object in desired format
    let transformedObject = {
        "id": id,
        // "session_id": session_id,
        "user_id": user_id,
        "action": action,
        "remark":remark,
        "ip_address": ip_address,
        "timestamp": timestamp,
        "latitude": latitude,
        "longitude": longitude,

    };
    transformedData.push(transformedObject);
});

    const data = transformedData.map((log) => [
      log.id,
      log.user_id,
      log.action,
      log.remark,
      log.ip_address,
      formatDate(log.timestamp),
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

  const fetchData = async () => {
    const filterData = {
      user:selectedUser,
      action:selectedAction,
      startDate: startDate,
      endDate: endDate

    };

    try {
      const accessToken = api.getAccessToken();
      const decodedToken = accessToken
        ? JSON.parse(atob(accessToken.split(".")[1]))
        : null;
      const authNo = decodedToken ? decodedToken.authNo : [];
      setAuthNumber(authNo);

      if (accessToken) {
        api.setAuthHeader(accessToken);
        const response = await api.axiosInstance.post(
          "/logs",
          JSON.stringify(filterData)
        );
        if (response.data) {
          const data = await response.data;          
          gridRef.current.updateConfig({
          data: data.map((log) => [
          log.id,
          log.user_id,
          log.action,
          log.Remark,
          log.ip_address,
          formatDate(log.timestamp),
          log.latitude,
          log.longitude,
        ]),
        });
        gridRef.current.forceRender();
      }
    }
  } catch (err) {
    console.error("Error fetching data:", err);
  }
};

 useEffect(() => {
    gridRef.current = new Grid({
      columns: [
      "Id",
      "User Id",
      "Action",
      "Remark",
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
          textAlign: 'center'
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

  const authRef = useRef();
  const actionRef = useRef();
  const handleClearAll = () => {
    if (authRef.current) authRef.current.resetSelectedValues();
    if (actionRef.current) actionRef.current.resetSelectedValues();
    setStartDate("");
    setEndDate("");
  };

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
            ref={authRef}
          />
          <MultiSelect options={options}  onChange={handleActtionFIlter} placeholder="Select Action" ref={actionRef}/>
        </div>
        <div className="col">
          <div className="row date_picker">
            <label className="dateLable">Start Date</label>
            <input type="date" onChange={handleStartDateChange} className="datepicker" value={startDate} />
            <label className="dateLable">End Date</label>
            <input type="date" onChange={handleEndDateChange} className="datepicker" value={endDate} />
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
            <button className="commonApply-btn"  onClick={applyFilter} >Apply</button>
          </div>
        </div>
      </div>
      <div className="table-container" ref={wrapperRef} />
    </div>
  );
};

export default LogsDataTable;
