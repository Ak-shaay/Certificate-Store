const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fsPromises = require("fs").promises;
const path = require("path");
require('dotenv').config();

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

async function login(req, res) {
  const { username, password } = req.body;
  try {
    const userExist = await userModel.findUserByUsername(username);
    if (!userExist.length) {
      return res.status(400).json({ error: "User does not exist" });
    }
    const storedHashedPassword = userExist[0].password;
    const passwordMatch = await bcrypt.compare(password, storedHashedPassword);
    if (passwordMatch) {
      try {
        //create jwt
        const accessToken = jwt.sign(
          { username: userExist[0].username, role: userExist[0].role },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "300s" }
        );
        const refreshToken = jwt.sign(
          { username: userExist[0].username, role: userExist[0].role },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "1d" }
        );

        console.log("userExist[0]: ", userExist[0]);
        req.session.username = userExist[0].username;
        req.session.userid = userExist[0].id; // Store user information in the session
        req.session.userRole = userExist[0].role;
        await userModel.logUserAction(req.sessionID, userExist[0].id, "login");
        res.json({accessToken, refreshToken});
      } catch (err) {
        console.log("err:",err)
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      res.status(501).json({error: "Incorrect credentials"})
    }
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

async function dashboard(req, res) {
  console.log("Dashboard function is being called.")
  if (req.session) {
    console.log("req.session: ",req.session)
    if (req.session.views) {
      req.session.views++;
      res.send(`You have visited this page ${req.session.views} times`);
  } else {
      req.session.views = 1;
      console.log("session.views", req.session.views)
      res.send('Welcome to the session demo. Refresh the page to increment the visit count.');
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
  const userid = req.session.userid;
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({msg:"Error while logging out."})
    }
    userModel.logUserAction(req.sessionID, userid, "logout");
    res.status(200).json({msg:"Logged out successfully!"})
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
  fetchLogsData
};
