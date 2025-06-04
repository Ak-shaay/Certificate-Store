const userModel = require("../models/userModel");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const forge = require("node-forge");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const TOKEN_FILE = "tokens.json";
const { jsPDF } = require("jspdf");
require("jspdf-autotable");
const { v4: uuidv4 } = require("uuid");
const jsrsasign = require("jsrsasign");
const { KJUR, pemtohex } = require("jsrsasign");
const moment = require("moment");
const axios = require("axios");

let refreshTokens = {};

if (fs.existsSync(TOKEN_FILE)) {
  refreshTokens = JSON.parse(fs.readFileSync(TOKEN_FILE));
}

const saveTokensToFile = () => {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(refreshTokens));
};

// Generate an access token
const generateAccessToken = (userName, name, role, authNo) => {
  // Include the necessary claims (payload) in the token
  const payload = {
    username: userName,
    name: name,
    role: role,
    authNo: authNo,
  };

  // Generate the token with an expiration time
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "6h",
  }); // Adjust the expiration time as needed
};

// Generate a refresh token
const generateRefreshToken = (userName, name, role, authNo) => {
  // Include the necessary claims (payload) in the token
  const payload = {
    username: userName,
    name: name,
    role: role,
    authNo: authNo,
  };

  // Generate the token
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  }); // Consider adding an expiration time

  // Store the refresh token securely
  refreshTokens[userName] = refreshToken;
  saveTokensToFile();

  return refreshToken;
};

