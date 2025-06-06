// Sidebar imports
import homeIcon from "./Images/Icons/home.png";
import checkIcon from "./Images/Icons/check.png";
import certIcon from "./Images/Icons/certificate.png";
import removeIcon from "./Images/Icons/remove.png";
import signIcon from "./Images/Icons/sign.png";
import userIcon from "./Images/Icons/user.png";
import uploadIcon from "./Images/Icons/upload.png";
import logIcon from "./Images/Icons/history.png";
import signoutIcon from "./Images/Icons/signout.png";
import userManagementIcon from "./Images/Icons/usermanagment.png";

// Recent Card Imports
import img1 from "./Images/cdac.png";
import img2 from "./Images/NSDL-eGov.jpg";
import img3 from "./Images/IDSign.png";

// Sidebar Data
export const SidebarData = [
  {
    icon: homeIcon,
    heading: "Dashboard",
    viewName: "home",  // added viewName
  },
  {
    icon: certIcon,
    heading: "Issued Certificates",
    viewName: "issuedCertificates",  // added viewName
  },
  {
    icon: removeIcon,
    heading: "Revoked Certificates",
    viewName: "revokedCertificates",  // added viewName
  },
  {
    icon: signIcon,
    heading: "DSC Usages",
    viewName: "dscUsages",  // added viewName
  },
  {
    icon: uploadIcon,
    heading: "Add Certificate",
    viewName: "addCertificate",  // added viewName
  },
  {
    icon: userIcon,
    heading: "Account",
    viewName: "account",  // added viewName
  },
  {
    icon: logIcon,
    heading: "Logs",
    viewName: "logs",  // added viewName
  },
  {
    icon: userManagementIcon,
    heading: 'Portal Management',
    viewName: 'portalManagement',  // added viewName
  },
  {
    icon: signoutIcon,
    heading: 'Signout',
    viewName: 'signout',  // added viewName
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
    // barValue: 60,
    // value: "25,970",
    png: checkIcon,
    // series: [
    //   {
    //     name: "CA",
    //     data: [31, 40, 28, 51, 42, 30],
    //   },
    // ],
    layoutId:"0",
  },
  {
    title: "Certificates Revoked",
    color: {
      backGround: "linear-gradient(180deg, #FF919D 0%, #FC929D 100%)",
      boxShadow: "0px 10px 20px 0px #FDC0C7",
    },
    // barValue: 80,
    // value: "14,270",
    png: removeIcon,
    // series: [
    //   {
    //     name: "Certificates",
    //     data: [10, 100, 50, 70, 80, 30, 40],
    //   },
    // ],
    layoutId:"1",
  },
  {
    title: "Certificates Used",
    color: {
      backGround:
        "linear-gradient(rgb(248, 212, 154) -146.42%, rgb(255 202 113) -46.42%)",
      boxShadow: "0px 10px 20px 0px #F9D59B",
    },
    // barValue: 60,
    // value: "4,270",
    png: signIcon,
    // series: [
    //   {
    //     name: "Transactions",
    //     data: [10, 25, 15, 30, 12, 15, 20],
    //   },
    // ],
    layoutId:"2",
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

 // from https://emudhra[dot]com/blog/certificate-revocation-list-crl
 export const revocationReasons = [
  { label: "Unspecified", value: "Unspecified" },
  { label: "Key compromise", value: "Key compromise" },
  { label: "CA Compromise", value: "CA Compromise" },
  { label: "Affiliation Changed", value: "Affiliation Changed" },
  { label: "Superseded", value: "Superseded" },
  { label: "Cessation of Operation", value: "Cessation of Operation" },
];

export const usageOptions = [
  { label: "Signing", value: "Signing" },
  { label: "Encryption", value: "Encryption" },
  { label: "Decryption", value: "Decryption" },
  { label: "other", value: "other" },
];
