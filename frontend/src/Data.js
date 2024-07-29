// Sidebar imports
import homeIcon from "./Images/Icons/home.png"
import certIcon from "./Images/Icons/certificate.png"
import removeIcon from "./Images/Icons/remove.png"
import signIcon from "./Images/Icons/sign.png"
import userIcon from "./Images/Icons/user.png"
import uploadIcon from "./Images/Icons/upload.png"
import logIcon from "./Images/Icons/history.png"
import signoutIcon from "./Images/Icons/signout.png"
import expiredtIcon from "./Images/Icons/expired.png"

// Recent Card Imports
import img1 from "./Images/cdaclogoRound.png";
import img2 from "./Images/NSDL-eGov.jpg";
import img3 from "./Images/IDSign.png";

// Sidebar Data
export const SidebarData = [
  {
    icon: homeIcon,
    heading: "Dashboard",
  },
  {
    icon: certIcon,
    heading: "Issued Certificates",
  },
  {
    icon: removeIcon,
    heading: "Revoked Certificates",
  },
  {
    icon: signIcon,
    heading: "DSC Usages",
  },
  {
    icon: uploadIcon,
    heading: "Add Your Certificate",
  },
  {
    icon: userIcon,
    heading: "Account",
  },
  {
    icon: logIcon,
    heading: "Logs",
  },
  {
    icon: signoutIcon,
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
    png: homeIcon,
    series: [
      {
        name: "CA",
        data: [31, 40, 28, 51, 42, 109],
      },
    ],
    layoutId:"1",
  },
  {
    title: "Certificates Revoked",
    color: {
      backGround: "linear-gradient(180deg, #FF919D 0%, #FC929D 100%)",
      boxShadow: "0px 10px 20px 0px #FDC0C7",
    },
    barValue: 80,
    value: "14,270",
    png: removeIcon,
    series: [
      {
        name: "Certificates",
        data: [10, 100, 50, 70, 80, 30, 40],
      },
    ],
    layoutId:"2",
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
    png: expiredtIcon,
    series: [
      {
        name: "Transactions",
        data: [10, 25, 15, 30, 12, 15, 20],
      },
    ],
    layoutId:"3",
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
      'Jammu and Kashmir':'North',
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
      'JK': 'North',
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


export const IndianRegion = [
  { label: "South" ,value: "South" },
  { label: "East" ,value: "East" },
  { label: "West" ,value: "West" },
  { label: "North" ,value: "North" },
  { label: "Northeast" ,value: "Northeast" },
  { label: "Central" ,value: "Central" },
]


export function getStatesByRegions(regions) {
  const allRegions = {
      "North": [
          { label: "Jammu and Kashmir", value: "JK" },
          { label: "Punjab", value: "PB" },
          { label: "Haryana", value: "HR" },
          { label: "Himachal Pradesh", value: "HP" },
          { label: "Uttarakhand", value: "UK" },
          { label: "Uttar Pradesh", value: "UP" },
          { label: "Chandigarh", value: "CH" },
          { label: "Delhi", value: "DL" }
      ],
      "South": [
          { label: "Andhra Pradesh", value: "AP" },
          { label: "Telangana", value: "TG" },
          { label: "Karnataka", value: "KA" },
          { label: "Kerala", value: "KL" },
          { label: "Tamil Nadu", value: "TN" },
          { label: "Puducherry", value: "PY" }
      ],
      "East": [
          { label: "West Bengal", value: "WB" },
          { label: "Odisha", value: "OD" },
          { label: "Bihar", value: "BR" },
          { label: "Jharkhand", value: "JH" }
      ],
      "West": [
          { label: "Goa", value: "GA" },
          { label: "Gujarat", value: "GJ" },
          { label: "Maharashtra", value: "MH" },
          { label: "Rajasthan", value: "RJ" }
      ],
      "Northeast": [
          { label: "Assam", value: "AS" },
          { label: "Arunachal Pradesh", value: "AR" },
          { label: "Manipur", value: "MN" },
          { label: "Meghalaya", value: "ML" },
          { label: "Mizoram", value: "MZ" },
          { label: "Nagaland", value: "NL" },
          { label: "Tripura", value: "TR" },
          { label: "Sikkim", value: "SK" }
      ],
      "Central": [
          { label: "Madhya Pradesh", value: "MP" },
          { label: "Chhattisgarh", value: "CG" }
      ]
  };

  let states = [];
//   let noState = [{
//     "label": "Please select a Region",
//     "value": ""
// }]

  regions.forEach(region => {
      if (allRegions[region]) {
          states = states.concat(allRegions[region]);
      }
  });

  return states;
  // if(states.length==0) return noState
  // else return states
}


 // from https://emudhra[dot]com/blog/certificate-revocation-list-crl
 export const revocationReasons = [
  { label: "Unspecified", value: "Unspecified" },
  { label: "Key compromise", value: "Key compromise" },
  { label: "CA Compromise", value: "CA Compromise" },
  { label: "Affiliation Changed", value: "Affiliation Changed" },
  { label: "Superseded", value: "Superseded" },
  { label: "Cessation of Operation", value: "Cessation of Operation" },
];