// helper function for changing time format
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
async function saveImage(bas64Img, filename) {
  const base64Data = bas64Img.replace(/^data:image\/\w+;base64,/, "");

  // Specify the file path where you want to save the image
  const filePath = "./public/images/" + filename + ".png";

  // Decode base64 and write the image to file
  fs.writeFile(filePath, base64Data, "base64", (err) => {
    if (err) {
      // console.log('Error saving the file:', err);
      return false;
    } else {
      // console.log('Image saved successfully!');
      return true;
    }
  });
}
async function signupController(req, res) {
  const {
    commonName,
    serialNo,
    email,
    organization,
    address,
    state,
    postalCode,
    base64Img,
  } = req.body;

  const existingUser = await userModel.findOrgByCN(commonName);
  if (existingUser.length > 0) {
    return res.status(500).json({ message: "Organization already exists" });
  }
  try {
    const authNo = await userModel.getNextSerial();
    const authCode = generateRandomString(20); //generate authcode
    const params = {
      commonName: commonName,
      authNo: authNo,
      authCode: authCode,
      serialNo: serialNo,
      email: email,
      organization: organization,
      address: address,
      state: state,
      postalCode: postalCode,
    };
    const result = await userModel.signup(params);
    const imgState = saveImage(base64Img, authNo);
    if (result && imgState) {
      return res.status(200).json({ message: "Signup successful" });
    } else return res.status(500).json({ message: "Signup unsuccessful" });
  } catch (err) {
    console.error("Error during signup: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// return role based on auth
function returnRole(auth) {
  switch (auth) {
    case null:
      return "Admin";
    case 1:
      return "CCA";
    default:
      return "CA";
  }
}

async function emailUser(email, password) {
  email.toLowerCase();
  const Sender = process.env.ID || "";
  const Secret = process.env.SECRET || "";
  try {
    var transporter = nodemailer.createTransport({
      host: "smtp.cdac.in",
      port: 587,
      // secure: true,
      auth: {
        user: Sender,
        pass: Secret,
      },
      timeout: 60000,
    });
    var mailOptions = {
      from: Sender,
      to: email,
      subject: "Account has been created successfully",
      text: `Dear Sir/Ma'am,
      We are pleased to inform you that your account has been successfully created.

      You can now access your account and start using our services. Please use the temporary password : ${password} 
      
      for login If you have any questions or need assistance, please feel free to reach out to our support team.

      We look forward to serving you!
      
      Thank you and regards,  
      Admin Team
      Certificate Store`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Error :", error.message);
      }
    });
  } catch (error) {
    console.error("Error Sending Email:", error.message);
  }
}
async function signupUserController(req, res) {
  const { name, email, password, organisation } = req.body;

  // Check if user already exists
  const existingUser = await userModel.findUserByUsername(email);
  if (existingUser.length > 0) {
    return res.status(409).json({ message: "User already exists" });
  }

  // Validate email format
  const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Validate password format
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;
  if (!passwordPattern.test(password)) {
    return res.status(400).json({ message: "Invalid password format" });
  }

  try {
    // Get the authnumber based on the organisation
    const authNumber = await userModel.getAuthNo(organisation);

    // Return the role based on the auth number
    const role = returnRole(authNumber);
    const hashedPassword = await bcrypt.hash(password, 10);

    const params = {
      name,
      password: hashedPassword,
      role,
      email,
      authNo: authNumber,
    };

    const result = await userModel.signupUser(params);
    if (result) {
      await emailUser(email, password);
      return res.status(200).json({ message: "User created successful" });
    } else {
      return res
        .status(400)
        .json({ message: "Account creation failed, please try again." });
    }
  } catch (err) {
    console.error("Error during account Creation:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
// Toggle user login  (enable/disable)
async function enableAccount(req, res) {
  try {
    const { userId, action } = req.body;

    const status = action === "enable" ? "active" : "blocked";

    const result = await userModel.toggleLoginAction(userId, status);

    if (result) {
      return res.json({ message: "Account status changed successfully" });
    } else {
      return res.status(400).json({
        message:
          "Failed to update the account status. It may already be in the desired state.",
      });
    }
  } catch (error) {
    console.error("Error occurred while enabling/disabling account:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// // update the user status
// async function loginAttempt(userExist) {
//   if (userExist.LoginStatus == "inactive") {
//     // const currentTime = new Date();
//     const timeDifferenceMs = currentISTime - userExist.LastAttempt;
//     const timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60); // 1000 milliseconds * 60 seconds * 60 minutes

//     // Check if the time difference is greater than 24 hours
//     if (timeDifferenceHours > 24) {
//       //updates the database
//       await userModel.updateStatus(
//         userExist.UserEmail,
//         "active",
//         2,
//         currentISTime()
//       );
//       return true;
//     } else {
//       // console.log("The time difference is not greater than 24 hours.");
//       return false;
//     }
//   } else {
//     return true;
//   }
// }

// async function login(req, res) {
//   const { username, password, latitude, longitude } = req.body;
//   try {
//     const userExist = await userModel.findUserByUsername(username);
//     if (!userExist.length) {
//       return res.status(400).json({ error: "User does not exist" });
//     }

//     const user = userExist[0];
//     if (user.LoginStatus === "blocked") {
//       return res.status(403).json({ error: "Your account is blocked" });
//     }

//     const storedHashedPassword = user.Password;
//     const passwordMatch = await bcrypt.compare(password, storedHashedPassword);

//     if (passwordMatch && (await loginAttempt(user))) {
//       // Successful login
//       const accessToken = generateAccessToken(
//         user.UserEmail,
//         user.Name,
//         user.Role,
//         user.AuthNo
//       );
//       const refreshToken = generateRefreshToken(
//         user.UserEmail,
//         user.Name,
//         user.Role,
//         user.AuthNo
//       );

//       req.session.username = user.UserEmail;
//       req.session.name = user.Name;
//       req.session.userid = user.AuthNo;
//       req.session.userRole = user.Role;

//       if (user.LoginStatus == "temporary" && user.Attempts > 0) {
//         await userModel.logUserAction(
//           username,
//           req.ip,
//           "Login",
//           "Logged In Using Temporary Password",
//           latitude,
//           longitude
//         );
//         await userModel.updateStatus(
//           user.UserEmail,
//           "tempLogin",
//           0,
//           currentISTime()
//         );
//         return res.json({ accessToken, refreshToken });
//       }

//       if (user.LoginStatus == "inactive") {
//         return res.status(423).json({ timeStamp: user.LastAttempt });
//       }

//       await userModel.logUserAction(
//         user.UserEmail,
//         req.ip,
//         "Login",
//         "Logged In",
//         latitude,
//         longitude
//       );
//       await userModel.updateAttempts(user.UserEmail, 2);
//       return res.json({ accessToken, refreshToken });
//     } else {
//       // Failed login attempt
//       if (user.Attempts > 0) {
//         let attempt = (user.Attempts -= 1);
//         await userModel.updateAttempts(user.UserEmail, attempt);
//       } else {
//         await userModel.updateStatus(
//           user.UserEmail,
//           "inactive",
//           0,
//           currentISTime()
//         );
//         return res
//           .status(423)
//           .json({ timeStamp: formatDate(user.LastAttempt) });
//       }
//       return res.status(401).json({ error: "Incorrect credentials" });
//     }
//   } catch (err) {
//     console.error("Error occurred:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }
async function loginAttempt(userExist) {
  if (userExist.LoginStatus === "inactive") {
    const now = new Date();
    const lastAttempt = new Date(userExist.LastAttempt);
    if (isNaN(lastAttempt)) {
      console.error("Error: LastAttempt is not a valid date");
      return false;
    }

    const timeDifferenceHours = (now - lastAttempt) / (1000 * 60 * 60);

    if (timeDifferenceHours >= 24) {
      // Ensure the database update is successful
      const updateResult = await userModel.updateStatus(
        userExist.UserEmail,
        "active",
        2,
        now
      );

      if (updateResult.affectedRows > 0) {
        // console.log("User successfully reactivated.");
        return true;
      } else {
        // console.error("Error: Database update failed.");
        return false;
      }
    } else {
      // console.log("User still inactive (less than 24 hours).");
      return false;
    }
  }
  return true;
}

async function login(req, res) {
  const { username, password, latitude, longitude } = req.body;

  try {
    const userExist = await userModel.findUserByUsername(username);
    if (!userExist.length) {
      return res.status(202).json({ message: "User does not exist" });
    }

    let user = userExist[0];

    if (user.LoginStatus === "blocked") {
      return res
        .status(202)
        .json({
          message:
            "Your account has been blocked. Please contact the administrator.",
        });
    }

    const passwordMatch = await bcrypt.compare(password, user.Password);

    if (passwordMatch) {
      const canLogin = await loginAttempt(user);

      if (!canLogin) {
        // console.log("Login not allowed. User still inactive.");
        return res
          .status(202)
          .json({ timestamp: formatDate(user.LastAttempt) });
      }
      const updatedUserList = await userModel.findUserByUsername(username);
      if (!updatedUserList.length) {
        console.error("Error: User not found after update!");
        return res
          .status(500)
          .json({ error: "User data could not be refreshed" });
      }
      user = updatedUserList[0]; // Update user object

      // console.log("Updated user status:", user.LoginStatus); // Debug log
      // Generate tokens and start session
      const accessToken = generateAccessToken(
        user.UserEmail,
        user.Name,
        user.Role,
        user.AuthNo
      );
      const refreshToken = generateRefreshToken(
        user.UserEmail,
        user.Name,
        user.Role,
        user.AuthNo
      );

      req.session.username = user.UserEmail;
      req.session.name = user.Name;
      req.session.userid = user.AuthNo;
      req.session.userRole = user.Role;

      await userModel.logUserAction(
        user.UserEmail,
        req.ip,
        "Login",
        "Logged In",
        latitude,
        longitude
      );
      await userModel.updateAttempts(user.UserEmail, 2);

      return res.json({ accessToken, refreshToken });
    } else {
      if (user.Attempts > 0) {
        const newAttempts = user.Attempts - 1;
        await userModel.updateAttempts(user.UserEmail, newAttempts);
      } else {
        await userModel.updateStatus(user.UserEmail, "inactive", 0, new Date());
        return res
          .status(202)
          .json({ timestamp: formatDate(user.LastAttempt) });
      }
      return res.status(202).json({ message: "Incorrect credentials" });
    }
  } catch (err) {
    console.error("Error occurred:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function dashboard(req, res, next) {
  if (!req.session && !req.session.username) {
    return res.sendStatus(401);
  } else {
    if (req.session.views) {
      req.session.views++;
      res.send(`You have visited this page ${req.session.views} times`);
    } else {
      req.session.views = 1;
      res.send(
        "Welcome to the session demo. Refresh the page to increment the visit count."
      );
    }
    return res.status(200);
  }
}

async function landingPage(req, res) {
  res.render("login");
}
async function userDetails(req, res) {
  const sessionId = req.sessionID;
  if (req.session.username) {
    const username = req.session.username;
    try {
      const userExist = await userModel.findUserByUsername(username);
      if (userExist.length) {
        return res.send(userExist);
      } else {
        return res.send({ message: "User details not found." });
      }
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.redirect("/");
  }
}

async function userSessionInfo(req, res) {
  res.json({
    username: req.session.username,
    id: req.session.userid,
    role: req.session.userRole,
  });
}

async function certificateUpload(req, res) {
  let certPem;
  let certInfoList = [];

  // Check if base64Cert is provided in the request body
  if (!req.body.base64Cert) {
    return res.status(400).json({ error: "No certificate provided" });
  }

  try {
    // Decode the base64 certificate PEM
    certPem = Buffer.from(req.body.base64Cert, "base64").toString("utf-8");
  } catch (error) {
    console.error("Error processing base64 certificate:", error);
    return res.status(400).json({ error: "Invalid base64 certificate format" });
  }

  try {
    // Split the PEM into individual certificates
    const pemCertificates = certPem
      .split(/(?=-----BEGIN CERTIFICATE-----)/g)
      .map((cert) => cert.trim())
      .filter((cert) => cert); // Remove any empty certificates

    // Parse each certificate
    for (const cert of pemCertificates) {
      const certInfo = await parseCertificate(cert);
      if (certInfo) certInfoList.push(certInfo);
    }

    // Handle cases where no valid certificates are found
    if (certInfoList.length === 0) {
      return res.status(400).json({ error: "No valid certificates found" });
    }

    // Process certificates based on subject type
    const firstCert = certInfoList[0];
    const certificateList = createCertSummaryList(certInfoList);

    // Business logic based on certificate type and relationships
    const response = await handleCertificateInsertion(
      certificateList,
      firstCert
    );
    return res.status(response.status).json(response.message);
  } catch (error) {
    console.error("Error processing certificates:", error);
    return res.status(500).json({ error: error.message });
  }
}

// Function to parse individual certificates
async function parseCertificate(cert) {
  try {
    const x = new jsrsasign.X509();
    x.readCertPEM(cert);
    const certInfo = {};

    certInfo.x509Cert = cert.replace(/\r\n/g, "\n").trim();
    certInfo.commonName = extractCertificateField(x.getSubjectString(), "CN");
    certInfo.issuerName = extractCertificateField(x.getIssuerString(), "CN");
    certInfo.certSerialNumber = x.getSerialNumberHex();
    certInfo.validFrom = formatDate(x.getNotBefore());
    certInfo.validTo = formatDate(x.getNotAfter());
    certInfo.validityPeriod = calculateValidityPeriod(x);
    certInfo.organization = extractCertificateField(x.getSubjectString(), "O");
    certInfo.city = extractCertificateField(x.getSubjectString(), "L");
    certInfo.state = extractCertificateField(x.getSubjectString(), "ST");
    certInfo.country = extractCertificateField(x.getSubjectString(), "C");
    certInfo.certType = x.getExtKeyUsageString();
    certInfo.constraints = x.getExtBasicConstraints();
    certInfo.subjectType = determineSubjectType(x);
    certInfo.fp = getCertificateFingerprint(cert);
    certInfo.email = getCertificateEmail(x);

    return certInfo;
  } catch (err) {
    console.error("Error parsing certificate:", err);
    return null;
  }
}

// Extracts the field from the certificate's subject string
function extractCertificateField(subjectString, field) {
  const regex = new RegExp(`/(${field}=)([^/]+)`);
  const match = subjectString.match(regex);
  return match ? match[2] : "";
}

// Formats date from the certificate
function formatDate(date) {
  return moment(date, "YYMMDDHHmmssZ").format("YYYY-MM-DD HH:mm:ss");
}

// Calculates the validity period of the certificate
function calculateValidityPeriod(x) {
  return Math.round(
    moment(x.getNotAfter(), "YYMMDDHHmmssZ").diff(
      moment(x.getNotBefore(), "YYMMDDHHmmssZ"),
      "years",
      true
    )
  );
}

// Determines the subject type of the certificate
function determineSubjectType(x) {
  const basicConstraints = x.getExtBasicConstraints();
  if (basicConstraints && basicConstraints.cA) {
    if (basicConstraints.pathLen == null) return "CCA";
    if (basicConstraints.pathLen >= 1) return "CA";
    if (basicConstraints.pathLen === 0) return "Sub-CA";
  }
  return "End Entity";
}

// Returns the certificate fingerprint
function getCertificateFingerprint(cert) {
  const hex = pemtohex(cert);
  return KJUR.crypto.Util.hashHex(hex, "sha1");
}

// Returns the certificate email (from Subject Alternative Name)
function getCertificateEmail(x) {
  const san = x.getExtSubjectAltName();
  const emailEntry = san && san.array.find((entry) => entry.rfc822);
  return emailEntry ? emailEntry.rfc822 : "N/A";
}

// Handles the certificate insertion logic
async function handleCertificateInsertion(certificateList, firstCert) {
  try {
    if (firstCert.subjectType === "CCA") {
      firstCert.issuerSlNo = firstCert.certSerialNumber;
      // Insert the first certificate into the database
      const response = await userModel.insertCertificate(firstCert);
      if (response) {
        return { status: 200, message: "Successfully inserted certificate" };
      }
    } else if (firstCert.subjectType === "CA" && certificateList.length > 1) {
      const secondCert = certificateList[1];
      const exists = await userModel.checkCertificateInDatabase(secondCert);
      if (exists) {
        const response = await userModel.insertCertificate(firstCert);
        if (response) {
          return { status: 200, message: "Successfully inserted certificate" };
        }
      } else {
        return {
          status: 400,
          message: "Issuer Certificate does not exist in the database",
        };
      }
    } else {
      return {
        status: 400,
        message: "Invalid certificate chain or subject type",
      };
    }
  } catch (error) {
    console.error("Error in certificate insertion:", error);
    return { status: 500, message: error.message };
  }
}
const createCertSummaryList = (certInfos) => {
  const summaryList = [];
  for (let i = 0; i < certInfos.length; i++) {
    const cert = certInfos[i];
    const isLastCert = i === certInfos.length - 1;

    // If it's the last certificate, it issues itself, otherwise, it is issued by the next certificate
    const issuerSlNo = isLastCert
      ? cert.certSerialNumber
      : certInfos[i + 1].certSerialNumber;

    // Creating the summary for the current certificate
    const summary = {
      issuerSlNo: issuerSlNo,
      x509Cert: cert.x509Cert,
      commonName: cert.commonName,
      issuerName: cert.issuerName,
      certSerialNumber: cert.certSerialNumber,
      validFrom: cert.validFrom,
      validTo: cert.validTo,
      validityPeriod: cert.validityPeriod,
      organization: cert.organization,
      city: cert.city,
      state: cert.state,
      country: cert.country,
      certType: cert.certType,
      constraints: cert.constraints,
      subjectType: cert.subjectType,
      email: cert.email,
      // extensions: cert.extensions,
      fp: cert.fp,
    };

    summaryList.push(summary);
  }

  return summaryList;
};
async function extractCert(req, res) {
  let pemCert;

  if (req.body.base64Cert) {
    try {
      pemCert = Buffer.from(req.body.base64Cert, "base64").toString("utf-8");
    } catch (error) {
      console.error("Error decoding base64 certificate:", error);
      return res.status(400).json({ error: "Invalid base64 certificate" });
    }
  }
  try {
    // Parse the certificate
    const x509 = new jsrsasign.X509();
    x509.readCertPEM(pemCert);

    commonName = x509.getSubjectString().split("/CN=")[1] || "";
    issuerName = x509.getIssuerString().split("/CN=")[1] || "";
    serialNumber = x509.getSerialNumberHex();
    extKeyUsage = x509.getExtKeyUsage();
    validFrom = x509.getNotBefore();
    validTo = x509.getNotAfter();
    const organization =
      x509.getSubjectString().split("/O=")[1]?.split("/")[0] || "";
    const address1 =
      x509.getSubjectString().split("/STREET=")[1]?.split("/")[0] || "";
    const address2 =
      x509.getSubjectString().split("/2.5.4.51 =")[1]?.split("/")[0] || "";
    const address = address1 + address2;
    const state = x509.getSubjectString().split("/ST=")[1]?.split("/")[0] || "";
    const postalcode =
      x509.getSubjectString().split("/postalCode=")[1]?.split("/")[0] || "";
    const response = await userModel.getCertSerialNumber(
      serialNumber,
      issuerName
    );
    if (!response) {
      return res
        .status(201)
        .json("Certificate does not belong to a registered CA");
    } else {
      return res.json({
        commonName,
        issuerName,
        serialNumber,
        extKeyUsage,
        validFrom,
        validTo,
        organization,
        address,
        state,
        postalcode,
      });
    }
  } catch (error) {
    console.error("Error processing certificate:", error);
    return res.status(500).json({
      error: "Invalid certificate format or error processing the certificate",
    });
  }
}

async function refreshToken(req, res) {
  const refreshToken = req.body.refreshToken;
  const username = req.body.username; // Assuming username is sent with the request

  if (!refreshToken || refreshToken[username] !== refreshToken) {
    return res
      .status(401)
      .json({ message: "Refresh token is required or invalid" });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    const token = generateAccessToken({
      username: user.username,
      role: user.role,
      authNo: user.authNo,
    });
    const refreshToken = generateRefreshToken({
      username: user.username,
      role: user.role,
      authNo: user.authNo,
    });
    res.json({ token, refreshToken });
  });
}

async function logout(req, res) {
  const userName = req.body.username;
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ msg: "Error while logging out." });
    }
    userModel.logUserAction(
      userName,
      // new Date().toISOString().replace("T", " ").slice(0, 19),
      req.ip,
      "Logout",
      "Logged Out",
      req.body.latitude,
      req.body.longitude
    );
    res.status(200).json({ msg: "Logged out successfully!" });
  });
}

async function fetchData(req, res) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) return res.sendStatus(403);
      else {
        const {
          issuer,
          subjectType,
          state,
          region,
          selectedDate,
          startDate,
          endDate,
          validity,
          page,
          rowsPerPage,
          orderBy,
          order,
          noPagination
        } = req.body;
        const filterCriteria = {};

        // Constructing filterCriteria based on request body values
        if (issuer && Array.isArray(issuer) && issuer.length > 0) {
          filterCriteria.issuers = issuer;
        }

        if (
          subjectType &&
          Array.isArray(subjectType) &&
          subjectType.length > 0
        ) {
          filterCriteria.subjectType = subjectType;
        }

        if (state && Array.isArray(state) && state.length > 0) {
          filterCriteria.states = state;
        }

        if (region && Array.isArray(region) && region.length > 0) {
          filterCriteria.regions = region;
        }

        if (selectedDate && startDate && endDate) {
          filterCriteria.startDate = startDate;
          filterCriteria.endDate = endDate;
          filterCriteria.selectedDate = selectedDate;
        }

        if (validity && validity !== 0) {
          filterCriteria.validity = validity;
        }

        const { result, count } = await userModel.getCertData(
          filterCriteria,
          user.authNo,
          rowsPerPage,
          page,
          orderBy,
          order,
          noPagination
        );
        for (i in result) {
          result[i].Region = await getIndianRegion(result[i].State);
          result[i].IssueDate = formatDate(result[i].IssueDate);
          result[i].ExpiryDate = formatDate(result[i].ExpiryDate);
        }

        res.json({ result, count });
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ Error: error });
  }
}
async function fetchRevokedData(req, res) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) return res.sendStatus(403);
      else {
        const {
          reasons,
          startDate,
          endDate,
          page,
          rowsPerPage,
          orderBy,
          order,
        } = req.body;
        const filterCriteria = {};
        if (reasons && reasons.length > 0) {
          filterCriteria.reason = reasons;
        }
        if (startDate && endDate) {
          filterCriteria.startDate = startDate;
          filterCriteria.endDate = endDate;
        }

        const { result, count } = await userModel.getRevokedCertData(
          filterCriteria,
          user.authNo,
          page,
          rowsPerPage,
          order,
          orderBy
        );
        for (i in result) {
          result[i].RevokeDateTime = formatDate(result[i].RevokeDateTime);
        }
        res.json({ result, count });
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error." });
  }
}
async function fetchUsageData(req, res) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) return res.sendStatus(403);
      else {
        const { usage, startDate, endDate, page, rowsPerPage, orderBy, order } =
          req.body;
        const filterCriteria = {};
        if (usage && usage.length > 0) {
          filterCriteria.usage = usage;
        }
        if (startDate && endDate) {
          filterCriteria.startDate = startDate;
          filterCriteria.endDate = endDate;
        }

        const { result, count } = await userModel.getCertUsageData(
          filterCriteria,
          user.authNo,
          page,
          rowsPerPage,
          order,
          orderBy
        );

        for (i in result) {
          result[i].UsageDate = formatDate(result[i].UsageDate);
        }
        res.json({ result, count });
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error." });
  }
}
async function fetchLogsData(req, res) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, userToken) => {
        if (err) return res.sendStatus(403);
        else {
          const {
            user,
            action,
            startDate,
            endDate,
            page,
            rowsPerPage,
            orderBy,
            order,
          } = req.body;
          const filterCriteria = {};
          if (user && user.length > 0) {
            filterCriteria.users = user;
          }
          if (action && action.length > 0) {
            filterCriteria.actions = action;
          }
          if (startDate && endDate) {
            filterCriteria.startDate = startDate;
            filterCriteria.endDate = endDate;
          }
          const { result, count } = await userModel.getLogsData(
            filterCriteria,
            userToken.authNo,
            page,
            rowsPerPage,
            order,
            orderBy
          );
          for (i in result) {
            result[i].TimeStamp = formatDate(result[i].TimeStamp);
          }
          res.json({ result, count });
        }
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error." });
  }
}

