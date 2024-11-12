import React, { useEffect, useRef } from "react";
import "./Users.css";
import { Grid, h } from "gridjs";
import api from "../../Pages/axiosInstance";

const Users = ({ onBack }) => {
  const wrapperRef = useRef(null);
  const gridRef = useRef(null);

  const fetchData = async () => {
    try {
      const accessToken = api.getAccessToken();
      api.setAuthHeader(accessToken);
      const response = await api.axiosInstance.post("/getAllUsers");

      if (response.data) {
        const data = response.data;

        // Update grid data configuration
        gridRef.current.updateConfig({
          data: data.map((item) => [
            item.UserEmail,
            item.Name,
            item.AuthName,
            item.Role,
            item.LoginStatus,
          ]),
        });

        // Force a re-render of the grid
        gridRef.current.forceRender();
      }
    } catch (err) {
      console.error("Error fetching data: ", err);
    }
  };

  useEffect(() => {
    gridRef.current = new Grid({
      columns: [
        { id: "Email", name: "Email", width: "150px" },
        { id: "Name", name: "Name", width: "150px" },
        { id: "Organization", name: "Organization", width: "150px" },
        { id: "Role", name: "Role", width: "150px" },
        { id: "Status", name: "Status", width: "100px" },
        {
          name: "Actions",
          width: "150px",
          formatter: (cell, row) => {
            const isActive = row.cells[4].data === "active";

            const handleAction = async (action, userId) => {
              const message =
                action === "enable"
                  ? `Are you sure you want to enable user  ${userId}?`
                  : `Are you sure you want to disable user ${userId}?`;

              const confirmed = window.confirm(message);
              if (confirmed) {
                try {
                  const accessToken = api.getAccessToken();
                  api.setAuthHeader(accessToken);
                  const response = await api.axiosInstance.post("/changeStatus", { userId, action });

                  if (response.status == 200) {
                    alert(
                      `Successfully updated status of ${userId}`
                    );

                    const updatedData = gridRef.current.config.data.map((row) => {
                      if (row[0] === userId) {
                        row[4] = action === "enable" ? "active" : "blocked";
                      }
                      return row;
                    });
                    // Update grid with modified data
                    gridRef.current.updateConfig({ data: updatedData });
                    gridRef.current.forceRender();
                  } else {
                    alert("Failed to perform the action.");
                  }
                } catch (error) {
                  alert("Error occurred while performing the action.");
                  console.error(error);
                }
              }
            };

            return h("div", { className: "actionRow" }, [
              !isActive &&
                h(
                  "button",
                  {
                    className: "actionButton1",
                    value: row.cells[0].data,
                    onClick: () => handleAction("enable", row.cells[0].data),
                  },
                  `Enable`
                ),
              isActive &&
                h(
                  "button",
                  {
                    className: "actionButton2",
                    value: row.cells[0].data,
                    onClick: () => handleAction("disable", row.cells[0].data),
                  },
                  `Disable`
                ),
            ]);
          },
        },
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
          textAlign: "center",
        },
      },
    });

    fetchData();
    gridRef.current.render(wrapperRef.current);

    return () => {
      gridRef.current.destroy();
    };
  }, []);

  return (
    <div className="usersBody">
      <div className="usersMain">
        <div className="backClass">
          <button onClick={onBack} className="backButton">
            Back
          </button>
        </div>
        <h2>Users</h2>
        <div className="userTableWrapper">
          <div ref={wrapperRef} />
        </div>
      </div>
    </div>
  );
};

export default Users;
