const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const regionMap = require("../config/regionMap");
const saltRounds = 10;

//authenticate user

async function authenticateUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  else{
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Forbidden
      }
      req.user = user; // Add the decoded user information to the request object
      next();
  });
}
}
function findUserByUsername(username) {
  const query = "SELECT * FROM Login WHERE UserName = ?";
  return db.executeQuery(query, [username]);
}
async function createUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const query = "INSERT INTO login (UserName, Password,Role,AuthNo) VALUES (?,?,?,?)";
  return db.executeQuery(query, [username, hashedPassword]);
}
async function logUserAction(
  UserName,
  timeStamp,
  ip,
  Action,
  latitude,
  longitude
) {
  const query =
    "INSERT INTO logs (UserName, TimeStamp, IpAddress, ActionType, Lattitude, Longitude) VALUES (?, ?, ?, ?, ?, ?)";
  try {
    await db.executeQuery(query, [
      UserName,
      timeStamp,
      ip,
      Action,
      latitude,
      longitude,
    ]);
  } catch (err) {
    console.log("Error while logging: ", err);
  }
}

async function getCertData(filterCriteria) {
  try {
    let query =
      "SELECT c.SerialNumber AS cert_serial_no, c.Subject_CommonName AS subject_name, c.Subject_ST AS subject_state, c.IssuerCommonName AS issuer_name, c.IssueDate AS issue_date, c.ExpiryDate AS expiry_date,rd.RevokeDateTime AS revoke_date_time,rd.Reason AS reason FROM Cert c LEFT JOIN Revocation_Data rd ON c.SerialNumber = rd.SerialNumber AND rd.IssuerCert_srno = c.IssuerCert_srno AND rd.IssuerCommonName = c.IssuerCommonName WHERE 1=1  ";
      if (filterCriteria) {
        if (filterCriteria.issuers && filterCriteria.issuers.length > 0) {
          const issuers = filterCriteria.issuers.map(issuer => `'${issuer}'`).join(",");
          query += ` AND  c.IssuerCommonName IN (${issuers})`;
        }
        if (filterCriteria.states && filterCriteria.states.length > 0) {
          const states = filterCriteria.states.map(state => `'${state}'`).join(",");
          query += ` AND c.Subject_ST (${states})`;
        }
        if (filterCriteria.regions && filterCriteria.regions.length > 0) {
          query += ` AND c.Subject_ST (${regionMap(filterCriteria.regions)})`;
        }
        if (filterCriteria.startDate && filterCriteria.endDate) {
          query += ` AND c.IssueDate BETWEEN '${filterCriteria.startDate}' AND '${filterCriteria.endDate}'`;
        }
        if (filterCriteria.validityStartDate && filterCriteria.validityEndDate) {
          query += ` AND c.IssueDate BETWEEN '${filterCriteria.validityStartDate}' AND '${filterCriteria.validityEndDate}'`;
        }
      }
      query += "ORDER BY c.IssueDate DESC"
      const result = await db.executeQuery(query);
    return result;
  } catch (e) {
    console.log("Error while fetching certificate details: ", e);
  }
}
async function getRevokedCertData(filterCriteria) {
  try {
    let query = "SELECT SerialNumber AS serial_number, RevokeDateTime AS revoke_date_time, Reason AS reason FROM Revocation_Data WHERE 1=1";
    if (filterCriteria) {
      if (filterCriteria.reason && filterCriteria.reason.length > 0) {
        const reasons = filterCriteria.reason
          .map((reason) => `'${reason}'`)
          .join(",");
        query += ` AND Reason IN (${reasons})`;
      }
      if (filterCriteria.startDate && filterCriteria.endDate) {
        query += ` AND RevokeDateTime BETWEEN '${filterCriteria.startDate}' AND '${filterCriteria.endDate}'`;
      }
    }
    const result = await db.executeQuery(query);
    return result;
  } catch (e) {
    console.log("Error while fetching certificate details: ", e);
    throw e;
  }
}
async function getCertUsageData(filterCriteria) {
  try {
    let query = "SELECT SerialNumber AS serial_number, UsageDate AS time_stamp, Remark AS remark, Count AS count FROM Cert_Usage WHERE 1=1";
    if (filterCriteria) {
      if (filterCriteria.usage && filterCriteria.usage.length > 0) {
        const usages = filterCriteria.usage.map(usage => `'${usage}'`).join(",");
        query += ` AND Remark IN (${usages})`;
      }
      if (filterCriteria.startDate && filterCriteria.endDate) {
        query += ` AND UsageDate BETWEEN '${filterCriteria.startDate}' AND '${filterCriteria.endDate}'`;
      }
    }

    const result = await db.executeQuery(query);
    return result;
  } catch (e) {
    console.log("Error while fetching certificate details: ", e);
  }
}
async function getLogsData(filterCriteria) {
  try {
    let query = "SELECT LogsSrNo AS id, UserName AS user_id, TimeStamp AS timestamp, IpAddress AS ip_address, ActionType AS action, Remark, Lattitude, Longitude FROM Logs WHERE 1=1";
    if (filterCriteria) {
      if (filterCriteria.users && filterCriteria.users.length > 0) {
        const users = filterCriteria.users.map(user => `'${user}'`).join(",");
        query += ` AND UserName IN (${users})`;
      }
      if (filterCriteria.actions && filterCriteria.actions.length > 0) {
        const actions = filterCriteria.actions.map(action => `'${action}'`).join(",");
        query += ` AND ActionType IN (${actions})`;
      }
      
      if (filterCriteria.startDate && filterCriteria.endDate) {
        query += ` AND TimeStamp BETWEEN '${filterCriteria.startDate}' AND '${filterCriteria.endDate}'`;
      }
    }
    query += " ORDER BY TimeStamp DESC"
      const result = await db.executeQuery(query);
    return result;
  } catch (e) {
    console.log("Error while fetching certificate details: ", e);
  }
}

async function updateStatus(username, status, attempts, timestamp) {
  try {
    const query =
      "UPDATE Login SET LoginStatus = ? , Attempts = ?,LastAttempt = ? WHERE UserName = ?";
    return db.executeQuery(query, [status, attempts, timestamp, username]);
  } catch (e) {
    console.log("Error while fetching user: ", e);
  }
}
async function updateAttempts(username, attempts) {
  try {
    const query = "UPDATE Login SET Attempts = ? WHERE UserName = ?";
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