async function profileData(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);

    try {
      const profileData = await userModel.findUserData(user.username);

      if (profileData.length > 0) {
        // res.status(200).json({ profile });
        if (profileData[0].AuthNo == null) {
          // // remove values and add dummy values
          const profile = {
            Name: profileData[0].Name,
            Email: profileData[0].UserEmail,
            Organization: "Administrator",
            Address: "CDAC Bengaluru ,E-city",
            State: "KA",
            PostalCode: "560100",
          };
          res.status(200).json({ profile });
        } else {
          const profile = {
            Name: profileData[0].Name,
            Email: profileData[0].UserEmail,
            Organization: profileData[0].Organization,
            Address: profileData[0].Address,
            State: profileData[0].State,
            PostalCode: profileData[0].PostalCode,
          };
          res.status(200).json({ profile });
        }
      } else {
        res.status(400).json("Error Occurred");
      }
    } catch (error) {
      res.sendStatus(500);
    }
  });
}
async function profile(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);

    try {     
      const result = await userModel.getLastLogin(user.authNo);
      
      var data = {
        ip: "---",
        lastLogin: "---",
      };
      if (result.length > 0) {
        data = {
          ip: result[0].IpAddress,
          lastLogin: formatDate(result[0].TimeStamp),
        };
      }
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      res.sendStatus(500);
    }
  });
}

