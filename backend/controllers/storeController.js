const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const forge = require("node-forge");
require("dotenv").config();
const fs = require("fs");

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
  const { username, password } = req.body;
  try {
    //check if user exist already
    const existingUser = await userModel.findUserByUsername(username);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User exist already" });
    }

    //creating new user
    await userModel.createUser(username, password);
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
        userExist[0].Role
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
  let Certificate = {};
  if (certificateFile == null) {
    res.status(400).json({ error: "Certificate file is required." });
    return;
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
      Certificate = {
        serialNo: parsedCertificate.serialNumber,
        commonName: parsedCertificate.subject.attributes[7].value,
        country: parsedCertificate.subject.attributes[0].value,
        state: parsedCertificate.subject.attributes[4].value,
        region: parsedCertificate.subject.attributes[5].value,
        issuer: parsedCertificate.subject.attributes[2].value,
        validity: parsedCertificate.validity.notAfter,
        hash: parsedCertificate.subject.hash,
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
  try {
    const {
      issuer,
      state,
      region,
      startDate,
      endDate,
      validityStartDate,
      validityEndDate,
    } = req.body;
    const filterCriteria = {};

    if (issuer && issuer.length > 0) {
      filterCriteria.issuers = issuer;
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
    if (validityStartDate && validityEndDate) {
      filterCriteria.validityStartDate = validityStartDate;
      filterCriteria.validityEndDate = validityEndDate;
    }
    const certDetails = await userModel.getCertData(filterCriteria);
    res.json(certDetails);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error." });
  }
}
async function fetchRevokedData(req, res) {
  try {
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
      filterCriteria
    );

    res.json(revokedCertDetails);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error." });
  }
}
async function fetchUsageData(req, res) {
  try {
    const { usage, startDate, endDate } = req.body;
    const filterCriteria = {};
    if (usage && usage.length > 0) {
      filterCriteria.usage = usage;
    }
    if (startDate && endDate) {
      filterCriteria.startDate = startDate;
      filterCriteria.endDate = endDate;
    }
    const usageDetails = await userModel.getCertUsageData(filterCriteria);
    res.json(usageDetails);
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
      console.error("Error fetching profile data:", error);
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
      const total = await userModel.getNumberofCertificates(user.authNo)
      const count = await userModel.getProfileStatus(user.authNo)

      res.status(200).json({count,total});
    } catch (error) {
      console.error("Error fetching profile data:", error);
      res.sendStatus(500);
    }
  });
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
};
