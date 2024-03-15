import React, { useState } from "react";
import Sidebar from "../Components/Sidebar/Sidebar";
import MainDash from "../Components/MainDash/MainDash";
import RightSide from "../Components/RigtSide/RightSide";
import UploadCertificate from "../Components/UploadCertificate/UploadCertificate";
import DataTable from "../Components/DataTable/DataTable ";
import Account from "../Components/Account/Account";
import RightSideAccount from "../Components/RightSideAccount/RightSideAccount";

function Dashboard() {
  const [index, setIndex] = useState(0); //index value is used for sidebar navigation

  //handle index change
  const handleIndexChange = (newIndex) => {
    setIndex(newIndex);
  };

  // Use a switch statement outside the JSX
  let content;
  switch (index) {
    case 0:
      content = (
        <div className="appglass">
          <Sidebar onIndexChange={handleIndexChange} />
          <MainDash />
          <RightSide />
        </div>
      );
      break;
    case 1:
      content = (
        <div className="appglass">
          <Sidebar onIndexChange={handleIndexChange} />
          <DataTable />
          {/* <RightSide /> */}
        </div>
      );
      break;
    case 2:
      content = (
        <div className="appglass">
          <Sidebar onIndexChange={handleIndexChange} />
          <DataTable />
          {/* <RightSide /> */}
        </div>
      );
      break;
    case 3:
      content = (
        <div className="appglass">
          <Sidebar onIndexChange={handleIndexChange} />
          <DataTable />
          {/* <RightSide /> */}
        </div>
      );
      break;
    case 4:
      content = (
        <div className="appglass">
          <Sidebar onIndexChange={handleIndexChange} />
          <UploadCertificate />
          {/* <RightSide /> */}
        </div>
      );
      break;
    case 5:
      content = (
        <div className="appglass">
          <Sidebar onIndexChange={handleIndexChange} />
          <Account />
          <RightSideAccount />
        </div>
      );
      break;
    default:
      content = (
        <div className="appglass">
          <Sidebar onIndexChange={handleIndexChange} />
          <>
            <h1>Nothing to see here !!!</h1>
          </>
          <RightSide />
        </div>
      );
  }

  return <>{content}</>;
}

export default Dashboard;