async function updatePasswordController(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userExist = await userModel.findUserByUsername(req.user.username);
    const passwordMatch = await bcrypt.compare(
      oldPassword,
      userExist[0].Password
    );
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;
    if (!passwordPattern.test(newPassword)) {
      return res.status(400).json({
        message:
          "A minimum 8 characters password contains a combination of uppercase and lowercase letter and number are required",
      });
    } else if (!passwordMatch) {
      return res.status(400).json({ message: "Old password is not correct!" });
    } else if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old and new password are required!" });
    } else if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match!" });
    } else {
      const result = await userModel.updatePassword(
        newPassword,
        req.user.authNo
      );
      const remark = userExist[0].UserEmail + " Updated their password!";
      const now = new Date();
      const localTime = new Date(now.getTime());
      await userModel.updateStatus(
        userExist[0].UserEmail,
        "active",
        2,
        localTime
      );
      await userModel.logUserAction(
        userExist[0].UserEmail,
        req.ip,
        "Password change",
        remark,
        req.body.latitude,
        req.body.longitude
      );

      if (result.success) {
        return res.status(200).json({ message: result.message });
      } else {
        return res.status(400).json({ message: result.message });
      }
    }
  } catch (err) {
    console.error("An error occurred while", err);
    res.status(500).json({ error: err });
  }
}

