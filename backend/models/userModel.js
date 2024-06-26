const db = require("../config/db");
const bcrypt = require("bcrypt");
const regionMap = require("../config/regionMap");
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
  const query = "SELECT * FROM login WHERE UserName = ?";
  return db.executeQuery(query, [username]);
}
async function createUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const query = "INSERT INTO login (username, password) VALUES (?,?)";
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
      "SELECT c.serial_number AS cert_serial_no, s.subj_CN AS subject_name, s.subj_ST AS subject_state, i.issuer_CN AS issuer_name, c.issue_date, c.expiry_date FROM Certificate c JOIN Subject s ON c.subj_srNo = s.subj_srNo JOIN Issuer_Certificate ic ON c.issuer_cert_srNo = ic.issuer_cert_srNo JOIN Issuer i ON ic.issuer_ID = i.issuer_id WHERE 1=1 ";
      if (filterCriteria) {
        if (filterCriteria.issuers && filterCriteria.issuers.length > 0) {
          const issuers = filterCriteria.issuers.map(issuer => `'${issuer}'`).join(",");
          query += ` AND  i.issuer_CN IN (${issuers})`;
        }
        if (filterCriteria.states && filterCriteria.states.length > 0) {
          const states = filterCriteria.states.map(state => `'${state}'`).join(",");
          query += ` AND s.subj_ST IN (${states})`;
        }
        if (filterCriteria.regions && filterCriteria.regions.length > 0) {
          query += ` AND s.subj_ST IN (${regionMap(filterCriteria.regions)})`;
        }
        if (filterCriteria.startDate && filterCriteria.endDate) {
          query += ` AND c.issue_date BETWEEN '${filterCriteria.startDate}' AND '${filterCriteria.endDate}'`;
        }
        if (filterCriteria.validityStartDate && filterCriteria.validityEndDate) {
          query += ` AND c.issue_date BETWEEN '${filterCriteria.validityStartDate}' AND '${filterCriteria.validityEndDate}'`;
        }
      }
      query += "ORDER BY c.issue_date DESC"
      const result = await db.executeQuery(query);
    return result;
  } catch (e) {
    console.log("Error while fetching certificate details: ", e);
  }
}
async function getRevokedCertData(filterCriteria) {
  try {
    let query = "SELECT * FROM revocation_data WHERE 1=1";
    if (filterCriteria) {
      if (filterCriteria.reason && filterCriteria.reason.length > 0) {
        const reasons = filterCriteria.reason
          .map((reason) => `'${reason}'`)
          .join(",");
        query += ` AND reason IN (${reasons})`;
      }
      if (filterCriteria.startDate && filterCriteria.endDate) {
        query += ` AND revoke_date_time BETWEEN '${filterCriteria.startDate}' AND '${filterCriteria.endDate}'`;
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
    let query = "SELECT * FROM cert_usage WHERE 1=1";
    if (filterCriteria) {
      if (filterCriteria.usage && filterCriteria.usage.length > 0) {
        const usages = filterCriteria.usage.map(usage => `'${usage}'`).join(",");
        query += ` AND remark IN (${usages})`;
      }
      if (filterCriteria.startDate && filterCriteria.endDate) {
        query += ` AND time_stamp BETWEEN '${filterCriteria.startDate}' AND '${filterCriteria.endDate}'`;
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
    let query = "SELECT * FROM logs WHERE 1=1";
    if (filterCriteria) {
      if (filterCriteria.users && filterCriteria.users.length > 0) {
        const users = filterCriteria.users.map(user => `'${user}'`).join(",");
        query += ` AND user_id IN (${users})`;
      }
      if (filterCriteria.actions && filterCriteria.actions.length > 0) {
        const actions = filterCriteria.actions.map(action => `'${action}'`).join(",");
        query += ` AND action IN (${actions})`;
      }
      
      if (filterCriteria.startDate && filterCriteria.endDate) {
        query += ` AND revoke_date_time BETWEEN '${filterCriteria.startDate}' AND '${filterCriteria.endDate}'`;
      }
    }
    query += " ORDER BY timestamp DESC"
      const result = await db.executeQuery(query);
    return result;
  } catch (e) {
    console.log("Error while fetching certificate details: ", e);
  }
}

async function updateStatus(username, status, attempts, timestamp) {
  try {
    const query =
      "UPDATE login SET LoginStatus = ? , Attempts = ?,LastAttempt = ? WHERE UserName = ?";
    return db.executeQuery(query, [status, attempts, timestamp, username]);
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
