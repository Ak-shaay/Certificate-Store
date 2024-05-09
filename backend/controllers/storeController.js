const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fsPromises = require("fs").promises;
const path = require("path");
require("dotenv").config();

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
    const timeDifferenceMs = currentTime - userExist.last_attempt;
    const timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60); // 1000 milliseconds * 60 seconds * 60 minutes

    // Check if the time difference is greater than 24 hours
    if (timeDifferenceHours > 24) {
      //updates the database
      await userModel.updateStatus(userExist.username, "active");
      await userModel.updateAttempts(userExist.username, 2);
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
    const storedHashedPassword = userExist[0].password;
    const passwordMatch = await bcrypt.compare(password, storedHashedPassword);
    if (passwordMatch && (await loginAttempt(userExist[0]))) {
      try {
        //create jwt
        const accessToken = jwt.sign(
          { username: userExist[0].username, role: userExist[0].role, userId: userExist[0].login_id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "300s" }
        );
        const refreshToken = jwt.sign(
          { username: userExist[0].username, role: userExist[0].role },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "1d" }
        );
        req.session.username = userExist[0].username;
        req.session.userid = userExist[0].id; // Store user information in the session
        req.session.userRole = userExist[0].role;
        await userModel.updateAttempts(req.session.username, 2); //update attempt if login is successful
        await userModel.logUserAction(
          req.sessionID,
          userExist[0].login_id,
          "login",
          req.ip,
          latitude,
          longitude
        );
        res.json({ accessToken, refreshToken });
      } catch (err) {
        // console.log("err:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      try {
        if (userExist[0].attempts > 0) {
          let attempt = (userExist[0].attempts -= 1);
          userModel.updateAttempts(userExist[0].username, attempt);
        } else {
          userModel.updateStatus(userExist[0].username, "inactive");
          res.status(423).json({ timpeStamp: userExist[0].last_attempt });
        }
      } catch (err) {
        console.log("Error occurred", err);
      }
      res.status(501).json({ error: "Incorrect credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
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
  if (!certificateFile) {
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
    }
    // else{
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
    // }
    res.json({ ...Certificate });
  } catch (error) {
    console.error("Error parsing the certificate:", error.message);
    res.status(500).json({ error: "Error parsing the certificate." });
  }
}

async function logout(req, res) {
  
  console.log("Logout testing", req.body);
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ msg: "Error while logging out." });
    }
    userModel.logUserAction(
      req.sessionID,
      req.body.userID,
      "logout",
      req.ip,
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
    const revokedCertDetails = await userModel.getRevokedCertData();
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
};