async function authorities(req, res) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);

    try {
      const authoritiesData = await userModel.findAuthorities();
      formattedAuthority = authoritiesData.map((authority) => {
        return {
          label: authority.AuthName,
          value: authority.AuthName,
        };
      });
      res.status(200).json(formattedAuthority);
    } catch (error) {
      console.error("Error fetching authorities data:", error);
      res.sendStatus(500);
    }
  });
}
async function cards(req, res) {
  try {
    const cards = await userModel.getCardsData();
    res.status(200).json(cards);
  } catch (error) {
    console.error("Error fetching authorities data:", error);
    res.sendStatus(500);
  }
}
async function compactCard(req, res) {
  try {
    const counts = await userModel.getCompactCardData();
    res.status(200).json(counts);
  } catch (error) {
    console.error("Error fetching authorities data:", error);
    res.sendStatus(500);
  }
}
async function getAllAuths(req, res) {
  try {
    const { authorities, distinctRoles } = await userModel.getAllAuthsData();
    res.status(200).json({ authorities, distinctRoles });
  } catch (error) {
    console.error("Error fetching authorities & role data:", error);
    res.sendStatus(500);
  }
}
async function getAllUsers(req, res) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, userToken) => {
        if (err) return res.sendStatus(403);
        else {
          const {
            page,
            rowsPerPage,
            orderBy,
            order,
          } = req.body;
          const { result, count } = await userModel.getAllUsersData(
            page,
            rowsPerPage,
            order,
            orderBy
          );
          res.json({ result, count });
        }
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error." });
  }
}

