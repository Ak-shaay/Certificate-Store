// Sidebar imports
import {
  UilEstate,
  UilUsersAlt,
  UilPackage,
  UilSignOutAlt,
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
    icon: UilPackage,
    heading: "Logs",
  },
  {
    icon: UilUsersAlt,
    heading: "Change Password",
  },
  {
    icon: UilSignOutAlt,
    heading: 'Signout',
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

//Region Data of Indian states

export function getIndianRegion(state) {
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


export const Issuers = [
  { label: "CCA", value: "CCA" },
  { label: "Safescrypt", value: "Safescrypt" },
  { label: "IDRBT", value: "IDRBT" },
  { label: "(n)Code Solutions", value: "(n)Code Solutions" },
  { label: "e-Mudhra", value: "e-Mudhra" },
  { label: "CDAC", value: "CDAC" },
  { label: "Capricorn", value: "Capricorn" },
  { label: "Protean (NSDL e-Gov)", value: "Protean (NSDL e-Gov)" },
  { label: "Vsign (Verasys)", value: "Vsign (Verasys)" },
  { label: "Indian Air Force", value: "Indian Air Force" },
  { label: "CSC", value: "CSC" },
  { label: "RISL (RajComp)", value: "RISL (RajComp)" },
  { label: "Indian Army", value: "Indian Army" },
  { label: "IDSign", value: "IDSign" },
  { label: "CDSL Ventures", value: "CDSL Ventures" },
  { label: "Panta Sign", value: "Panta Sign" },
  { label: "xtra Trust", value: "xtra Trust" },
  { label: "Indian Navy", value: "Indian Navy" },
  { label: "ProDigiSign", value: "ProDigiSign" },
  { label: "SignX", value: "SignX" },
  { label: "JPSL", value: "JPSL" },
  { label: "Care 4 Sign", value: "Care 4 Sign" },
  { label: "IGCAR", value: "IGCAR" }
];

export const IndianStates = [
  { label: "Andaman and Nicobar Islands", value: "Andaman and Nicobar Islands" },
  { label: "Andhra Pradesh", value: "Andhra Pradesh" },
  { label: "Arunachal Pradesh", value: "Arunachal Pradesh" },
  { label: "Assam", value: "Assam" },
  { label: "Bihar", value: "Bihar" },
  { label: "Chandigarh", value: "Chandigarh" },
  { label: "Chhattisgarh", value: "Chhattisgarh" },
  { label: "Dadra and Nagar Haveli and Daman and Diu", value: "Dadra and Nagar Haveli and Daman and Diu" },
  { label: "Delhi", value: "Delhi" },
  { label: "Goa", value: "Goa" },
  { label: "Gujarat", value: "Gujarat" },
  { label: "Haryana", value: "Haryana" },
  { label: "Himachal Pradesh", value: "Himachal Pradesh" },
  { label: "Jammu and Kashmir", value: "Jammu and Kashmir" },
  { label: "Jharkhand", value: "Jharkhand" },
  { label: "Karnataka", value: "Karnataka" },
  { label: "Kerala", value: "Kerala" },
  { label: "Ladakh", value: "Ladakh" },
  { label: "Lakshadweep", value: "Lakshadweep" },
  { label: "Madhya Pradesh", value: "Madhya Pradesh" },
  { label: "Maharashtra", value: "Maharashtra" },
  { label: "Manipur", value: "Manipur" },
  { label: "Meghalaya", value: "Meghalaya" },
  { label: "Mizoram", value: "Mizoram" },
  { label: "Nagaland", value: "Nagaland" },
  { label: "Odisha", value: "Odisha" },
  { label: "Puducherry", value: "Puducherry" },
  { label: "Punjab", value: "Punjab" },
  { label: "Rajasthan", value: "Rajasthan" },
  { label: "Sikkim", value: "Sikkim" },
  { label: "Tamil Nadu", value: "Tamil Nadu" },
  { label: "Telangana", value: "Telangana" },
  { label: "Tripura", value: "Tripura" },
  { label: "Uttar Pradesh", value: "Uttar Pradesh" },
  { label: "Uttarakhand", value: "Uttarakhand" },
  { label: "West Bengal", value: "West Bengal" }
];

export const IndianRegion = [
  { label: "South" ,value: "South" },
  { label: "East" ,value: "East" },
  { label: "West" ,value: "West" },
  { label: "North" ,value: "North" },
  { label: "Northeast" ,value: "Northeast" },
  { label: "Central" ,value: "Central" },
]