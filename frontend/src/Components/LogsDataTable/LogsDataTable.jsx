import React, { useEffect,useState, useRef } from "react";
import { Grid, h, PluginPosition } from "gridjs"; //datagrid js
import "./LogsDataTable.css";
import "gridjs/dist/theme/mermaid.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import api from "../../Pages/axiosInstance";

const LogsDataTable = () => {
  const [authorities, setAuthorities] = useState();
  const [selectedUser, setSelectedUser] = useState([]);
  const [selectedAction, setSelectedAction] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // const [authNumber, setAuthNumber] = useState("");
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
  if(logData.length<=0){
    alert("No data available for download!!")
    return null
  }
  const title = "Logs";
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
  let data = [];
  logData.forEach((entry) => {
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
    id:id,
    user_id :user_id,
    action :action,
    remark :remark,
    ip_address :ip_address,
    timestamp :timestamp,
    latitude:latitude,
    longitude:longitude,
  };
  data.push(transformedObject);
});

try{
  const accessToken = api.getAccessToken();
    api.setAuthHeader(accessToken);    
    const response = await api.axiosInstance.post("/report",{data,title,headers});
    if(response.data){
      // console.log(response.data); 
      alert("An email has been sent to your registered mail address. Please check your inbox.  This may take a few minutes")
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

  const fetchData = async () => {
    const filterData = {
      user:selectedUser,
      action:selectedAction,
      startDate: startDate,
      endDate: endDate

    };

    try {
      const accessToken = api.getAccessToken();
      // const decodedToken = accessToken
      //   ? JSON.parse(atob(accessToken.split(".")[1]))
      //   : null;
      // const authNo = decodedToken ? decodedToken.authNo : [];
      // setAuthNumber(authNo);

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
          log.LogsSrNo,
          log.UserEmail,
          log.ActionType,
          log.Remark,
          log.IpAddress,
          log.TimeStamp,
          log.Latitude,
          log.Longitude,
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
        { id: "Id", name: "Id", width: "200px" },
        { id: "UserId", name: "User Id", width: "200px" },
        { id: "Action", name: "Action", width: "200px" },
        { id: "Remark", name: "Remark", width: "350px" },
        { id: "IPAddress", name: "IP address", width: "200px" },
        { id: "Timestamp", name: "Timestamp", width: "200px" },
        { id: "Latitude", name: "Latitude", width: "200px" },
        { id: "Longitude", name: "Longitude", width: "200px" }
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
        // {
        //   id: "titlePlugin",
        //   component: () =>
        //     h(
        //       "h1",
        //       {
        //         className: "title-btn",
        //       },
        //       "Activity Logs"
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
      <h1>Activity Logs</h1>
      <div className="table-container" ref={wrapperRef} />
    </div>
  );
};

export default LogsDataTable;