async function updateAuths(req, res) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) return res.sendStatus(403);

      try {
        const { authName, authCode, authNo } = req.body;

        if (!authCode || !authName || !authNo)
          return res.status(400).json({ error: "Missing required fields" });

        const authNameOld = await userModel.findUserByAuthNo(authNo);
        const result = await userModel.updateAuthsData(
          authCode,
          authName,
          authNo
        );
        var remark = "";
        if (
          authNameOld[0].AuthName !== authName &&
          authNameOld[0].AuthCode !== authCode
        ) {
          remark = "Updated details of authority " + authNameOld[0].AuthName;
        } else if (authNameOld[0].AuthName !== authName) {
          remark =
            "Updated authority Name of " +
            authNameOld[0].AuthName +
            " to " +
            authName;
        } else if (authNameOld[0].AuthCode !== authCode) {
          remark =
            "Updated Authcode of " +
            authNameOld[0].AuthCode +
            " to " +
            authCode;
        } else {
          // remark = "Updated Authcode and Name of authority " + authName;
          remark = " Attempt to Change the data of" + authName;
        }
        userModel.logUserAction(
          "Admin",
          // new Date().toISOString().replace("T", " ").slice(0, 19),
          req.ip,
          "Update",
          remark,
          req.body.latitude,
          req.body.longitude
        );
        res.status(200).json({ message: "Data updated successfully" });
        // if (result.affectedRows > 0) {
        // } else {
        //   res.status(404).json({ message: 'Data not found' });
        // }
      } catch (error) {
        console.error("Error in updating data:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// json files handling API

// states by region json
const statesByRegionPath = "../public/statesByRegion.json";

// returns regions
async function region(req, res) {
  try {
    const filePath = "backend/" + statesByRegionPath;

    const data = fs.readFileSync(filePath, "utf8");

    const allRegions = JSON.parse(data);

    // Map the keys to the desired format
    // const result = Object.keys(allRegions).map((item) => ({
    //   label: item,
    //   value: item,
    // }));

    const result = Object.keys(allRegions)
      .filter((key) => key != "unassigned")
      .map((item) => ({
        label: item,
        value: item,
      }));

    res.json(result);
  } catch (error) {
    console.error("Error processing the request:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
}
async function getIndianRegion(state) {
  try {
    const filePath = "backend/" + statesByRegionPath;
    const data = fs.readFileSync(filePath, "utf8");
    const allRegions = JSON.parse(data);

    for (const region in allRegions) {
      const states = allRegions[region];
      if (states.some((s) => s.value === state)) {
        return region;
      }
    }
    return "Not found";
  } catch (error) {
    console.error("Error occurred while processing", error);
    return "Not Found";
  }
}

async function getStatesByRegion(req, res) {
  try {
    const regions = req.body.regions;

    // Validate input
    if (!regions || !Array.isArray(regions)) {
      return res
        .status(400)
        .json({ error: "Invalid input, regions must be an array." });
    }

    // Read and parse the data file
    const filePath = "backend/" + statesByRegionPath;
    const data = fs.readFileSync(filePath, "utf8");
    const allRegions = JSON.parse(data);

    // If regions array is empty, return all states
    if (regions.length === 0) {
      const allStates = Object.values(allRegions).flat();

      return res.json(allStates);
    }

    // Filter and return the states based on provided regions
    const result = regions.reduce((acc, region) => {
      if (allRegions[region]) {
        acc = acc.concat(allRegions[region]);
      }
      return acc;
    }, []);

    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
}

async function viewStatesByRegion(req, res) {
  const jsonData = fs.readFileSync("backend/" + statesByRegionPath);
  let result = JSON.parse(jsonData);
  res.status(200).json(result);
}

async function addRegion(req, res) {
  const filePath = "backend/" + statesByRegionPath;

  try {
    const allRegions = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(allRegions);

    const { region } = req.body;

    if (!region) {
      return res.status(400).json({ error: "Region is required." });
    }

    if (data[region]) {
      return res.status(400).json({ error: "Region already exists." });
    }

    data[region] = [];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

    res.json({ message: "Region added successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
}

// async function updateRegion(req, res) {
//   const filePath = "backend/" + statesByRegionPath;
//   try {
//     const allRegions = fs.readFileSync(filePath, "utf8");
//     const data = JSON.parse(allRegions);

//     const { region, newValue } = req.body;

//     if (data[region]) {
//       data[newValue] = data[region];
//       delete data[region]; // Remove the old key

//       fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
//       res.json({ message: "Key updated successfully" });
//     } else {
//       res.status(404).send(`Key "${oldKey}" not found.`);
//     }
//   } catch (err) {
//     res
//       .status(500)
//       .json({ error: "An error occurred while processing your request." });
//   }
// }

async function updateStatesOfRegion(req, res) {
  const filePath = "backend/" + statesByRegionPath;
  try {
    const allRegions = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(allRegions);

    const { region, state, newLabel, newValue, oldValue } = req.body;
    //console.log('Update state Request Body:', req.body); // Check incoming request

    if (region === "unassigned") {
      // Ensure 'unassigned' region exists
      if (!data[region]) {
        data[region] = [];
      }
      if (state) {
        // If state is provided, delete the state from 'unassigned'
        const index = data[region].findIndex((item) => item.value === state);
        if (index !== -1) {
          data[region].splice(index, 1);
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
          return res.status(200).json({
            message: "State deleted successfully from unassigned",
          });
        } else {
          return res.status(404).send("State not found in unassigned region");
        }
      } else {
        // If state is not provided, handle addition of new state
        data[region].push({ label: newLabel, value: newValue });
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
        return res.status(200).json({ message: "State added successfully" });
      }
    } else {
      // Handle other regions (adding or updating states)
      if (data[region]) {
        if (oldValue === null) {
          // Add new state to the region
          data[region].push({ label: newLabel, value: newValue });
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
          return res.status(200).json({ message: "Added successfully" });
        } else {
          // Update existing state
          const index = data[region].findIndex(
            (item) => item.label === oldValue
          );
          if (index !== -1) {
            data[region][index] = { label: newLabel, value: newValue };
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
            return res.status(200).json({ message: "Updated successfully" });
          } else {
            return res.status(404).send("Entry not found");
          }
        }
      } else {
        return res.status(404).send("Region not found");
      }
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
}

async function moveStatesOfRegion(req, res) {
  const filePath = path.join("backend", statesByRegionPath);

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContent);

    const { region, state, action, newRegion } = req.body;

    if (!["add", "remove"].includes(action)) {
      return res.status(400).json({ error: "Invalid action. Use 'add' or 'remove'." });
    }

    if (!data[region]) {
      return res.status(404).json({ error: "Current region not found" });
    }

    const stateIndex = data[region].findIndex((item) => item.value === state);
    if (stateIndex === -1) {
      return res.status(404).json({ error: "State not found in the current region" });
    }

    const [stateItem] = data[region].splice(stateIndex, 1);

    if (action === "remove") {
      // Move to 'unassigned' region
      data["unassigned"] = data["unassigned"] || [];
      data["unassigned"].push(stateItem);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

      return res.status(200).json({
        message: "State moved to 'unassigned' region successfully",
      });
    }

    // Action is 'add'
    if (!data[newRegion]) {
      return res.status(404).json({ error: "New region not found" });
    }

    const duplicateInNewRegion = data[newRegion].some((item) => item.value === state);
    if (duplicateInNewRegion) {
      return res.status(400).json({ error: "State already exists in the new region" });
    }

    data[newRegion].push(stateItem);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

    return res.status(200).json({ message: "State moved successfully" });

  } catch (err) {
    console.error("Error processing request:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
async function removeRegion(req, res) {
  const filePath = "backend/" + statesByRegionPath;
  try {
    const allRegions = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(allRegions);

    const { region } = req.body;

    if (data[region]) {
      if (data[region].length > 0) {
        res.json({
          message:
            "Region is not empty! Please move the states to other region",
        });
      } else {
        delete data[region];
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
        res.json({ message: "Region removed successfully" });
      }
    } else {
      res.status(404).send(`Region not found.`);
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
}

// subjectType
async function getSubType(req, res) {
  try {
    const distinctSubTypes = await userModel.getSubjectTypes();
    const result = distinctSubTypes.map((item) => ({
      label: item.SubjectType,
      value: item.SubjectType,
    }));
    res.json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.sendStatus(500);
  }
}
async function getAllRevocationReasons(req, res) {
  try {
    const distinctReasons = await userModel.getRevocationReasons();

    const result = distinctReasons.map((item) => ({
      label: item.Reason,
      value: item.Reason,
    }));
    res.json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.sendStatus(500);
  }
}
async function getAllActions(req, res) {
  try {
    const distinctActions = await userModel.getLogActions();

    const result = distinctActions.map((item) => ({
      label: item.ActionType,
      value: item.ActionType,
    }));
    res.json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.sendStatus(500);
  }
}

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters[randomIndex];
  }
  return result;
}

async function generateAuthCode(req, res) {
  try {
    const randomString = generateRandomString(20);
    res.status(200).json({
      authCode: randomString,
      message: "Authcode  generated successfully",
    });
  } catch (err) {
    console.error("Error generating auth code: ", err);
    res.sendStatus(500);
  }
}
async function generatePass(req, res) {
  try {
    const randomString = generatePassword(10);
    res.status(200).json({
      password: randomString,
      message: "Password generated successfully",
    });
  } catch (err) {
    console.error("Error generating password: ", err);
    res.sendStatus(500);
  }
}

async function certInfo(req, res) {
  const { serialNo, issuerCN } = req.body;

  try {
    const result = await userModel.getCertInfo(serialNo, issuerCN);

    // console.log("Result:", result);

    if (result.length === 0) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    const Certificate = {
      serialNo: result[0].SerialNumber,
      commonName: result[0].Subject_CommonName,
      email: result[0].Subject_Email,
      issuerCN: result[0].IssuerCommonName,
      keyUsage: result[0].CertKeyUsage,
      hash: result[0].Fp_512,
    };

    res.status(200).json(Certificate);
  } catch (error) {
    console.error("Error retrieving certificate information:", error.message);
    res
      .status(500)
      .json({ error: "Error retrieving certificate information." });
  }
}

function generatePassword(length) {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const specialCharacters = "@$!%*?&.#";

  // Ensure at least one of each character type
  const passwordArray = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    digits[Math.floor(Math.random() * digits.length)],
    specialCharacters[Math.floor(Math.random() * specialCharacters.length)],
  ];

  // Fill the rest of the password length with random characters from all sets
  const allCharacters = lowercase + uppercase + digits + specialCharacters;

  for (let i = 4; i < length; i++) {
    passwordArray.push(
      allCharacters[Math.floor(Math.random() * allCharacters.length)]
    );
  }

  // Shuffle the password array to randomize character positions
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join("");
}
async function forgotPassword(req, res) {
  const email = req.body.email;
  email.toLowerCase();
  const Sender = process.env.ID || "";
  const Secret = process.env.SECRET || "";
  const pass = generatePassword(12);

  try {
    const exist = await userModel.setTemporaryPass(email, pass);
    if (exist) {
      var transporter = nodemailer.createTransport({
        host: "smtp.cdac.in",
        port: 587,
        // secure: true,
        auth: {
          user: Sender,
          pass: Secret,
        },
        timeout: 60000,
      });
      var mailOptions = {
        from: Sender,
        to: email,
        subject: "Password Reset Request",
        text: `Dear Sir/Ma'am,
      
      We have received a request to change the password on your account. Please use the temporary password: ${pass} to log in to your account.
      
      For security reasons, we recommend that you change your password as soon as you log in.
      
      Thank you and regards,  
      Admin Team
      Certificate Store`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          return res.status(400).json({ error: "Failed to Send" });
        } else {
          // console.log("Email sent: " + info.response);
          return res.status(200).json("Email Sent Successfully");
        }
      });
    } else {
      return res
        .status(200)
        .json("Incorrect Email Address. Please check again");
    }
  } catch (error) {
    console.error("Error Sending Email:", error.message);
    res.status(500).json({ error: "Error Sending Email" });
  }
}
async function pdfGeneration(data, title, headers, filePath) {
  try {
    const dirPath = path.dirname(filePath);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const unit = "pt";
    const size = "A4";
    const orientation = "landscape";

    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(10);
    const transformedData = data.map((item) => Object.values(item));

    let content = {
      startY: 50,
      theme: "grid",
      head: headers,
      body: transformedData,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
    };

    doc.text(title, marginLeft, 40);
    await doc.autoTable(content);
    doc.save(filePath);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function getReportData(title, data, auth) {
  if (title === "Issued Certificates") {
    // Destructure the filter data
    const {
      issuer,
      subjectType,
      state,
      region,
      selectedDate,
      startDate,
      endDate,
      validity,
      orderBy,
      order,
      noPagination,
    } = data;

    // Construct filter criteria for getCertData
    const filterCriteria = {};

    if (issuer && Array.isArray(issuer) && issuer.length > 0) {
      filterCriteria.issuers = issuer;
    }

    if (subjectType && Array.isArray(subjectType) && subjectType.length > 0) {
      filterCriteria.subjectType = subjectType;
    }

    if (state && Array.isArray(state) && state.length > 0) {
      filterCriteria.states = state;
    }

    if (region && Array.isArray(region) && region.length > 0) {
      filterCriteria.regions = region;
    }

    if (selectedDate && startDate && endDate) {
      filterCriteria.startDate = startDate;
      filterCriteria.endDate = endDate;
      filterCriteria.selectedDate = selectedDate;
    }

    if (validity && validity !== 0) {
      filterCriteria.validity = validity;
    }

    // Fetch data from getCertData (either with pagination or without)
    const { result } = await userModel.getCertData(
      filterCriteria,
      auth,
      null, // No pagination when fetching all data
      null, // No page number when fetching all data
      orderBy,
      order,
      noPagination
    );

    // Enhance the result data (e.g., formatting dates or adding regions)
    for (let i = 0; i < result.length; i++) {
      result[i].Region = await getIndianRegion(result[i].State); // If needed
      result[i].IssueDate = formatDate(result[i].IssueDate);
      result[i].ExpiryDate = formatDate(result[i].ExpiryDate);
    }

    return result;
  } else if(title === "Logs") {
    console.log("auth", auth, "title", title);
    const {
      user,
      action,
      startDate,
      endDate,
      orderBy,
      order,
      noPagination
    } = data;
    const filterCriteria = {};
    if (user && user.length > 0) {
      filterCriteria.users = user;
    }
    if (action && action.length > 0) {
      filterCriteria.actions = action;
    }
    if (startDate && endDate) {
      filterCriteria.startDate = startDate;
      filterCriteria.endDate = endDate;
    }
    const { result } =  await userModel.getLogsData(
      filterCriteria,
      auth,
      null,
      null,
      order,
      orderBy,
      noPagination
    );
    for (i in result) {
      result[i].TimeStamp = formatDate(result[i].TimeStamp);
    }
    return result;
  }else if(title === "Usage of Certificates"){

    const { usage, startDate, endDate, orderBy, order,noPagination } =
          data;
        const filterCriteria = {};
        if (usage && usage.length > 0) {
          filterCriteria.usage = usage;
        }
        if (startDate && endDate) {
          filterCriteria.startDate = startDate;
          filterCriteria.endDate = endDate;
        }
    const { result } =  await userModel.getCertUsageData(
      filterCriteria,
          auth,
          null,
          null,
          order,
          orderBy,
          noPagination
    );
    return result
  }else if(title === "Revoked Certificates"){

    const {
      reasons,
      startDate,
      endDate,
      orderBy,
      order,
      noPagination
    } = data;
    const filterCriteria = {};
    if (reasons && reasons.length > 0) {
      filterCriteria.reason = reasons;
    }
    if (startDate && endDate) {
      filterCriteria.startDate = startDate;
      filterCriteria.endDate = endDate;
    }

    const { result } =  await userModel.getRevokedCertData(
      filterCriteria,
          auth,
          null,
          null,
          order,
          orderBy,
          noPagination
    );
    return result
  }
  return null;
}

async function reportGenerator(req, res) {
  const { data, title, headers } = req.body;

  const Sender = process.env.ID || "";
  const Secret = process.env.SECRET || "";

  const uuid = uuidv4();
  const filePath = `./public/reports/${uuid}.pdf`;
  const link = `http://10.182.3.123:8080/reports/${uuid}.pdf`;

  try {
    let email = "";
    const userName = req.session.username;
    const auth = req.session.userid;
    const ccEmail = (await userModel.findEmailByAuth(auth)) || "";

    if (userName === "admin") {
      email = process.env.ADMIN || "";
    } else {
      email = userName;
    }

    // Fetch the report data
    const tableData = await getReportData(title, data, auth); // Fetch data from getReportData
    if (!tableData) {
      return res.status(400).json({ error: "Failed to retrieve data for report." });
    }

    // Generate the PDF report
    const result = await pdfGeneration(tableData, title, headers, filePath);
    if (result) {
      // console.log("email", email, "\ncc mail:", ccEmail);

      // Set up the email transporter
      var transporter = nodemailer.createTransport({
        host: "smtp.cdac.in",
        port: 587,
        auth: {
          user: Sender,
          pass: Secret,
        },
        timeout: 60000,
      });

      // Prepare email options
      var mailOptions = {
        from: "CertStore Admin <certstore-admin@cdac.in>",
        to: email,
        cc: ccEmail,
        subject: "Report generated",
        text: `Dear Sir/Ma'am,

We have received a ${title} report generation request from your account. Please download the report using the link: ${link}.
The link will be available for the next 24 hours.

Thanks and Regards,
Admin
Certstore`,
      };

      // Send the email
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(400).json({ error: "Failed to send email" });
        } else {
          return res.status(200).json("Email Sent Successfully");
        }
      });
    } else {
      return res.status(400).json({ error: "Error generating report" });
    }
  } catch (error) {
    console.error("Error generating report:", error.message);
    return res.status(500).json({ error: "Error sending email" });
  }
}

async function statusCheck(req, res) {
  try {
    const userName = req.session.username;
    const status = await userModel.getProfileStatus(userName);
    if (status == "temporary") {
      return res.status(200).json({ login: "Temporary" });
    } else {
      return res.status(200).json({ login: "Normal" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
async function profileImage(req, res) {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).send("No file uploaded.");
    }

    const img = req.files.image;
    const fileName = req.body.authNo + ".png";
    const uploadPath = path.join(__dirname, "..", "public/images", fileName);
    if (fs.existsSync(uploadPath)) {
      fs.unlinkSync(uploadPath); // Delete the existing file
      // console.log(`Existing file ${fileName} deleted.`);
    }

    // Move the file to the desired directory
    img.mv(uploadPath, (err) => {
      if (err) {
        console.error("File upload error:", err);
        return res
          .status(500)
          .json({ error: "Failed to upload file", details: err });
      }

      // console.log("ProfileImage", img.name);
      return res.status(200).json("File uploaded successfully.");
    });
  } catch (error) {
    console.error("Internal server error:", error); // Log the error
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  signupController,
  signupUserController,
  landingPage,
  login,
  dashboard,
  logout,
  enableAccount,
  userDetails,
  userSessionInfo,
  certificateUpload,
  extractCert,
  fetchData,
  fetchRevokedData,
  fetchUsageData,
  fetchLogsData,
  profile,
  profileData,
  refreshToken,
  updatePasswordController,
  authorities,
  cards,
  compactCard,
  getAllUsers,
  getAllAuths,
  updateAuths,
  region,
  getStatesByRegion,
  viewStatesByRegion,
  addRegion,
  updateStatesOfRegion,
  moveStatesOfRegion,
  removeRegion,
  getSubType,
  getAllRevocationReasons,
  getAllActions,
  generateAuthCode,
  generatePass,
  certInfo,
  forgotPassword,
  reportGenerator,
  statusCheck,
  profileImage,
};
