// Sidebar imports
import {
  UilEstate,
  UilClipboardAlt,
  UilUsersAlt,
  UilPackage,
  UilSignOutAlt,
  UilFileCheckAlt,
  UilTransaction, 
  UilFilesLandscapes,
  UilHome,
} from "@iconscout/react-unicons";

// Recent Card Imports
import img1 from "./Images/cdaclogoRound.png";
import img2 from "./Images/NSDL-eGov.jpg";
import img3 from "./Images/IDSign.png";

// Sidebar Data
export const SidebarData = [
  {
    icon: UilEstate,
    heading: "Dashboard",
  },
  {
    icon: UilPackage,
    heading: "Issued Certificates",
  },
  {
    icon: UilPackage,
    heading: "Revoked Certificates",
  },
  {
    icon: UilPackage,
    heading: "DSC Usages",
  },
  {
    icon: UilPackage,
    heading: "Add Your Certificate",
  },
  {
    icon: UilUsersAlt,
    heading: "Account",
  },
  {
    icon: UilSignOutAlt,
    heading: 'Signout'
  },
];

// Analytics Cards Data
export const cardsData = [
  {
    title: "Certificates Issued",
    color: {
      backGround: "linear-gradient(180deg, #2980B9 0%, #7FB3D5 100%)",
      boxShadow: "0px 10px 20px 0px #acd2ec",
    },
    barValue: 60,
    value: "25,970",
    png: UilHome,
    series: [
      {
        name: "CA",
        data: [31, 40, 28, 51, 42, 109],
      },
    ],
  },
  {
    title: "Certificates Revoked",
    color: {
      backGround: "linear-gradient(180deg, #FF919D 0%, #FC929D 100%)",
      boxShadow: "0px 10px 20px 0px #FDC0C7",
    },
    barValue: 80,
    value: "14,270",
    png: UilFilesLandscapes,
    series: [
      {
        name: "Certificates",
        data: [10, 100, 50, 70, 80, 30, 40],
      },
    ],
  },
  {
    title: "Certificates Expired",
    color: {
      backGround:
        "linear-gradient(rgb(248, 212, 154) -146.42%, rgb(255 202 113) -46.42%)",
      boxShadow: "0px 10px 20px 0px #F9D59B",
    },
    barValue: 60,
    value: "4,270",
    png: UilTransaction,
    series: [
      {
        name: "Transactions",
        data: [10, 25, 15, 30, 12, 15, 20],
      },
    ],
  },
];

// Recent Update Card Data
export const UpdatesData = [
  {
    img: img1,
    name: "CDAC",
    noti: "is now a certified CA.",
    time: "25 seconds ago",
  },
  {
    img: img2,
    name: "NSDL-eGov",
    noti: "is now a certified CA.",
    time: "30 minutes ago",
  },
  {
    img: img3,
    name: "ID-Sign",
    noti: "is now a certified CA.",
    time: "2 hours ago",
  },
];
