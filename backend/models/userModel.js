const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const regionMap = require("../config/regionMap");
const saltRounds = 10;

//authenticate user

async function authenticateUser(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  } else {
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
// changed for account section
function findUserByAuthNo(authNo) {
  const query = "SELECT * FROM authorities WHERE AuthNo = ?";
  return db.executeQuery(query, [authNo]);
}

async function createUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const query =
    "INSERT INTO login (UserName, Password,Role,AuthNo) VALUES (?,?,?,?)";
  return db.executeQuery(query, [username, hashedPassword]);
}
async function logUserAction(
  UserName,
  timeStamp,
  ip,
  Action,
  Remark,
  latitude,
  longitude
) {
  const query =
    "INSERT INTO logs (UserName, TimeStamp, IpAddress, ActionType, Remark, Lattitude, Longitude) VALUES (?, ?, ?, ?, ?, ?, ?)";
  try {
    ip = ip.toString().replace("::ffff:", "");
    await db.executeQuery(query, [
      UserName,
      timeStamp,
      ip,
      Action,
      Remark,
      latitude,
      longitude,
    ]);
  } catch (err) {
    console.log("Error while logging: ", err);
  }
}
async function getCertData(filterCriteria, authNo) {
  try {
    let query = "";
    if (authNo == 1 || authNo == null) {
      query =
        "SELECT SerialNumber,Subject_CommonName,Subject_ST,IssuerCert_SrNo,IssuerCommonName,IssueDate, ExpiryDate,subject_Type,RawCertificate FROM cert WHERE 1=1";
    } else {
      query =
        "WITH RECURSIVE CERTLIST AS ( SELECT SerialNumber,Subject_CommonName,Subject_ST,IssuerCert_SrNo,IssuerCommonName,IssueDate, ExpiryDate,subject_Type,RawCertificate FROM cert WHERE IssuerCert_SrNo IN (Select SerialNumber from auth_cert where AuthNo = ? )union ALL SELECT c.SerialNumber,c.Subject_CommonName,c.Subject_ST,c.IssuerCert_SrNo,c.IssuerCommonName,c.IssueDate,c.ExpiryDate,c.subject_Type,c.RawCertificate FROM cert c JOIN CERTLIST cl on c.IssuerCert_SrNo = cl.SerialNumber) select * from CERTLIST WHERE 1=1 ";
    }
    if (filterCriteria) {
      if (filterCriteria.issuers && filterCriteria.issuers.length > 0) {
        const issuers = filterCriteria.issuers
          .map((issuer) => `'${issuer}'`)
          .join(",");
        query += ` AND IssuerCommonName IN (WITH RECURSIVE hierarchy AS ( SELECT c.Subject_CommonName FROM cert c WHERE c.IssuerCommonName in (${issuers}) or c.Subject_CommonName in (${issuers}) UNION ALL SELECT e.Subject_CommonName FROM cert e INNER JOIN hierarchy eh ON e.IssuerCommonName = eh.Subject_CommonName ) SELECT * FROM hierarchy)`;
      }
      if (filterCriteria.subjectType && filterCriteria.subjectType.length > 0) {
        const subjectTypes = filterCriteria.subjectType
          .map((state) => `'${state}'`)
          .join(",");
        query += ` AND subject_Type IN (${subjectTypes})`;
      }
      if (filterCriteria.states && filterCriteria.states.length > 0) {
        const states = filterCriteria.states
          .map((state) => `'${state}'`)
          .join(",");
        query += ` AND Subject_ST IN (${states})`;
      }
      if (filterCriteria.regions && filterCriteria.regions.length > 0) {
        query += ` AND Subject_ST IN (${regionMap(filterCriteria.regions)})`;
      }
      if (filterCriteria.startDate && filterCriteria.endDate) {
        query += ` AND IssueDate BETWEEN '${filterCriteria.startDate}' AND '${filterCriteria.endDate}'`;
      }
      // if (filterCriteria.validityStartDate && filterCriteria.validityEndDate) {
      //   query += ` AND ExpiryDate > '${filterCriteria.validityEndDate}'`;
      // }
      if (filterCriteria.validity && filterCriteria.validity != 0) {
        query += ` AND TIMESTAMPDIFF(YEAR, IssueDate, ExpiryDate) = '${filterCriteria.validity}'`;
      }
    }
    query += " ORDER BY IssueDate DESC";

    const result = await db.executeQuery(query, authNo);
    return result;
  } catch (e) {
    console.log("Error while fetching certificate details: ", e);
  }
}
async function getRevokedCertData(filterCriteria, authNo) {
  try {
    let query = "";
    if (authNo == 1 || authNo == null) {
      query =
        "SELECT SerialNumber AS serial_number,IssuerCommonName, RevokeDateTime AS revoke_date_time, Reason AS reason FROM Revocation_Data WHERE 1=1";
    } else {
      query =
        "SELECT SerialNumber AS serial_number,IssuerCommonName, RevokeDateTime AS revoke_date_time, Reason AS reason FROM Revocation_Data WHERE IssuerCert_SrNo IN (WITH RECURSIVE CERTLIST AS ( SELECT SerialNumber FROM auth_cert WHERE AuthNo = ? union ALL SELECT c.SerialNumber FROM cert c JOIN CERTLIST cl on c.IssuerCert_SrNo = cl.SerialNumber) select * from CERTLIST) AND 1=1";
    }
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
    const result = await db.executeQuery(query, authNo);
    return result;
  } catch (e) {
    console.log("Error while fetching certificate details: ", e);
    throw e;
  }
}
async function getCertUsageData(filterCriteria, authNo) {
  try {
    let query = "";
    if (authNo == 1 || authNo == null) {
      query =
        "SELECT CU.SerialNumber AS serial_number,C.Subject_CommonName AS subject_common_name,CU.IssuerCommonName, CU.UsageDate AS time_stamp,CU.Remark AS remark,CU.Count AS count FROM Cert_Usage CU INNER JOIN Cert C ON CU.SerialNumber = C.SerialNumber AND CU.IssuerCert_SrNo = C.IssuerCert_SrNo WHERE 1=1";
    } else {
      query =
        "SELECT CU.SerialNumber AS serial_number,C.Subject_CommonName AS subject_common_name,CU.IssuerCommonName, CU.UsageDate AS time_stamp,CU.Remark AS remark,CU.Count AS count FROM Cert_Usage CU INNER JOIN Cert C ON CU.SerialNumber = C.SerialNumber AND CU.IssuerCert_SrNo = C.IssuerCert_SrNo WHERE C.IssuerCert_SrNo IN (WITH RECURSIVE CERTLIST AS ( SELECT SerialNumber FROM auth_cert WHERE AuthNo = ? union ALL SELECT c.SerialNumber FROM cert c JOIN CERTLIST cl on c.IssuerCert_SrNo = cl.SerialNumber) select * from CERTLIST) AND 1=1";
    }
    if (filterCriteria) {
      if (filterCriteria.usage && filterCriteria.usage.length > 0) {
        const usages = filterCriteria.usage
          .map((usage) => `'${usage}'`)
          .join(",");
        query += ` AND Remark IN (${usages})`;
      }
      if (filterCriteria.startDate && filterCriteria.endDate) {
        query += ` AND UsageDate BETWEEN '${filterCriteria.startDate}' AND '${filterCriteria.endDate}'`;
      }
    }
    query += " ORDER BY CU.UsageDate DESC";
    const result = await db.executeQuery(query, authNo);
    return result;
  } catch (e) {
    console.log("Error while fetching certificate details: ", e);
  }
}
//logs data based on logins
async function getLogsData(filterCriteria, authNo) {
  try {
    let query = "";
    if (authNo == null) {
      query =
        "SELECT LogsSrNo AS id, UserName AS user_id, TimeStamp AS timestamp, IpAddress AS ip_address, ActionType AS action, Remark, Lattitude, Longitude FROM Logs WHERE 1=1";
    } else if (authNo == 1) {
      query =
        "SELECT LogsSrNo AS id, UserName AS user_id, TimeStamp AS timestamp, IpAddress AS ip_address, ActionType AS action, Remark, Lattitude, Longitude FROM Logs WHERE  UserName NOT IN (SELECT UserName from login WHERE AuthNo IS NULL)";
    } else {
      query =
        "SELECT LogsSrNo AS id, UserName AS user_id, TimeStamp AS timestamp, IpAddress AS ip_address, ActionType AS action, Remark, Lattitude, Longitude FROM Logs  WHERE UserName IN (SELECT UserName from login WHERE AuthNo = ?)";
    }
    if (filterCriteria) {
      if (filterCriteria.users && filterCriteria.users.length > 0) {
        const users = filterCriteria.users.map((user) => `'${user}'`).join(",");
        query += ` AND UserName IN (${users})`;
      }
      if (filterCriteria.actions && filterCriteria.actions.length > 0) {
        const actions = filterCriteria.actions
          .map((action) => `'${action}'`)
          .join(",");
        query += ` AND ActionType IN (${actions})`;
      }

      if (filterCriteria.startDate && filterCriteria.endDate) {
        query += ` AND TimeStamp BETWEEN '${filterCriteria.startDate}' AND '${filterCriteria.endDate}'`;
      }
    }
    query += " ORDER BY TimeStamp DESC";
    const result = await db.executeQuery(query, authNo);
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

async function getLastLogin(authNo) {
  try {
    const query =
      `SELECT l.*
FROM logs l
JOIN login lg ON l.UserName = lg.UserName
WHERE lg.AuthNo = 6 AND l.ActionType = 'login'
ORDER BY l.LogsSrNo DESC
LIMIT 1`;
    return db.executeQuery(query, [authNo]);
  } catch (e) {
    console.log("Error while fetching user: ", e);
  }
}
async function updatePassword(newPass, authNo) {
  try {
    if (authNo === null) {
      const hashedPassword = await bcrypt.hash(newPass, saltRounds);
      const updateQuery = "UPDATE login SET Password = ? WHERE Role = 'admin'";
      await db.executeQuery(updateQuery, [hashedPassword]);
      return {
        success: true,
        message: "Password updated for admin account successfully.",
      };
    } else {
      const query = "SELECT AuthCode FROM authorities WHERE AuthNo = ?";
      const [result] = await db.executeQuery(query, [authNo]);
      if (result.length === 0) {
        return { success: false, message: "Invalid authentication code." };
      }
      const hashedPassword = await bcrypt.hash(newPass, saltRounds);
      const updateQuery = "UPDATE login SET Password = ? WHERE AuthNo = ?";
      await db.executeQuery(updateQuery, [hashedPassword, authNo]);
      return { success: true, message: "Password updated successfully." };
    }
  } catch (err) {
    return { success: false, message: err };
  }
}

// function to get all authorities
function findAuthorities() {
  try {

    let query =
      'SELECT AuthName FROM authorities WHERE AuthName NOT LIKE "CCA"';
    return db.executeQuery(query);
  } catch (e) {
    console.log("Error while fetching data: ", e);
  }
}

async function getCardsData() {
  try {
    //  6 hours data
    let query = `
      WITH RECURSIVE hours AS (
    SELECT
        DATE_FORMAT(NOW() - INTERVAL 5 HOUR, '%Y-%m-%d %H:00:00') AS hour_start
    UNION ALL
    SELECT
        DATE_FORMAT(hour_start + INTERVAL 1 HOUR, '%Y-%m-%d %H:00:00')
    FROM hours
    WHERE hour_start < DATE_FORMAT(NOW(), '%Y-%m-%d %H:00:00')
)
SELECT 
    COALESCE(COUNT(c.IssueDate), 0) AS issued_records
FROM 
    hours h
LEFT JOIN 
    cert c
ON 
    DATE_FORMAT(c.IssueDate, '%Y-%m-%d %H:00:00') = h.hour_start
    AND c.IssueDate >= DATE_SUB(NOW(), INTERVAL 6 HOUR)
    AND c.IssueDate <= NOW()
GROUP BY 
    h.hour_start
ORDER BY 
    h.hour_start;
    `;
    let query2 = `
    WITH RECURSIVE hours AS (
    SELECT
        DATE_FORMAT(NOW() - INTERVAL 5 HOUR, '%Y-%m-%d %H:00:00') AS hour_start
    UNION ALL
    SELECT
        DATE_FORMAT(hour_start + INTERVAL 1 HOUR, '%Y-%m-%d %H:00:00')
    FROM hours
    WHERE hour_start < DATE_FORMAT(NOW(), '%Y-%m-%d %H:00:00')
)
SELECT 
    COALESCE(COUNT(r.RevokeDateTime), 0) AS rev_records
FROM 
    hours h
LEFT JOIN 
    revocation_data r
ON 
    DATE_FORMAT(r.RevokeDateTime, '%Y-%m-%d %H:00:00') = h.hour_start
    AND r.RevokeDateTime >= DATE_SUB(NOW(), INTERVAL 6 HOUR)
    AND r.RevokeDateTime <= NOW()
GROUP BY 
    h.hour_start
ORDER BY 
    h.hour_start;`;

    let query3 = `WITH RECURSIVE hours AS (
    SELECT
        DATE_FORMAT(NOW() - INTERVAL 5 HOUR, '%Y-%m-%d %H:00:00') AS hour_start
    UNION ALL
    SELECT
        DATE_FORMAT(hour_start + INTERVAL 1 HOUR, '%Y-%m-%d %H:00:00')
    FROM hours
    WHERE hour_start < DATE_FORMAT(NOW(), '%Y-%m-%d %H:00:00')
)
SELECT 
    h.hour_start,
    COALESCE(COUNT(cu.UsageDate), 0) AS used_records
FROM 
    hours h
LEFT JOIN 
    cert_usage cu
ON 
    DATE_FORMAT(cu.UsageDate, '%Y-%m-%d %H:00:00') = h.hour_start
    AND cu.UsageDate >= DATE_SUB(NOW(), INTERVAL 6 HOUR)
    AND cu.UsageDate <= NOW()
GROUP BY 
    h.hour_start
ORDER BY 
    h.hour_start;`;

    const issued = await db.executeQuery(query);
    const revoked = await db.executeQuery(query2);
    const used = await db.executeQuery(query3);
    const arr1 = [];
    const arr2 = [];
    const arr3 = [];
    for (i in issued) {
      arr1.push(issued[i].issued_records);
    }
    for (i in revoked) {
      arr2.push(revoked[i].rev_records);
    }
    for (i in used) {
      arr3.push(used[i].used_records);
    }
    const arr = [];
    arr.push(arr1, arr2, arr3);
    return arr;
  } catch (e) {
    console.log("Error while fetching data: ", e);
  }
}

async function getCompactCardData() {
  try {
    let query = `
    SELECT Count(*) as issuedCount
    FROM cert 
    WHERE IssueDate >= NOW() - INTERVAL 1 DAY
    UNION ALL
    SELECT Count(*)
    FROM cert `;
    const row1 = await db.executeQuery(query);
    // console.log("row1: " + row1[1].issuedCount);
    let query2 = `
    SELECT COUNT(*) as revokedCount
    FROM revocation_data 
    WHERE RevokeDateTime >= NOW() - INTERVAL 1 DAY
    UNION ALL
    SELECT Count(*)
    FROM revocation_data `;
    const row2 = await db.executeQuery(query2);
    let query3 = `
    SELECT COUNT(*) as usageCount
    FROM cert_usage  
    WHERE UsageDate >= NOW() - INTERVAL 1 DAY
    UNION ALL
    SELECT Count(*)
    FROM cert_usage `;
    const row3 = await db.executeQuery(query3);
    var result = [];
    result.push(
      row1[0].issuedCount,
      row1[1].issuedCount,
      row2[0].revokedCount,
      row2[1].revokedCount,
      row3[0].usageCount,
      row3[1].usageCount
    );
    return result;
  } catch (e) {
    console.log("Error while fetching count: ", e);
  }
}

async function getAllAuthsData() {
  const queryAuthorities = `SELECT a.*, l.username, l.password FROM authorities a JOIN login l ON a.authno = l.authno`;
  const queryDistinctRoles = `SELECT DISTINCT role FROM login`;
  try {
    const authoritiesResults = await db.executeQuery(queryAuthorities);
    const distinctRolesResults = await db.executeQuery(queryDistinctRoles);
    return {
      authorities: authoritiesResults,
      distinctRoles: distinctRolesResults,
    };
  } catch (e) {
    console.log("error fetching user data", e);
  }
}

async function updateAuthsData(authCode, authName, authNo) {
  const authQuery = `UPDATE authorities SET AuthCode = ?, AuthName = ? WHERE AuthNo = ?`;
  // const loginQuery = `UPDATE login SET password = ? WHERE authno = ?`;

  try {
    const result = await db.executeQuery(authQuery, [
      authCode,
      authName,
      authNo,
    ]);
    return result;
  } catch (e) {
    console.error("Error updating data:", e);
    throw new Error("Database error");
  }
}
async function getSubjectTypes() {
  const querySubtypes = `SELECT DISTINCT Subject_Type FROM cert`;
  try {
    const distinctSubtypes = await db.executeQuery(querySubtypes);
    return distinctSubtypes;
  } catch (e) {
    console.log("error fetching data", e);
  }
}

async function getRevocationReasons() {
  const queryDistinctReasons = `SELECT DISTINCT Reason FROM revocation_data`;
  try {
    const distinctReasonsResults = await db.executeQuery(queryDistinctReasons);
    return distinctReasonsResults;
  } catch (e) {
    console.log("error fetching data", e);
  }
}

async function getCertSerialNumber(serialNumber, issuerName) {
  const query = `Select * FROM cert WHERE SerialNumber = ? AND IssuerCommonName = ?`;
  try {
    const result = await db.executeQuery(query, [serialNumber, issuerName]);
    console.log("result of presence", result);

    if (result.length > 0) {
      return true;
    }
    return false;
  } catch (e) {
    console.log("Error while comparing certificate");
  }
}
async function getNextSerial() {
  const query = `SELECT MAX(Authno) + 1 AS next FROM authorities`;
  try {
    const result = await db.executeQuery(query);
    if (result.length > 0) {
      return result[0].next;
    }
    return null;
  } catch (e) {
    console.log("Error fetching Auth number");
    return null;
  }
}

async function signup(params) {
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
    authNo,
    authName,
    serialNumber,
  } = params;
  const query1 =
    "INSERT into authorities (AuthNo, AuthCode, AuthName, Email, Organization, Address, State, Postal_Code) VALUES (?, ?, ?,?,?, ?, ?,?)";
  const query2 =
    "INSERT into login (UserName, Password,LoginStatus, Attempts, Role, AuthNo) VALUES (?,?,?,?,?,?)";
  const query3 = "INSERT into auth_cert VALUES (?,?)";
  try {
    // Start a transaction
    const result = await new Promise((resolve, reject) => {
      db.pool.getConnection((err, connection) => {
        if (err) reject(err);
        else {
          connection.beginTransaction(async (err) => {
            if (err) {
              connection.release();
              reject(err);
            } else {
              try {
                // Execute queries
                await db.executeQuery(
                  query1,
                  [
                    authNo,
                    authCode,
                    authName,
                    email,
                    address,
                    organization,
                    state,
                    postalcode,
                  ],
                  connection
                );
                await db.executeQuery(
                  query2,
                  [username, password, "active", 2, role, authNo],
                  connection
                );
                await db.executeQuery(
                  query3,
                  [authNo, serialNumber],
                  connection
                );

                // Commit transaction
                connection.commit((err) => {
                  connection.release();
                  if (err) reject(err);
                  else {
                    // console.log("Saved to database");
                    resolve(true);
                    // return true;
                  }
                });
              } catch (error) {
                connection.rollback(() => {
                  connection.release();
                  reject(error);
                  // return false;
                });
              }
            }
          });
        }
      });
    });
    return result;
  } catch (error) {
    console.error("Transaction failed:", error);
    return false;
    // You might want to handle the error or notify the user here
  }
}

async function getCertInfo(serialNo, issuerCN) {
  const query = `SELECT * FROM cert WHERE SerialNumber = ? AND IssuerCommonName like ?`;
  try {
    const result = await db.executeQuery(query, [serialNo, issuerCN]);
    return result;
  } catch (e) {
    console.error("Error getting certificate information:", e.message);
    throw new Error("Database query failed");
  }
}

async function emailExists(email) {
  const query = `SELECT 1 FROM authorities WHERE Email = ?`;
  try {
    const result = await db.executeQuery(query, [email]);
    return result.length > 0;
  } catch (error) {
    console.error("Failed to check email existence:", error);
    return false; // Return false to indicate email doesn't exist.
  }
}

async function setTemporaryPass(email, password) {
  if (!(await emailExists(email))) {
    console.error("Email does not exist:", email);
    return false;
  }

  const query = `
   UPDATE login 
SET Password = ?, 
    LoginStatus = 'temporary', 
    Attempts = 1 
WHERE AuthNo = (SELECT AuthNo FROM authorities WHERE Email = ?)`;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.executeQuery(query, [hashedPassword, email]);

    if (result && result.affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Failed to set temporary password:", error);
    return { success: false, error: error.message };
  }
}

async function getEmail(userName) {
  const query = `SELECT Email FROM authorities WHERE AuthNo = (SELECT AuthNo FROM login WHERE UserName = ?)`;
  try {
    const result = await db.executeQuery(query, [userName]);
    
    if (result && result.length > 0) {
      return result[0].Email;
    } else {
      return ''; 
    }
  } catch (error) {
    console.error("Failed to retrieve email:", error);
    return false;
  }
}

async function getProfileStatus(userName) {
  const query = `SELECT LoginStatus FROM login WHERE UserName = ?`;
  try {
    const result = await db.executeQuery(query, [userName]);
    
    if (result && result.length > 0) {
      return result[0].LoginStatus;
    } else {
      return null 
    }
  } catch (error) {
    console.error("Failed to retrieve email:", error);
    return null;
  }
}

module.exports = {
  findUserByUsername,
  findUserByAuthNo,
  createUser,
  logUserAction,
  authenticateUser,
  getCertData,
  getRevokedCertData,
  getCertUsageData,
  getLogsData,
  updateStatus,
  updateAttempts,
  getProfileStatus,
  updatePassword,
  findAuthorities,
  getCardsData,
  getCompactCardData,
  getAllAuthsData,
  updateAuthsData,
  getSubjectTypes,
  getRevocationReasons,
  getCertSerialNumber,
  getNextSerial,
  signup,
  getCertInfo,
  emailExists,
  setTemporaryPass,
  getEmail,
  getProfileStatus,
  getLastLogin
};
