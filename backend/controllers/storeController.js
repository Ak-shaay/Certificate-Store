const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const forge = require("node-forge");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

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
    expiresIn: "15m",
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

async function signup(req, res) {
  const { username, password, role, authCode, file } = req.body;
  console.log("req.body: ", req.body);
  try {
    //check if user exist already
    const existingUser = await userModel.findUserByUsername(username);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User exist already" });
    } else {
      const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
      const passwordPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;
      if (!usernamePattern.test(username)) {
        return res.status(400).json({ error: "Invalid username" });
      }

      if (!passwordPattern.test(password)) {
        return res.status(400).json({ error: "Invalid password" });
      }

      if (file && file.filepath) {
        try {
          const certData = fs.readFileSync(file.filepath);
          const cert = _pki.certificateFromAsn1(
            asn1.fromDer(certData.toString("binary"), false)
          );
          const serialNumber = cert.serialNumber;
          console.log("Certificate serial number: ", serialNumber);
        } catch (err) {}
      }
    }

    //creating new user
    // await createUser(username, password);
    res.render("login", { message: "Signup successful" });
  } catch (err) {
    console.error("Erro during signup: ", err);
    res.status(500).json({ error: "Internal server error" });
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
      await userModel.logUserAction(
        userExist[0].UserName,
        new Date().toISOString().replace("T", " ").slice(0, 19),
        req.ip,
        "login",
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
        return res.status(423).json({ timeStamp: userExist[0].LastAttempt });
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
      "logout",
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
          filterCriteria.validityStartDate = startDate;

          const validityStartDate = new Date(startDate);
          if (!isNaN(validityStartDate.getTime())) {
            filterCriteria.validityEndDate = addYears(
              validityStartDate,
              validity
            );
          } else {
            console.error("Invalid startDate format");
          }
        }
        const certDetails = await userModel.getCertData(
          filterCriteria,
          user.authNo
        );
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
    const logsDetails = await userModel.getLogsData(filterCriteria);
    res.json(logsDetails);
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
      const profileData = await userModel.findUserByUsername(user.username);
      res.status(200).json({ profileData });
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
    const { authorities, distinctRoles, AuthNo } =
      await userModel.getAllAuthsData();
    res.status(200).json({ authorities, distinctRoles, AuthNo });
  } catch (error) {
    console.error("Error fetching authorities & role data:", error);
    res.sendStatus(500);
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
    const result = Object.keys(allRegions).map((item) => ({
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
    if (!regions || !Array.isArray(regions)) {
      return res
        .status(400)
        .json({ error: "Invalid input, regions must be an array." });
    }
    const filePath = "backend/" + statesByRegionPath;
    const data = fs.readFileSync(filePath, "utf8");
    const allRegions = JSON.parse(data);

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

    const { region, oldValue, newLabel, newValue } = req.body;

    if (data[region]) {
      const index = data[region].findIndex((item) => item.label === oldValue);
      if (index !== -1) {
        data[region][index] = { label: newLabel, value: newValue };

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

        res.json({ message: "Updated successfully" });
      } else {
        res.status(404).send("Entry not found");
      }
    } else {
      res.status(404).send("Region not found");
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

    const { region, state, label, newRegion } = req.body;

    if (!data[newRegion]) {
      return res.status(404).send("Region not found");
    }

    if (!data[region]) {
      return res.status(404).send("New region not found");
    }

    const index = data[region].findIndex(
      (item) => item.label === state || item.value === label
    );

    if (index === -1) {
      return res.status(404).send("Entry not found in the current region");
    }

    const [movedItem] = data[region].splice(index, 1);

    const index2 = data[newRegion].findIndex(
      (item) => item.label === state || item.value === label
    );

    if (index2 !== -1) {
      return res
        .status(400)
        .json({ error: "Value already exists in the mentioned region" });
    }

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
    const filePath = "backend/" + subTypePath;

    const data = fs.readFileSync(filePath, "utf8");

    const subjectType = JSON.parse(data);
    res.json(subjectType);
  } catch (error) {
    console.error("Error processing the request:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
}

// add new subjectType to subjectType.json
async function addSubjectType(req, res) {
  const filePath = "backend/" + subTypePath;
  if (req.body.subject === "") {
    return res.status(400).json({ error: "Empty value" });
  } else {
    const value = req.body.subject;
    const subject = value[0].toUpperCase() + value.slice(1);
    const newValue = { label: subject, value: subject };

    try {
      const data = fs.readFileSync(filePath, "utf8");
      const jsonData = JSON.parse(data);

      // Check if the new value already exists
      const exists = jsonData.some(
        (item) => item.label === newValue.label || item.value === newValue.value
      );

      if (exists) {
        return res.status(400).json({ error: "Value already exists" });
      }

      jsonData.push(newValue);

      const updatedData = JSON.stringify(jsonData);

      fs.writeFileSync(filePath, updatedData, "utf8");

      res
        .status(200)
        .json({ message: "New value " + subject + " added successfully" });
    } catch (err) {
      console.error("Error processing the file:", err);

      // Error handling
      if (err.code === "ENOENT") {
        res.status(404).json({ error: "File not found" });
      } else if (err.name === "SyntaxError") {
        res.status(400).json({ error: "Invalid JSON format" });
      } else {
        res.status(500).json({ error: "An internal server error occurred" });
      }
    }
  }
}

async function removeSubType(req, res) {
  const { subject } = req.body;
  const filePath = "backend/" + subTypePath;

  if (req.body.subject === "") {
    return res.status(400).json({ error: "Empty value" });
  }
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const subjects = JSON.parse(data);

    const index = subjects.findIndex(item => item.label === subject);
    
    if (index === -1) {
      return res.status(404).json({ error: "SubjectType not found" });
    }
    subjects.splice(index, 1);

      const updatedData = JSON.stringify(subjects);

      fs.writeFileSync(filePath, updatedData, 'utf8');

      res.status(200).json({ message: "Subject Type deleted successfully" });

  } catch (err) {
    console.error("Error processing the file: ", err);
    res.status(500).json({ error: "Error processing the file" });
  }
}

// revocationReason.json

const revocationReasonPath = "../public/revocationReason.json";

async function getRevocationReason(req, res) {
  try {
    const filePath = "backend/" + revocationReasonPath;

    const data = fs.readFileSync(filePath, "utf8");

    const revocationReasons = JSON.parse(data);
    res.json(revocationReasons);
  } catch (error) {
    console.error("Error processing the request:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
}

async function addRevocationReason(req, res) {
  const filePath = "backend/" + revocationReasonPath;
  if (req.body.reason === "") {
    return res.status(400).json({ error: "Empty value" });
  } else {
    const value = req.body.reason;
    const reason = value[0].toUpperCase() + value.slice(1);
    const newValue = { label: reason, value: reason };

    try {
      const data = fs.readFileSync(filePath, "utf8");
      const jsonData = JSON.parse(data);

      // Check if the new value already exists
      const exists = jsonData.some(
        (item) => item.label === newValue.label || item.value === newValue.value
      );

      if (exists) {
        return res.status(400).json({ error: "Value already exists" });
      }

      jsonData.push(newValue);

      const updatedData = JSON.stringify(jsonData);

      fs.writeFileSync(filePath, updatedData, "utf8");

      res
        .status(200)
        .json({ message: "New value " + reason + " added successfully" });
    } catch (err) {
      console.error("Error processing the file:", err);

      // Error handling
      if (err.code === "ENOENT") {
        res.status(404).json({ error: "File not found" });
      } else if (err.name === "SyntaxError") {
        res.status(400).json({ error: "Invalid JSON format" });
      } else {
        res.status(500).json({ error: "An internal server error occurred" });
      }
    }
  }
}

async function removeRevReasons(req, res) {
  const { reason } = req.body;
  const filePath = "backend/" + revocationReasonPath;

  if (req.body.reason === "") {
    return res.status(400).json({ error: "Empty value" });
  }
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const reasons = JSON.parse(data);

    const index = reasons.findIndex(item => item.label === reason);
    
    if (index === -1) {
      return res.status(404).json({ error: "SubjectType not found" });
    }
    reasons.splice(index, 1);

      const updatedData = JSON.stringify(reasons);

      fs.writeFileSync(filePath, updatedData, 'utf8');

      res.status(200).json({ message: "Reason Type deleted successfully" });

  } catch (err) {
    console.error("Error processing the file: ", err);
    res.status(500).json({ error: "Error processing the file" });
  }
}

module.exports = {
  signup,
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
  region,
  getStatesByRegion,
  viewStatesByRegion,
  updateRegion,
  updateStatesOfRegion,
  moveStatesOfRegion,
  removeRegion,
  getSubType,
  addSubjectType,
  removeSubType,
  getRevocationReason,
  addRevocationReason,
  removeRevReasons,
};
