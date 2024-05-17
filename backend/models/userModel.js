const db = require("../config/db");
const bcrypt = require("bcrypt");

const saltRounds = 10;

//authenticate user

async function authenticateUser(req, res, next) {
  // console.log("session: ", req.session)
  if (!req.session || !req.session.username) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // You might want to validate the session further, e.g., check if the user still exists in the database
  const userExist = await findUserByUsername(req.session.username);

  if (!userExist.length) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // You can attach user information to the request for future route handlers
  req.user = userExist[0];
  next();
}

function findUserByUsername(username) {
  const query = "SELECT * FROM login WHERE username = ?";
  return db.executeQuery(query, [username]);
}
async function createUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const query = "INSERT INTO login (username, password) VALUES (?,?)";
  return db.executeQuery(query, [username, hashedPassword]);
}
async function logUserAction(
  sessionID,
  userId,
  action,
  ip,
  latitude,
  longitude,
  timeStamp
) {
  const query =
    "INSERT INTO logs (session_id,user_id, action,ip_address, latitude,longitude,timestamp) VALUES (?, ?, ?, ?, ?, ?,?)";
  try {
    await db.executeQuery(query, [
      sessionID,
      userId,
      action,
      ip,
      latitude,
      longitude,
      timeStamp,
    ]);
  } catch (err) {
    console.log("Error while logging: ", err);
  }
}

async function getCertData() {
  try {
    const query =
      "SELECT c.serial_number AS cert_serial_no, s.subj_CN AS subject_name, s.subj_ST AS subject_state, i.issuer_CN AS issuer_name, c.issue_date, c.expiry_date FROM Certificate c JOIN Subject s ON c.subj_srNo = s.subj_srNo JOIN Issuer_Certificate ic ON c.issuer_cert_srNo = ic.issuer_cert_srNo JOIN Issuer i ON ic.issuer_ID = i.issuer_id ORDER BY c.issue_date DESC";
    return db.executeQuery(query);
  } catch (e) {
    console.log("Error while fetching certificate details: ", e);
  }
}
async function getRevokedCertData(filterCriteria) {
  try {
    let query = "SELECT * FROM revocation_data WHERE 1=1";
    if (filterCriteria) {
      if (filterCriteria.reason && filterCriteria.reason.length > 0) {
        const reasons = filterCriteria.reason.map(reason => `'${reason}'`).join(",");
        query += ` AND reason IN (${reasons})`;
      }
      if (filterCriteria.startDate && filterCriteria.endDate) {
        query += ` AND revoke_date_time BETWEEN '${filterCriteria.startDate}' AND '${filterCriteria.endDate}'`;
      }
    }
    console.log("Query to execute:", query);
    const result = await db.executeQuery(query);
    console.log("Result:", result);
    return result;
  } catch (e) {
    console.log("Error while fetching certificate details: ", e);
    throw e; 
  }
}
async function getCertUsageData() {
  try {
    const query = "SELECT * FROM cert_usage";
    return db.executeQuery(query);
  } catch (e) {
    console.log("Error while fetching certificate details: ", e);
  }
}
async function getLogsData() {
  try {
    const query = "SELECT * FROM logs";
    return db.executeQuery(query);
  } catch (e) {
    console.log("Error while fetching certificate details: ", e);
  }
}

async function updateStatus(username, status, timestamp) {
  try {
    const query =
      "UPDATE login SET status = ? ,last_attempt = ? WHERE username = ?";
    return db.executeQuery(query, [status, timestamp, username]);
  } catch (e) {
    console.log("Error while fetching user: ", e);
  }
}
async function updateAttempts(username, attempts) {
  try {
    const query = "UPDATE login SET attempts = ? WHERE username = ?";
    return db.executeQuery(query, [attempts, username]);
  } catch (e) {
    console.log("Error while fetching user: ", e);
  }
}

module.exports = {
  findUserByUsername,
  createUser,
  logUserAction,
  authenticateUser,
  getCertData,
  getRevokedCertData,
  getCertUsageData,
  getLogsData,
  updateStatus,
  updateAttempts,
};
