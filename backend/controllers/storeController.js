const userModel = require("../models/userModel");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const forge = require("node-forge");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const log = require("node-forge/lib/log");

const TOKEN_FILE = "tokens.json";
let refreshTokens = {};

if (fs.existsSync(TOKEN_FILE)) {
  refreshTokens = JSON.parse(fs.readFileSync(TOKEN_FILE));
}

const saveTokensToFile = () => {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(refreshTokens));
};

// Generate an access token
const generateAccessToken = (userName, role, authNo) => {
  // Include the necessary claims (payload) in the token
  const payload = {
    username: userName,
    role: role,
    authNo: authNo,
  };

  // Generate the token with an expiration time
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "6h",
  }); // Adjust the expiration time as needed
};

// Generate a refresh token
const generateRefreshToken = (userName, role, authNo) => {
  // Include the necessary claims (payload) in the token
  const payload = {
    username: userName,
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

async function signupController(req, res) {
  const {
    username,
    password,
    role,
    authCode,
    email,
    address,
    organization,
    state,
    postalcode,
  } = req.body;
  // console.log(req.body);
  const fileBuffer = req.files.cert.data;
  // Check if user exists
  const existingUser = await userModel.findUserByUsername(username);
  if (existingUser.length > 0) {
    return res.status(500).json({ message: "User already exists" });
  }

  // Validation for username and password
  const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;

  if (!usernamePattern.test(username)) {
    return res.status(500).json({ message: "Invalid username" });
  }
  if (!passwordPattern.test(password)) {
    return res.status(500).json({ message: "Invalid password" });
  }
  try {
    const pki = forge.pki;
    parsedCertificate = pki.certificateFromPem(fileBuffer);
    if (!parsedCertificate) {
      res.status(500).json({
        error: "Failed to parse the certificate.",
      });
      return;
    } else {
      const issuerAttributes = parsedCertificate.issuer.attributes;
      const subjectAttributes = parsedCertificate.subject.attributes;
      let issuerCommonName = issuerAttributes.find(
        (attr) => attr.name === "commonName"
      );
      issuerCommonName = issuerCommonName ? issuerCommonName.value : "Unknown";
      const serialNumber = parsedCertificate.serialNumber;
      let subjectCommonName = subjectAttributes.find(
        (attr) => attr.name === "commonName"
      );

      subjectCommonName = subjectCommonName
        ? subjectCommonName.value
        : "Unknown";
      const response = await userModel.getCertSerialNumber(
        serialNumber,
        issuerCommonName
      );
      const newAuth = await userModel.getNextSerial();

      if (response) {
        const authNo = newAuth;
        const hasedPassword = await bcrypt.hash(password, 10);
        const params = {
          username: username,
          password: hasedPassword,
          role: role,
          authCode: authCode,
          email: email,
          address: address,
          organization: organization,
          state: state,
          postalcode: postalcode,
          authNo: authNo,
          authName: subjectCommonName,
          serialNumber: serialNumber,
        };
        const result = await userModel.signup(params);
        // console.log("result: ", result);
        if (result) {
          return res.status(200).json({ message: "Signup successful" });
        }
      } else return res.status(500).json({ message: "Signup unsuccessful" });
    }
  } catch (err) {
    console.error("Error during signup: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// update the user status
async function loginAttempt(userExist) {
  if (userExist.LoginStatus == "inactive") {
    const currentTime = new Date();
    const timeDifferenceMs = currentTime - userExist.LastAttempt;
    const timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60); // 1000 milliseconds * 60 seconds * 60 minutes

    // Check if the time difference is greater than 24 hours
    if (timeDifferenceHours > 24) {
      //updates the database
      await userModel.updateStatus(
        userExist.UserName,
        "active",
        2,
        currentTime
      );
      return true;
    } else {
      // console.log("The time difference is not greater than 24 hours.");
      return false;
    }
  } else {
    return true;
  }
}

async function login(req, res) {
  const { username, password, latitude, longitude } = req.body;
  try {
    const userExist = await userModel.findUserByUsername(username);
    if (!userExist.length) {
      return res.status(400).json({ error: "User does not exist" });
    }
    const storedHashedPassword = userExist[0].Password;
    const passwordMatch = await bcrypt.compare(password, storedHashedPassword);
    if (passwordMatch && (await loginAttempt(userExist[0]))) {
      // Successful login
      const accessToken = generateAccessToken(
        userExist[0].UserName,
        userExist[0].Role,
        userExist[0].AuthNo
      );
      const refreshToken = generateRefreshToken(
        userExist[0].UserName,
        userExist[0].Role,
        userExist[0].AuthNo
      );
      req.session.username = userExist[0].UserName;
      req.session.userid = userExist[0].AuthNo;
      req.session.userRole = userExist[0].Role;
      if (userExist[0].LoginStatus == "temporary") {
        await userModel.logUserAction(
          userExist[0].UserName,
          new Date().toISOString().replace("T", " ").slice(0, 19),
          req.ip,
          "Login",
          "Logged In Using Temporary Password",
          latitude,
          longitude
        );
        await userModel.updateStatus(
          userExist[0].UserName,
          "inactive",
          0,
          new Date().toISOString().replace("T", " ").slice(0, 19)
        );
        return res.json({ accessToken, refreshToken });
      }
      if (userExist[0].LoginStatus == "inactive") {
        return res
        .status(423)
        .json({ timeStamp: formatDate(userExist[0].LastAttempt) });
      }
      await userModel.logUserAction(
        userExist[0].UserName,
        new Date().toISOString().replace("T", " ").slice(0, 19),
        req.ip,
        "Login",
        "Logged In",
        latitude,
        longitude
      );
      await userModel.updateAttempts(userExist[0].UserName, 2);
      return res.json({ accessToken, refreshToken });
    } else {
      // Failed login attempt
      if (userExist[0].Attempts > 0) {
        let attempt = (userExist[0].Attempts -= 1);
        await userModel.updateAttempts(userExist[0].UserName, attempt);
      } else {
        await userModel.updateStatus(
          userExist[0].UserName,
          "inactive",
          0,
          new Date().toISOString().replace("T", " ").slice(0, 19)
        );
        return res
          .status(423)
          .json({ timeStamp: formatDate(userExist[0].LastAttempt) });
      }
      return res.status(401).json({ error: "Incorrect credentials" });
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

async function certDetails(req, res) {
  const certificateFile = req.files.certificate;
  // console.log("certificate file", certificateFile);

  let Certificate = {};
  if (certificateFile == null) {
    res.status(400).json({ error: "Certificate file is required." });
    return;
  }

  function isCertificateCA(cert) {
    // Check if Basic Constraints extension is present
    const extensions = cert.extensions;
    for (let i = 0; i < extensions.length; ++i) {
      const ext = extensions[i];
      if (ext.name === "basicConstraints") {
        // basicConstraints extension found
        if (ext.cA === true) {
          // It is a CA certificate
          return true;
        }
        break; // No need to check further
      }
    }
    // Not a CA certificate
    return false;
  }
  try {
    const pki = forge.pki;
    const buffer = certificateFile.data;

    parsedCertificate = pki.certificateFromPem(buffer);

    if (!parsedCertificate) {
      console.error("Error: Failed to parse the certificate.");
      res.status(500).json({ error: "Failed to parse the certificate." });
      return;
    } else {
      // console.log("ParsedCertificate: ", parsedCertificate.issuer.attributes[2].value);
      Certificate = {
        serialNo: parsedCertificate.serialNumber,
        commonName: parsedCertificate.subject.attributes[7].value,
        country: parsedCertificate.subject.attributes[0].value,
        state: parsedCertificate.subject.attributes[4].value,
        region: parsedCertificate.subject.attributes[5].value,
        issuer: parsedCertificate.issuer.attributes[2].value,
        validity: parsedCertificate.validity.notAfter,
        hash: parsedCertificate.subject.hash,
        extensions: parsedCertificate.extensions,
        issuerO: parsedCertificate.issuer.attributes[1].value,
        issuerOU: parsedCertificate.issuer.attributes[2].value,
        issuerCN: parsedCertificate.issuer.attributes[3].value,
      };
    }
    res.json({ ...Certificate });
  } catch (error) {
    console.error("Error parsing the certificate:", error.message);
    res.status(500).json({ error: "Error parsing the certificate." });
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
  const userName = req.session.username;
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ msg: "Error while logging out." });
    }
    userModel.logUserAction(
      userName,
      new Date().toISOString().replace("T", " ").slice(0, 19),
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
  function addYears(date, years) {
    const dateCopy = new Date(date);
    const yearsInt = parseInt(years, 10); // Ensure years is an integer
    dateCopy.setFullYear(dateCopy.getFullYear() + yearsInt);
    const year = dateCopy.getFullYear();
    const month = dateCopy.getMonth() + 1; // Months are zero-based
    const day = dateCopy.getDate();

    // Format the month and day to always be two digits
    const monthFormatted = month < 10 ? `0${month}` : month;
    const dayFormatted = day < 10 ? `0${day}` : day;

    // Return the formatted date in yyyy-mm-dd
    return `${year}-${monthFormatted}-${dayFormatted}`;
  }

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
          startDate,
          endDate,
          validity,
        } = req.body;

        const filterCriteria = {};

        if (issuer && issuer.length > 0) {
          filterCriteria.issuers = issuer;
        }
        if (subjectType && subjectType.length > 0) {
          filterCriteria.subjectType = subjectType;
        }
        if (state && state.length > 0) {
          filterCriteria.states = state;
        }
        if (region && region.length > 0) {
          filterCriteria.regions = region;
        }
        if (startDate && endDate) {
          filterCriteria.startDate = startDate;
          filterCriteria.endDate = endDate;
        }
        if (validity && validity !== 0) {
          filterCriteria.validity = validity;
        }

        const certDetails = await userModel.getCertData(
          filterCriteria,
          user.authNo
        );
        for (i in certDetails) {
          certDetails[i].IssueDate = formatDate(certDetails[i].IssueDate);
          certDetails[i].ExpiryDate = formatDate(certDetails[i].ExpiryDate);
        }
        res.json(certDetails);
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
        const { reasons, startDate, endDate } = req.body;
        const filterCriteria = {};
        if (reasons && reasons.length > 0) {
          filterCriteria.reason = reasons;
        }
        if (startDate && endDate) {
          filterCriteria.startDate = startDate;
          filterCriteria.endDate = endDate;
        }

        const revokedCertDetails = await userModel.getRevokedCertData(
          filterCriteria,
          user.authNo
        );
        for (i in revokedCertDetails) {
          revokedCertDetails[i].revoke_date_time = formatDate(
            revokedCertDetails[i].revoke_date_time
          );
        }
        res.json(revokedCertDetails);
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
        const { usage, startDate, endDate } = req.body;
        const filterCriteria = {};
        if (usage && usage.length > 0) {
          filterCriteria.usage = usage;
        }
        if (startDate && endDate) {
          filterCriteria.startDate = startDate;
          filterCriteria.endDate = endDate;
        }
        const usageDetails = await userModel.getCertUsageData(
          filterCriteria,
          user.authNo
        );
        for (i in usageDetails) {
          usageDetails[i].time_stamp = formatDate(usageDetails[i].time_stamp);
        }
        res.json(usageDetails);
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
          const { user, action, startDate, endDate } = req.body;
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
          const logsDetails = await userModel.getLogsData(
            filterCriteria,
            userToken.authNo
          );
          for (i in logsDetails) {
            logsDetails[i].timestamp = formatDate(logsDetails[i].timestamp);
          }
          res.json(logsDetails);
        }
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error." });
  }
}
// async function fetchLogsData(req, res) {
//     try {
//         const { user, action, startDate, endDate } = req.body;
//         const filterCriteria = {};
//         if (user && user.length > 0) {
//             filterCriteria.users = user;
//         }
//         if (action && action.length > 0) {
//             filterCriteria.actions = action;
//         }
//         if (startDate && endDate) {
//             filterCriteria.startDate = startDate;
//             filterCriteria.endDate = endDate;
//         }
//         const logsDetails = await userModel.getLogsData(filterCriteria);
//         res.json(logsDetails);
//     } catch (error) {
//         console.error("Error:", error.message);
//         res.status(500).json({ error: "Error." });
//     }
// }
async function profileData(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);

    try {
      // const profileData = await userModel.findUserByUsername(user.username);
      const profileData = await userModel.findUserByAuthNo(user.authNo);
      if (profileData.length > 0) {
        res.status(200).json({ profileData });
      } else {
        // remove values and add dummy values
        const profileData = {
          AuthNo: "null",
          AuthCode: "null",
          AuthName: "admin",
          Email: "adminccaportal@cdac.in",
          Organization: "admin",
          Address: "CDAC Bengaluru ,E-city",
          State: "KA",
          Postal_Code: "560100",
        };
        res.status(200).json({ profileData: [profileData] });
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
      // const profile = await userModel.findUserByUsername(user.username);
      const total = await userModel.getNumberofCertificates(user.authNo);
      const count = await userModel.getProfileStatus(user.authNo);

      res.status(200).json({ count, total });
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
    if (!passwordMatch) {
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
      const remark = userExist[0].UserName + " Updated their password!";
      await userModel.updateStatus(
        userExist[0].UserName,
        "active",
        2,
        new Date().toISOString().replace("T", " ").slice(0, 19)
      );
      await userModel.logUserAction(
        userExist[0].UserName,
        new Date().toISOString().replace("T", " ").slice(0, 19),
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
          remark = "Updated Authcode and Name of authority " + authName;
        }
        userModel.logUserAction(
          "Admin",
          new Date().toISOString().replace("T", " ").slice(0, 19),
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

async function updateRegion(req, res) {
  const filePath = "backend/" + statesByRegionPath;
  try {
    const allRegions = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(allRegions);

    const { region, newValue } = req.body;

    if (data[region]) {
      data[newValue] = data[region];
      delete data[region]; // Remove the old key

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
      res.json({ message: "Key updated successfully" });
    } else {
      res.status(404).send(`Key "${oldKey}" not found.`);
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
}

async function updateStatesOfRegion(req, res) {
  const filePath = "backend/" + statesByRegionPath;
  try {
    const allRegions = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(allRegions);

    const { region, state, newLabel, newValue, oldValue } = req.body;
    //console.log('Update state Request Body:', req.body); // Check incoming request

    if (region === "unassigned") {
      if (state) {
        // If state is provided, delete the state from 'unassigned'
        const index = data[region].findIndex((item) => item.value === state);
        if (index !== -1) {
          data[region].splice(index, 1);
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
          return res.json({
            message: "State deleted successfully from unassigned",
          });
        } else {
          console.log("State not found in unassigned");
          return res.status(404).send("State not found in unassigned region");
        }
      } else {
        // If state is not provided, handle addition of new state
        data[region].push({ label: newLabel, value: newValue });
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
        return res.json({ message: "State added successfully" });
      }
    } else {
      // Handle other regions (adding or updating states)
      if (data[region]) {
        if (oldValue === null) {
          // Add new state to the region
          data[region].push({ label: newLabel, value: newValue });
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
          return res.json({ message: "Added successfully" });
        } else {
          // Update existing state
          const index = data[region].findIndex(
            (item) => item.label === oldValue
          );
          if (index !== -1) {
            data[region][index] = { label: newLabel, value: newValue };
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
            return res.json({ message: "Updated successfully" });
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
  const filePath = "backend/" + statesByRegionPath;

  try {
    const allRegions = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(allRegions);

    const { region, state, action, newRegion } = req.body;
    console.log("moveStatesOfRegion Request Body:", req.body);

    if (action !== "add" && action !== "remove") {
      console.log("Invalid action");
      return res.status(400).send("Invalid action");
    }

    if (!data[newRegion]) {
      console.log("New region not found");
      return res.status(404).send("New region not found");
    }

    if (!data[region]) {
      console.log("Current region not found");
      return res.status(404).send("Current region not found");
    }

    const index = data[region].findIndex((item) => item.value === state);

    if (index === -1) {
      console.log("State not found in the current region");
      return res.status(404).send("State not found in the current region");
    }

    //hello
    if (action === "remove") {
      if (!data[region]) {
        console.log("Region not found:", region);
        return res.status(404).send("Region not found");
      }

      const index = data[region].findIndex((item) => item.value === state);

      if (index === -1) {
        console.log("State not found in the current region");
        return res.status(404).send("State not found in the current region");
      }

      // Remove the state from the current region
      const [removedState] = data[region].splice(index, 1);

      // Add the removed state to the 'unassigned' region
      if (!data["unassigned"]) {
        data["unassigned"] = [];
      }
      data["unassigned"].push(removedState);

      // Write the updated data back to the file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

      return res.json({
        message: "State moved to unassigned region successfully",
      });
    }
    //hello end

    const [movedItem] = data[region].splice(index, 1);

    const index2 = data[newRegion].findIndex((item) => item.value === state);

    if (index2 !== -1) {
      console.log("State already exists in the new region");
      return res
        .status(400)
        .json({ error: "State already exists in the new region" });
    }

    // Add the state to the new region whether action is 'add' or 'move'
    data[newRegion].push(movedItem);

    try {
      const updatedData = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, updatedData, "utf8");
      res.json({ message: "Updated successfully" });
    } catch (error) {
      console.error("Error writing to file:", error);
      res.status(500).json({ error: "Failed to write to file" });
    }
  } catch (err) {
    console.error("Error", err);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
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

// subjectType.json

const subTypePath = "../public/subjectType.json";
async function getSubType(req, res) {
  try {
    const distinctSubTypes = await userModel.getSubjectTypes();

    const result = distinctSubTypes.map((item) => ({
      label: item.Subject_Type,
      value: item.Subject_Type,
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

async function generateAuthCode(req, res) {
  try {
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
    const randomString = generateRandomString(20);
    res
      .status(200)
      .json({ authCode: randomString, message: "Successfully generated" });
  } catch (err) {
    console.error("Error generating auth code: ", err);
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
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
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
async function emailService(req, res) {
  const email = req.body.email;
  email.toLowerCase();
  const Sender = process.env.ID || "";
  const Secret = process.env.SECRET || "";
  const pass = generatePassword(12);

  try {
    const exist = await userModel.setTemporaryPass(email, pass);
    if (exist) {
      console.log("password: " + pass);
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
        subject: "Reset Password",
        text: `Dear Sir/Ma'am
        we have received a request to change the password on yout certStore account.Please use the temporary password ${pass} for your account. Kindly change the password on your account after logging in.
        Thanks and Regards, 
        Admin 
        Certstore`,
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
module.exports = {
  signupController,
  landingPage,
  login,
  dashboard,
  logout,
  userDetails,
  userSessionInfo,
  certDetails,
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
  getAllAuths,
  updateAuths,
  region,
  getStatesByRegion,
  viewStatesByRegion,
  addRegion,
  updateRegion,
  updateStatesOfRegion,
  moveStatesOfRegion,
  removeRegion,
  getSubType,
  getAllRevocationReasons,
  generateAuthCode,
  certInfo,
  emailService,
};
