const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const forge = require("node-forge");
require("dotenv").config();
const fs = require('fs');

const TOKEN_FILE = "tokens.json";
let refreshTokens = {};

if (fs.existsSync(TOKEN_FILE)) {
  refreshTokens = JSON.parse(fs.readFileSync(TOKEN_FILE));
}

const saveTokensToFile = () => {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(refreshTokens));
};

const generateAccessToken = (userName, role, authNo) => {
  return jwt.sign(
    { username: userName, role: role, userId: authNo },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30m" }
  ); // Access token expires in 15 minutes
};

const generateRefreshToken = (userName, role) => {
  const refreshToken = jwt.sign(
    { username: userName, role: role },
    process.env.REFRESH_TOKEN_SECRET
  );
  refreshTokens[userName] = refreshToken; // Store refresh token
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
  if (userExist.status == "inactive") {
    const currentTime = new Date();
    console.log("currentTime: ", currentTime);
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
      return res.json({ accessToken, refreshToken });
    } else {
      // Failed login attempt
      if (userExist[0].attempts > 0) {
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

async function dashboard(req, res) {
  if (req.session) {
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
  } else {
    return res.redirect("/");
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
async function refreshToken(){
  const refreshToken = req.cookies.refreshToken;
  const username = req.body.username; // Assuming username is sent with the request

  if (!refreshToken || refreshTokens[username] !== refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required or invalid' });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    const accessToken = generateAccessToken({ username: user.username });
    res.json({ accessToken });
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
    const certDetails = await userModel.getCertData();
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
    const usageDetails = await userModel.getCertUsageData();
    res.json(usageDetails);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error." });
  }
}
async function fetchLogsData(req, res) {
  try {
    const logsDetails = await userModel.getLogsData();
    res.json(logsDetails);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error." });
  }
}
async function profileData(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });

  const profileData = await profileData;
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
  profileData,
  refreshToken
};
