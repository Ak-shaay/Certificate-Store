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

async function authenticateAdmin(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Forbidden
      }
      if (user.role == "Admin") {
        req.user = user;
        // Add the decoded user information to the request object
        next();
      } else {
        return res.sendStatus(403);
      }
    });
  }
}

function findUserByUsername(email) {
  const query = "SELECT * FROM Login WHERE UserEmail = ?";
  return db.executeQuery(query, [email]);
}

async function findEmailByAuth(auth) {
  const isNull = auth === null;
  const query = isNull
    ? "SELECT DISTINCT UserEmail FROM login WHERE AuthNo IS NULL"
    : "SELECT DISTINCT UserEmail FROM login WHERE AuthNo = ?";
  const params = isNull ? [] : [auth];

  try {
    const result = await db.executeQuery(query, params);
    return result.map(row => row.UserEmail);
  } catch (error) {
    console.error("Error executing query:", error);
    return [];
  }
}

async function findBccEmailByAuth(auth) {
  const isNull = auth === null;
  const query = isNull
    ? "SELECT Email FROM authorities WHERE AuthNo IS NULL"
    : "SELECT Email FROM authorities WHERE AuthNo = ?";
  const params = isNull ? [] : [auth];

  try {
    const result = await db.executeQuery(query, params);
    return result.length > 0 ? result[0].Email : null;
  } catch (error) {
    console.error("Error executing query:", error);
    return null;
  }
}


function findOrgByCN(commonName) {
  const query = "SELECT * FROM Authorities WHERE AuthName = ?";
  return db.executeQuery(query, [commonName]);
}

// changed for account section
function findUserData(email) {
  const query =
    "SELECT L.UserEmail, L.Name,L.AuthNo, A.AuthName,A.Organization, A.Address, A.State, A.PostalCode FROM `login` AS L LEFT JOIN `authorities` AS A ON L.AuthNo = A.AuthNo WHERE L.UserEmail = ?;";
  return db.executeQuery(query, [email]);
}
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
// check for issuer certificate
async function checkCertificateInDatabase(certificate) {
  const { issuerSlNo, issuerName } = certificate;
  try {
    const query = `
      SELECT * FROM cert
      WHERE IssuerSlNo = ?
        AND IssuerName = ?
    `;
    const result = await db.executeQuery(query, [issuerSlNo, issuerName]);
    return result.length > 0;
  } catch (error) {
    console.error("error : ", error);
    return false;
  }
}

async function insertCertificate(certificate) {
  const {
    certSerialNumber,
    validFrom,
    validTo,
    certType,
    issuerSlNo,
    issuerName,
    country,
    organization,
    state,
    commonName,
    email,
    city,
    subjectType,
    fp,
    x509Cert,
    validityPeriod,
  } = certificate;

  // Validate the certificate object (you can add more validation here)
  // if (!certSerialNumber || !validFrom || !validTo || !certType) {
  //   throw new Error("Missing required certificate fields");
  // }

  const query = `
    INSERT INTO cert (
      SerialNumber, IssueDate, ExpiryDate, CertType, IssuerSlNo, IssuerName, Country, Organization, 
      State, SubjectName, Email, City, SubjectType, Fp_512, RawCertificate, CAname, ValidityPeriod
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    certSerialNumber, // SerialNumber
    validFrom, // IssueDate
    validTo, // ExpiryDate
    certType, // CertType
    issuerSlNo,
    issuerName,
    country,
    organization,
    state,
    commonName, // SubjectName
    email, // Email
    city,
    subjectType, // SubjectType
    fp, // Fp_512 (using hash)
    x509Cert,
    organization, // CAname
    validityPeriod, // ValidityPeriod
  ];

  try {
    const result = await db.executeQuery(query, values);
    return result && result.affectedRows > 0; // can directly return the result
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      throw new Error("Certificate already exists");
    }
    console.error("Error inserting certificate:", err);
    throw new Error("Error inserting certificate");
  }
}

async function logUserAction(
  UserName,
  ip,
  Action,
  Remark,
  latitude,
  longitude
) {
  const query =
    "INSERT INTO logs (UserEmail, IpAddress, ActionType, Remark, Lattitude, Longitude) VALUES (?, ?, ?, ?, ?, ?)";
  try {
    ip = ip.toString().replace("::ffff:", "");
    await db.executeQuery(query, [
      UserName,
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

async function getCertData(
  filterCriteria,
  authNo,
  rows,
  page,
  orderBy,
  order,
  noPagination = false
) {
  try {
    let query = constructBaseQuery(authNo);

    // Apply filters if they exist
    if (filterCriteria) {
      query = applyFilters(query, filterCriteria);
    }

    const validColumns = [
      "SerialNumber",
      "SubjectName",
      "State",
      "IssuerName",
      "IssueDate",
      "ExpiryDate",
      "SubjectType",
      "errorCount"
    ];

    // Determine valid sorting column and order
    const sortColumn = validColumns.includes(orderBy) ? orderBy : "IssueDate";
    const sortOrder = order === "desc" ? "desc" : "asc";

    // Add ORDER BY clause to the query
    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    // Get the total count of records (for pagination purposes)
    const countQuery = `SELECT COUNT(*) AS total FROM (${query}) AS subquery`;
    const count = await db.executeQuery(countQuery, authNo);

    // If noPagination is true, bypass pagination (LIMIT and OFFSET)
    if (!noPagination) {
      if (rows && page) {
        const offset = (page - 1) * rows;
        query += ` LIMIT ${rows} OFFSET ${offset}`;
      }
    }

    
    // Execute the final query and get the results
    const result = await db.executeQuery(query, authNo);
    return { result, count: count[0].total };
  } catch (e) {
    console.log("Error while fetching certificate details: ", e);
    throw new Error("Error fetching data from the database");
  }
}

// function constructBaseQuery(authNo) {
//   if (authNo == 1 || authNo == null) {
//     return "SELECT SerialNumber, SubjectName, State, IssuerSlNo, IssuerName, IssueDate, ExpiryDate, SubjectType, RawCertificate FROM cert WHERE 1=1";
//   } else {
//     return `
//       WITH RECURSIVE CERTLIST AS (
//         SELECT SerialNumber, SubjectName, State, IssuerSlNo, IssuerName, IssueDate, ExpiryDate, SubjectType, RawCertificate 
//         FROM cert 
//         WHERE IssuerSlNo IN (SELECT SerialNumber FROM auth_cert WHERE AuthNo = ?)
//         UNION ALL
//         SELECT c.SerialNumber, c.SubjectName, c.State, c.IssuerSlNo, c.IssuerName, c.IssueDate, c.ExpiryDate, c.SubjectType, c.RawCertificate
//         FROM cert c
//         JOIN CERTLIST cl ON c.IssuerSlNo = cl.SerialNumber
//       )
//       SELECT * FROM CERTLIST WHERE 1=1
//     `;
//   }
// }
// function constructBaseQuery(authNo) {
//   if (authNo == 1 || authNo == null) {
//     return `
//       SELECT 
//         c.ReqSerialNo, c.SerialNumber, c.SubjectName, c.State, c.IssuerSlNo, c.IssuerName, 
//         c.IssueDate, c.ExpiryDate, c.SubjectType, c.RawCertificate, 
//         COUNT(ce.errorCode) AS errorCount
//       FROM cert c
//       LEFT JOIN cert_error ce ON c.ReqSerialNo = ce.ReqSerialNo
//       WHERE 1=1
//       GROUP BY c.ReqSerialNo, c.SerialNumber, c.SubjectName, c.State, c.IssuerSlNo, c.IssuerName, 
//         c.IssueDate, c.ExpiryDate, c.SubjectType, c.RawCertificate
//     `;
//   } 
//   else {
//     return `
//       WITH RECURSIVE CERTLIST AS (
//         SELECT 
//           c.ReqSerialNo, c.SerialNumber, c.SubjectName, c.State, c.IssuerSlNo, c.IssuerName, 
//           c.IssueDate, c.ExpiryDate, c.SubjectType, c.RawCertificate
//         FROM cert c
//         WHERE c.IssuerSlNo IN (SELECT SerialNumber FROM auth_cert WHERE AuthNo = ?)
//         UNION ALL
//         SELECT c2.ReqSerialNo, c2.SerialNumber, c2.SubjectName, c2.State, c2.IssuerSlNo, c2.IssuerName, 
//           c2.IssueDate, c2.ExpiryDate, c2.SubjectType, c2.RawCertificate
//         FROM cert c2
//         JOIN CERTLIST cl ON c2.IssuerSlNo = cl.SerialNumber
//       )
//       SELECT 
//         cl.ReqSerialNo, cl.SerialNumber, cl.SubjectName, cl.State, cl.IssuerSlNo, cl.IssuerName, 
//         cl.IssueDate, cl.ExpiryDate, cl.SubjectType, cl.RawCertificate,
//         COUNT(ce.errorCode) AS errorCount
//       FROM CERTLIST cl
//       LEFT JOIN cert_error ce ON cl.ReqSerialNo = ce.ReqSerialNo
//       WHERE 1=1
//       GROUP BY cl.ReqSerialNo, cl.SerialNumber, cl.SubjectName, cl.State, cl.IssuerSlNo, cl.IssuerName, 
//         cl.IssueDate, cl.ExpiryDate, cl.SubjectType, cl.RawCertificate
//     `;
//   }
// }

// function applyFilters(query, filterCriteria) {
//   if (filterCriteria.issuers && filterCriteria.issuers.length > 0) {
//     query += applyIssuerFilter(filterCriteria.issuers);
//   }
//   if (filterCriteria.subjectType && filterCriteria.subjectType.length > 0) {
//     query += ` AND SubjectType IN (${filterCriteria.subjectType
//       .map((state) => `'${state}'`)
//       .join(",")})`;
//   }
//   if (filterCriteria.states && filterCriteria.states.length > 0) {
//     query += ` AND State IN (${filterCriteria.states
//       .map((state) => `'${state}'`)
//       .join(",")})`;
//   }
//   if (filterCriteria.regions && filterCriteria.regions.length > 0) {
//     query += ` AND State IN (${regionMap(filterCriteria.regions)})`;
//   }
//   if (
//     filterCriteria.selectedDate === "issued" &&
//     filterCriteria.startDate &&
//     filterCriteria.endDate
//   ) {
//     query += ` AND IssueDate BETWEEN '${filterCriteria.startDate}' AND '${filterCriteria.endDate}'`;
//   }
//   if (
//     filterCriteria.selectedDate === "expiry" &&
//     filterCriteria.startDate &&
//     filterCriteria.endDate
//   ) {
//     query += ` AND ExpiryDate BETWEEN '${filterCriteria.startDate}' AND '${filterCriteria.endDate}'`;
//   }
//   if (filterCriteria.validity && filterCriteria.validity !== 0) {
//     query += ` AND TIMESTAMPDIFF(YEAR, IssueDate, ExpiryDate) = '${filterCriteria.validity}'`;
//   }

//   return query;
// }


function constructBaseQuery(authNo) {
  if (authNo == 1 || authNo == null) {
    return `
      SELECT 
        c.ReqSerialNo, c.SerialNumber, c.SubjectName, c.State, c.IssuerSlNo, c.IssuerName, 
        c.IssueDate, c.ExpiryDate, c.SubjectType, c.RawCertificate, 
        COUNT(ce.ErrorCode) AS errorCount
      FROM cert c
      LEFT JOIN cert_error ce ON c.ReqSerialNo = ce.ReqSerialNo
      LEFT JOIN error e ON ce.ErrorCode = e.ErrorCode
      WHERE 1=1
    `;
  } else {
    return `
      WITH RECURSIVE CERTLIST AS (
        SELECT 
          c.ReqSerialNo, c.SerialNumber, c.SubjectName, c.State, c.IssuerSlNo, c.IssuerName, 
          c.IssueDate, c.ExpiryDate, c.SubjectType, c.RawCertificate
        FROM cert c
        WHERE c.IssuerSlNo IN (SELECT SerialNumber FROM auth_cert WHERE AuthNo = ?)
        UNION ALL
        SELECT c2.ReqSerialNo, c2.SerialNumber, c2.SubjectName, c2.State, c2.IssuerSlNo, c2.IssuerName, 
          c2.IssueDate, c2.ExpiryDate, c2.SubjectType, c2.RawCertificate
        FROM cert c2
        JOIN CERTLIST cl ON c2.IssuerSlNo = cl.SerialNumber
      )
      SELECT 
        cl.ReqSerialNo, cl.SerialNumber, cl.SubjectName, cl.State, cl.IssuerSlNo, cl.IssuerName, 
        cl.IssueDate, cl.ExpiryDate, cl.SubjectType, cl.RawCertificate,
        COUNT(ce.ErrorCode) AS errorCount
      FROM CERTLIST cl
      LEFT JOIN cert_error ce ON cl.ReqSerialNo = ce.ReqSerialNo
      LEFT JOIN error e ON ce.ErrorCode = e.ErrorCode
      WHERE 1=1
    `;
  }
}

function applyFilters(query, filterCriteria) {
  const alias = query.includes('CERTLIST') ? 'cl' : 'c';

  if (filterCriteria.issuers && filterCriteria.issuers.length > 0) {
    query += applyIssuerFilter(filterCriteria.issuers, alias);
  }
  if (filterCriteria.subjectType && filterCriteria.subjectType.length > 0) {
    query += ` AND ${alias}.SubjectType IN (${filterCriteria.subjectType
      .map((type) => `'${type}'`)
      .join(",")})`;
  }
  if (filterCriteria.states && filterCriteria.states.length > 0) {
    query += ` AND ${alias}.State IN (${filterCriteria.states
      .map((state) => `'${state}'`)
      .join(",")})`;
  }
  if (filterCriteria.regions && filterCriteria.regions.length > 0) {
    query += ` AND ${alias}.State IN (${regionMap(filterCriteria.regions)})`;
  }
  if (
    filterCriteria.selectedDate === "issued" &&
    filterCriteria.startDate &&
    filterCriteria.endDate
  ) {
    query += ` AND ${alias}.IssueDate BETWEEN '${filterCriteria.startDate}' AND '${filterCriteria.endDate}'`;
  }
  if (
    filterCriteria.selectedDate === "expiry" &&
    filterCriteria.startDate &&
    filterCriteria.endDate
  ) {
    query += ` AND ${alias}.ExpiryDate BETWEEN '${filterCriteria.startDate}' AND '${filterCriteria.endDate}'`;
  }
  if (filterCriteria.validity && filterCriteria.validity !== 0) {
    query += ` AND TIMESTAMPDIFF(YEAR, ${alias}.IssueDate, ${alias}.ExpiryDate) = '${filterCriteria.validity}'`;
  }

  if (filterCriteria.errorSeverity && filterCriteria.errorSeverity.length > 0) {    
    query += ` AND e.ErrorSeverity IN (${filterCriteria.errorSeverity
      .map((sev) => `'${sev}'`)
      .join(",")})`;
  }
//   if (filterCriteria.errorSeverity && filterCriteria.errorSeverity.length > 0) {
//   const hasNoError = filterCriteria.errorSeverity.includes("NO_ERROR");
//   const otherSeverities = filterCriteria.errorSeverity.filter(sev => sev !== "NO_ERROR");

//   if (hasNoError && otherSeverities.length > 0) {
//     // Already handled in frontend - this block might not execute
//   } else if (hasNoError) {
//     // Only "NO_ERROR" selected: certificates with no errors
//     query += ` AND e.ErrorSeverity IS NULL`;
//   } else {
//     // Only actual severities selected
//     query += ` AND e.ErrorSeverity IN (${otherSeverities.map(sev => `'${sev}'`).join(",")})`;
//   }
// }

  query += `
    GROUP BY ${alias}.ReqSerialNo, ${alias}.SerialNumber, ${alias}.SubjectName, ${alias}.State, ${alias}.IssuerSlNo, ${alias}.IssuerName, 
             ${alias}.IssueDate, ${alias}.ExpiryDate, ${alias}.SubjectType, ${alias}.RawCertificate
  `;

  // console.log("query", query);
  
  return query;
}

function applyIssuerFilter(issuers) {
  const issuerList = issuers.map((issuer) => `'${issuer}'`).join(",");
  return ` AND CAname IN (${issuerList})`;
}


async function getRevokedCertData(
  filterCriteria,
  authNo,
  page,
  rows,
  order,
  orderBy,
  noPagination = false
) {
  try {
    let query = "";
    if (authNo == 1 || authNo == null) {
      query =
        "SELECT SerialNumber ,IssuerName, RevokeDateTime, Reason FROM Revocation_Data WHERE 1=1";
    } else {
      query =
        "SELECT SerialNumber ,IssuerName, RevokeDateTime, Reason FROM Revocation_Data WHERE IssuerSlNo IN (WITH RECURSIVE CERTLIST AS ( SELECT SerialNumber FROM auth_cert WHERE AuthNo = ? union ALL SELECT c.SerialNumber FROM cert c JOIN CERTLIST cl on c.IssuerSlNo = cl.SerialNumber) select * from CERTLIST) AND 1=1";
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
    const validColumns = [
      "SerialNumber",
      "IssuerName",
      "RevokeDateTime",
      "Reason",
    ];
    const sortColumn = validColumns.includes(orderBy)
      ? orderBy
      : "RevokeDateTime";
    const sortOrder = order === "desc" ? "desc" : "asc";

    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    const countQuery = `SELECT COUNT(*) AS total FROM (${query}) AS subquery`;
    const count = await db.executeQuery(countQuery, authNo);

    // Add pagination with LIMIT and OFFSET
    if (!noPagination) {
      if (rows && page) {
        const offset = (page - 1) * rows;
        query += ` LIMIT ${rows} OFFSET ${offset}`;
      }
    }

    const result = await db.executeQuery(query, authNo);
    return { result, count: count[0].total };
  } catch (e) {
    console.log("Error while fetching certificate details: ", e);
    throw e;
  }
}
async function getCertUsageData(
  filterCriteria,
  authNo,
  page,
  rows,
  order,
  orderBy,
  noPagination = false
) {
  try {
    let query = "";
    if (authNo == 1 || authNo == null) {
      query =
        "SELECT CU.SerialNumber,C.SubjectName,CU.IssuerName, CU.UsageDate,CU.Remark ,CU.Count FROM Cert_Usage CU INNER JOIN Cert C ON CU.SerialNumber = C.SerialNumber AND CU.IssuerSlNo = C.IssuerSlNo WHERE 1=1";
    } else {
      query =
        "SELECT CU.SerialNumber,C.SubjectName,CU.IssuerName, CU.UsageDate,CU.Remark,CU.Count FROM Cert_Usage CU INNER JOIN Cert C ON CU.SerialNumber = C.SerialNumber AND CU.IssuerSlNo = C.IssuerSlNo WHERE C.IssuerSlNo IN (WITH RECURSIVE CERTLIST AS ( SELECT SerialNumber FROM auth_cert WHERE AuthNo = ? union ALL SELECT c.SerialNumber FROM cert c JOIN CERTLIST cl on c.IssuerSlNo = cl.SerialNumber) select * from CERTLIST) AND 1=1";
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
    const validColumns = [
      "SerialNumber",
      "SubjectName",
      "IssuerName",
      "UsageDate",
      "Remark",
    ];
    const sortColumn = validColumns.includes(orderBy) ? orderBy : "UsageDate";
    const sortOrder = order === "desc" ? "desc" : "asc";

    query += ` ORDER BY ${sortColumn} ${sortOrder}`;
    const countQuery = `SELECT COUNT(*) AS total FROM (${query}) AS subquery`;
    const count = await db.executeQuery(countQuery, authNo);

    // Add pagination with LIMIT and OFFSET
    if (!noPagination) {
      if (rows && page) {
        const offset = (page - 1) * rows;
        query += ` LIMIT ${rows} OFFSET ${offset}`;
      }
    }

    const result = await db.executeQuery(query, authNo);
    return { result, count: count[0].total };
  } catch (e) {
    console.log("Error while fetching certificate details: ", e);
  }
}
//logs data based on logins
// async function getLogsData(filterCriteria, authNo,page, rows,  order,  orderBy,noPagination = false) {
//   try {
//     let query = "";
//     if (authNo == null) {
//       query =
//         "SELECT LogsSrNo, UserEmail, TimeStamp, IpAddress, ActionType, Remark, Lattitude, Longitude FROM Logs WHERE 1=1";
//     } else if (authNo == 1) {
//       query =
//         "SELECT LogsSrNo, UserEmail, TimeStamp, IpAddress, ActionType, Remark, Lattitude, Longitude FROM Logs WHERE  UserEmail NOT IN (SELECT UserEmail from login WHERE AuthNo IS NULL)";
//     } else {
//       query =
//         "SELECT LogsSrNo , UserEmail, TimeStamp, IpAddress, ActionType, Remark, Lattitude, Longitude FROM Logs  WHERE UserEmail IN (SELECT UserEmail from login WHERE AuthNo = ?)";
//     }
//     if (filterCriteria) {
//       if (filterCriteria.users && filterCriteria.users.length > 0) {
//         const users = filterCriteria.users.map((user) => `'${user}'`).join(",");
//         query += ` AND UserEmail IN (${users})`;
//       }
//       if (filterCriteria.actions && filterCriteria.actions.length > 0) {
//         const actions = filterCriteria.actions
//           .map((action) => `'${action}'`)
//           .join(",");
//         query += ` AND ActionType IN (${actions})`;
//       }

//       if (filterCriteria.startDate && filterCriteria.endDate) {
//         query += ` AND TimeStamp BETWEEN '${filterCriteria.startDate}' AND '${filterCriteria.endDate}'`;
//       }
//     }
//     const validColumns = [
//       "LogsSrNo",
//       "UserEmail",
//       "TimeStamp",
//       "IpAddress",
//       "ActionType",
//       "Remark",
//       "Lattitude",
//       "Longitude"
//     ];
//     const sortColumn = validColumns.includes(orderBy)
//       ? orderBy
//       : "TimeStamp";
//     const sortOrder = order === "desc" ? "desc" : "asc";

//     query += ` ORDER BY ${sortColumn} ${sortOrder}`;
//     const countQuery = `SELECT COUNT(*) AS total FROM (${query}) AS subquery`;
//     const count = await db.executeQuery(countQuery, authNo);

//     // Add pagination with LIMIT and OFFSET
//     if (!noPagination) {
//       if (rows && page) {
//         const offset = (page - 1) * rows;
//         query += ` LIMIT ${rows} OFFSET ${offset}`;
//       }
//     }

//     const result = await db.executeQuery(query, authNo);
//     return { result, count: count[0].total };
//   } catch (e) {
//     console.log("Error while fetching certificate details: ", e);
//   }
// }

async function getLogsData(
  filterCriteria,
  authNo,
  page,
  rows,
  order,
  orderBy,
  noPagination = false
) {
  try {
    let query = `
      SELECT 
        Logs.LogsSrNo, 
        Logs.UserEmail, 
        Logs.TimeStamp, 
        Logs.IpAddress, 
        Logs.ActionType, 
        Logs.Remark, 
        Logs.Lattitude, 
        Logs.Longitude
      FROM Logs
      INNER JOIN login ON Logs.UserEmail = login.UserEmail
      LEFT JOIN authorities ON login.AuthNo = authorities.AuthNo
      WHERE 1=1
    `;

    const queryParams = [];

    // AuthNo-based filtering
    if (authNo === 1) {
      query +=
        " AND login.UserEmail NOT IN (SELECT UserEmail FROM login WHERE AuthNo IS NULL)";
    } else if (authNo != null) {
      query += " AND login.AuthNo = ?";
      queryParams.push(authNo);
    }

    // Filter by AuthName (authorities) or Role (login)
    if (filterCriteria?.users?.length > 0) {
      const authNames = [];
      const roles = [];

      for (const user of filterCriteria.users) {
        if (["admin"].includes(user.toLowerCase())) {
          roles.push(user);
        } else {
          authNames.push(user);
        }
      }

      const userConditions = [];
      if (authNames.length > 0) {
        const placeholders = authNames.map(() => "?").join(",");
        userConditions.push(`authorities.AuthName IN (${placeholders})`);
        queryParams.push(...authNames);
      }

      if (roles.length > 0) {
        const placeholders = roles.map(() => "?").join(",");
        userConditions.push(`login.Role IN (${placeholders})`);
        queryParams.push(...roles);
      }

      if (userConditions.length > 0) {
        query += ` AND (${userConditions.join(" OR ")})`;
      }
    }

    // Filter by ActionType
    if (filterCriteria?.actions?.length > 0) {
      const placeholders = filterCriteria.actions.map(() => "?").join(",");
      query += ` AND Logs.ActionType IN (${placeholders})`;
      queryParams.push(...filterCriteria.actions);
    }

    // Filter by date range
    if (filterCriteria?.startDate && filterCriteria?.endDate) {
      query += ` AND Logs.TimeStamp BETWEEN ? AND ?`;
      queryParams.push(filterCriteria.startDate, filterCriteria.endDate);
    }

    // Sorting
    const validColumns = [
      "LogsSrNo",
      "UserEmail",
      "TimeStamp",
      "IpAddress",
      "ActionType",
      "Remark",
      "Lattitude",
      "Longitude",
    ];
    const sortColumn = validColumns.includes(orderBy) ? orderBy : "TimeStamp";
    const sortOrder = order === "desc" ? "DESC" : "ASC";
    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    // Count total records
    const countQuery = `SELECT COUNT(*) AS total FROM (${query}) AS subquery`;
    const countResult = await db.executeQuery(countQuery, queryParams);
    const count = countResult[0].total;

    // Pagination
    if (!noPagination && rows && page) {
      const offset = (page - 1) * rows;
      query += ` LIMIT ? OFFSET ?`;
      queryParams.push(rows, offset);
    }

    const result = await db.executeQuery(query, queryParams);    
    return { result, count };
  } catch (e) {
    console.error("Error while fetching log data:", e);
    throw e;
  }
}

async function updateStatus(email, status, attempts, last) {
  try {
    const query =
      "UPDATE Login SET LoginStatus = ? , Attempts = ? ,LastAttempt = ? WHERE UserEmail = ?";
    // "UPDATE Login SET LoginStatus = ? , Attempts = ?,LastAttempt = ? WHERE UserName = ?";
    return db.executeQuery(query, [status, attempts, last, email]);
  } catch (e) {
    console.log("Error while fetching user: ", e);
  }
}
async function updateAttempts(email, attempts) {
  try {
    const query = "UPDATE Login SET Attempts = ? WHERE UserEmail = ?";
    return db.executeQuery(query, [attempts, email]);
  } catch (e) {
    console.log("Error while fetching user: ", e);
  }
}
// Toggle the login action (enable/disable)
async function toggleLoginAction(email, status) {
  try {
    let query = "";
    if (status === "active") {
      query =
        "UPDATE Login SET LoginStatus = ?, Attempts= 2 WHERE UserEmail = ?";
    } else {
      query =
        "UPDATE Login SET LoginStatus = ?,Attempts= 0 WHERE UserEmail = ?";
    }
    const result = await db.executeQuery(query, [status, email]);

    if (result && result.affectedRows > 0) {
      return true;
    } else {
      // console.log(`No changes made for ${email}: LoginStatus might already be '${status}' or user does not exist.`);
      return false;
    }
  } catch (e) {
    console.error("Error while changing the Login Status:", e);
    return false;
  }
}

async function getLastLogin(authNo) {
  let query = "";
  try {
    if (authNo != null) {
      query = `SELECT l.*FROM logs l JOIN login lg ON l.UserEmail = lg.UserEmail
  WHERE lg.AuthNo = ? AND l.ActionType = 'login'
ORDER BY l.LogsSrNo DESC
LIMIT 1`;
    } else {
      query = `SELECT l.* FROM logs l
JOIN login lg ON l.UserEmail = lg.UserEmail
WHERE lg.role = 'Admin' AND l.ActionType = 'login'
ORDER BY l.LogsSrNo DESC
LIMIT 1`;
    }
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
    let query = "SELECT AuthName FROM authorities";
    // let query =
    //   'SELECT AuthName FROM authorities WHERE AuthName NOT LIKE "CCA"';
    return db.executeQuery(query);
  } catch (e) {
    console.log("Error while fetching data: ", e);
  }
}

// find usage options
function findUsages() {
  try {
    let query = "SELECT DISTINCT Remark FROM `cert_usage`";
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
        DATE_FORMAT(NOW() - INTERVAL 23 HOUR, '%Y-%m-%d %H:00:00') AS hour_start
    UNION ALL
    SELECT
        DATE_FORMAT(hour_start + INTERVAL 1 HOUR, '%Y-%m-%d %H:00:00')
    FROM hours
    WHERE hour_start < DATE_FORMAT(NOW(), '%Y-%m-%d %H:00:00')
    )
    SELECT 
        COALESCE(COUNT(c.timestamp), 0) AS issued_records
    FROM 
        hours h
    LEFT JOIN 
        cert c
    ON 
        DATE_FORMAT(c.timestamp, '%Y-%m-%d %H:00:00') = h.hour_start
        AND c.timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND c.timestamp <= NOW()
    GROUP BY 
        h.hour_start
    ORDER BY 
    h.hour_start;
    `;
    let query2 = `
    WITH RECURSIVE hours AS (
    SELECT
        DATE_FORMAT(NOW() - INTERVAL 23 HOUR, '%Y-%m-%d %H:00:00') AS hour_start
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
        AND r.RevokeDateTime >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND r.RevokeDateTime <= NOW()
    GROUP BY 
        h.hour_start
    ORDER BY 
    h.hour_start;`;

    let query3 = `WITH RECURSIVE hours AS (
    SELECT
        DATE_FORMAT(NOW() - INTERVAL 23 HOUR, '%Y-%m-%d %H:00:00') AS hour_start
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
        AND cu.UsageDate >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND cu.UsageDate <= NOW()
    GROUP BY 
        h.hour_start
    ORDER BY 
    h.hour_start;`;

    let query4 =`WITH RECURSIVE hours AS (
    SELECT
        DATE_FORMAT(NOW() - INTERVAL 23 HOUR, '%Y-%m-%d %H:00:00') AS hour_start
    UNION ALL
    SELECT
        DATE_FORMAT(hour_start + INTERVAL 1 HOUR, '%Y-%m-%d %H:00:00')
    FROM hours
    WHERE hour_start < DATE_FORMAT(NOW(), '%Y-%m-%d %H:00:00')
),
certs_with_error AS (
    SELECT DISTINCT c.reqSerialNo, DATE_FORMAT(c.timestamp, '%Y-%m-%d %H:00:00') AS hour_start
    FROM cert c
    JOIN cert_error ce ON ce.reqSerialNo = c.reqSerialNo
    WHERE c.timestamp BETWEEN DATE_SUB(NOW(), INTERVAL 24 HOUR) AND NOW()
)
SELECT 
    h.hour_start,
    COUNT(cwe.reqSerialNo) AS error_count
FROM 
    hours h
LEFT JOIN certs_with_error cwe
    ON cwe.hour_start = h.hour_start
GROUP BY 
    h.hour_start
ORDER BY 
    h.hour_start;`

    const issued = await db.executeQuery(query);
    const revoked = await db.executeQuery(query2);
    // const used = await db.executeQuery(query3);
    const errors = await db.executeQuery(query4);
    const arr1 = [];
    const arr2 = [];
    const arr3 = [];
    for (i in issued) {
      arr1.push(issued[i].issued_records);
    }
    for (i in revoked) {
      arr2.push(revoked[i].rev_records);
    }
    // for (i in used) {
    //   arr3.push(used[i].used_records);
    // }
   for (let i in errors) {
    arr3.push(errors[i].error_count);
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
    WHERE timestamp >= NOW() - INTERVAL 1 DAY
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
    // let query3 = `
    // SELECT COUNT(*) as usageCount
    // FROM cert_usage  
    // WHERE UsageDate >= NOW() - INTERVAL 1 DAY
    // UNION ALL
    // SELECT Count(*)
    // FROM cert_usage `;
    // const row3 = await db.executeQuery(query3);

    let query4 = `SELECT
  (
    SELECT COUNT(DISTINCT ce.reqSerialNo)
    FROM cert_error ce
    JOIN cert c ON ce.reqSerialNo = c.reqSerialNo
    WHERE c.timestamp >= NOW() - INTERVAL 1 DAY
  ) AS dailyErrors,
  
  (
    SELECT COUNT(*)
    FROM cert
    WHERE timestamp >= NOW() - INTERVAL 1 DAY
  ) AS total;`;

  const row4 = await db.executeQuery(query4)
  // console.log("row",row4);
  
    var result = [];
    result.push(
      row1[0].issuedCount,
      row1[1].issuedCount,
      row2[0].revokedCount,
      row2[1].revokedCount,
      // row3[0].usageCount,
      // row3[1].usageCount
      row4[0].dailyErrors,
      row4[0].total
    );


    return result;
  } catch (e) {
    console.log("Error while fetching count: ", e);
  }
}

async function getAllAuthsData() {
  const queryAuthorities = `SELECT * FROM authorities ORDER BY authorities.AuthNo ASC`;
  // const queryAuthorities = `SELECT a.*, l.UserEmail, l.password FROM authorities a JOIN login l ON a.authno = l.authno`;
  const queryDistinctRoles = `SELECT DISTINCT role FROM login`;
  try {
    const authoritiesResults = await db.executeQuery(queryAuthorities);
    const distinctRolesResults = await db.executeQuery(queryDistinctRoles);
    return {
      authorities: authoritiesResults,
      distinctRoles: distinctRolesResults,
    };
  } catch (e) {
    console.log("error fetching data", e);
  }
}
async function getAllUsersData(
  page,
  rows,
  order,
  orderBy,
  noPagination = false
) {
  let query = `SELECT l.UserEmail,l.Name,l.Role,l.LoginStatus,a.AuthName FROM login as l INNER JOIN authorities as a where l.AuthNo =a.AuthNo`;

  try {
    const validColumns = [
      "UserEmail",
      "Name",
      "Role",
      "LoginStatus",
      "AuthName",
    ];
    const sortColumn = validColumns.includes(orderBy) ? orderBy : "AuthName";
    const sortOrder = order === "desc" ? "desc" : "asc";

    query += ` ORDER BY ${sortColumn} ${sortOrder}`;
    const countQuery = `SELECT COUNT(*) AS total FROM (${query}) AS subquery`;
    const count = await db.executeQuery(countQuery);

    // Add pagination with LIMIT and OFFSET
    if (!noPagination) {
      if (rows && page) {
        const offset = (page - 1) * rows;
        query += ` LIMIT ${rows} OFFSET ${offset}`;
      }
    }
    const result = await db.executeQuery(query);
    return { result, count: count[0].total };
  } catch (e) {
    console.log("Error while fetching certificate details: ", e);
  }
}
async function updateAuthsData(updateQuery, queryParams) {
  try {
    const result = await db.executeQuery(updateQuery, queryParams);
    return result;
  } catch (e) {
    console.error("Error updating data:", e);
    throw new Error("Database error");
  }
}

// async function updateAuthsData(authCode, authName, authNo,key) {
// const authQuery = "UPDATE authorities SET AuthCode = ?, AuthName = ?, `Key` = ? WHERE AuthNo = ?";
//   // const loginQuery = `UPDATE login SET password = ? WHERE authno = ?`;

//   try {
//     const result = await db.executeQuery(authQuery, [
//       authCode,
//       authName,
//       key,
//       authNo,
//     ]);
//     return result;
//   } catch (e) {
//     console.error("Error updating data:", e);
//     throw new Error("Database error");
//   }
// }
async function getSubjectTypes() {
  const querySubtypes = `SELECT DISTINCT SubjectType FROM cert`;
  try {
    const distinctSubtypes = await db.executeQuery(querySubtypes);
    return distinctSubtypes;
  } catch (e) {
    console.log("error fetching data", e);
  }
}

async function getCCAAuthCode() {
  const query = `SELECT AuthCode FROM authorities WHERE AuthNo = 1`;
  try {
    const result = await db.executeQuery(query);

    const authCode = result?.[0]?.AuthCode;

    return authCode;
  } catch (e) {
    console.log("error fetching data", e);
    return null;
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
async function getLogActions() {
  const queryDistinctActions = `SELECT DISTINCT ActionType FROM logs`;
  try {
    const distinctActionsResults = await db.executeQuery(queryDistinctActions);
    return distinctActionsResults;
  } catch (e) {
    console.log("error fetching data", e);
  }
}

async function getCertSerialNumber(serialNumber, issuerName) {
  const query = `Select * FROM cert WHERE SerialNumber = ? AND IssuerName = ?`;
  try {
    const result = await db.executeQuery(query, [serialNumber, issuerName]);
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
    commonName,
    authNo,
    authCode,
    serialNo,
    email,
    organization,
    address,
    state,
    postalCode,
    key,
    salt
  } = params;
  const query1 =
    "INSERT into authorities (AuthNo, AuthCode, Salt, `Key`, AuthName, Email, Organization, Address, State, PostalCode) VALUES (?, ?,?,?, ?,?,?, ?, ?,?)";
  const query2 = "INSERT into auth_cert VALUES (?,?)";
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
                await db.executeQuery(
                  query1,
                  [
                    authNo,
                    authCode,
                    salt,
                    key,
                    commonName,
                    email,
                    organization,
                    address,
                    state,
                    postalCode,
                  ],
                  connection
                );
                await db.executeQuery(query2, [authNo, serialNo], connection);

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
  }
}
// async function signup(params) {
//   const {
//     username,
//     password,
//     role,
//     authCode,
//     email,
//     address,
//     organization,
//     state,
//     postalcode,
//     authNo,
//     authName,
//     serialNumber,
//   } = params;
//   const query1 =
//     "INSERT into authorities (AuthNo, AuthCode, AuthName, Email, Organization, Address, State, Postal_Code) VALUES (?, ?, ?,?,?, ?, ?,?)";
//   const query2 =
//     "INSERT into login (UserName, Password,LoginStatus, Attempts, Role, AuthNo) VALUES (?,?,?,?,?,?)";
//   const query3 = "INSERT into auth_cert VALUES (?,?)";
//   try {
//     // Start a transaction
//     const result = await new Promise((resolve, reject) => {
//       db.pool.getConnection((err, connection) => {
//         if (err) reject(err);
//         else {
//           connection.beginTransaction(async (err) => {
//             if (err) {
//               connection.release();
//               reject(err);
//             } else {
//               try {
//                 // Execute queries
//                 await db.executeQuery(
//                   query1,
//                   [
//                     authNo,
//                     authCode,
//                     authName,
//                     email,
//                     address,
//                     organization,
//                     state,
//                     postalcode,
//                   ],
//                   connection
//                 );
//                 await db.executeQuery(
//                   query2,
//                   [username, password, "active", 2, role, authNo],
//                   connection
//                 );
//                 await db.executeQuery(
//                   query3,
//                   [authNo, serialNumber],
//                   connection
//                 );

//                 // Commit transaction
//                 connection.commit((err) => {
//                   connection.release();
//                   if (err) reject(err);
//                   else {
//                     // console.log("Saved to database");
//                     resolve(true);
//                     // return true;
//                   }
//                 });
//               } catch (error) {
//                 connection.rollback(() => {
//                   connection.release();
//                   reject(error);
//                   // return false;
//                 });
//               }
//             }
//           });
//         }
//       });
//     });
//     return result;
//   } catch (error) {
//     console.error("Transaction failed:", error);
//     return false;
//     // You might want to handle the error or notify the user here
//   }
// }
async function getAuthNo(organization) {
  try {
    const query = "SELECT AuthNo FROM authorities WHERE AuthName = ?";
    const result = await db.executeQuery(query, [organization]);

    if (result && result.length > 0) {
      return result[0].AuthNo;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Transaction failed:", error);
    return null;
  }
}
async function signupUser(params) {
  const { email, password, name, role, authNo } = params;
  const loginStatus = "temporary";
  const attempts = 2;
  const query =
    "INSERT INTO `login`(`UserEmail`, `Password`, `LoginStatus`, `Attempts`, `Role`, `AuthNo`, `Name`) VALUES (?,?,?,?,?,?,?)";
  try {
    const result = await db.executeQuery(query, [
      email,
      password,
      loginStatus,
      attempts,
      role,
      authNo,
      name,
    ]);
    return result;
  } catch (error) {
    console.error("Database insertion failed:", error);
    throw new Error("Database operation failed");
  }
}

async function getCertInfo(serialNo, issuerCN) {
  const query = `SELECT * FROM cert WHERE SerialNumber = ? AND IssuerName like ?`;
  try {
    const result = await db.executeQuery(query, [serialNo, issuerCN]);
    return result;
  } catch (e) {
    console.error("Error getting certificate information:", e.message);
    throw new Error("Database query failed");
  }
}

async function emailExists(email) {
  const query = `SELECT 1 FROM login WHERE UserEmail = ?`;
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
WHERE UserEmail = ?`;
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
      return "";
    }
  } catch (error) {
    console.error("Failed to retrieve email:", error);
    return false;
  }
}

async function getProfileStatus(userName) {
  const query = `SELECT LoginStatus FROM login WHERE UserEmail = ?`;
  try {
    const result = await db.executeQuery(query, [userName]);

    if (result && result.length > 0) {
      return result[0].LoginStatus;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Failed to retrieve email:", error);
    return null;
  }
}
async function getErrorBySerial(reqSerialNo) {
  const query = `
    SELECT 
      e.ErrorSeverity,
      GROUP_CONCAT(CONCAT(e.ErrorCode, ': ', e.ErrorDescription) SEPARATOR ' | ') AS Errors
    FROM error e
    WHERE e.ErrorCode IN (
      SELECT ErrorCode
      FROM cert_error
      WHERE ReqSerialNo = ?
    )
    GROUP BY e.ErrorSeverity;
  `;
  try {
    const result = await db.executeQuery(query, [reqSerialNo]);
    return result || [];
  } catch (error) {
    console.error("Failed to retrieve error codes:", error);
    throw error; 
  }
}


module.exports = {
  findUserByUsername,
  findEmailByAuth,
  findBccEmailByAuth,
  findUserData,
  findUserByAuthNo,
  createUser,
  checkCertificateInDatabase,
  insertCertificate,
  logUserAction,
  authenticateUser,
  authenticateAdmin,
  getCertData,
  getRevokedCertData,
  getCertUsageData,
  getLogsData,
  updateStatus,
  updateAttempts,
  toggleLoginAction,
  getProfileStatus,
  updatePassword,
  findAuthorities,
  getCardsData,
  getCompactCardData,
  getAllUsersData,
  getAllAuthsData,
  updateAuthsData,
  getSubjectTypes,
  getCCAAuthCode,
  getRevocationReasons,
  getLogActions,
  findUsages,
  getCertSerialNumber,
  getNextSerial,
  signup,
  findOrgByCN,
  getAuthNo,
  signupUser,
  getCertInfo,
  emailExists,
  setTemporaryPass,
  getEmail,
  getProfileStatus,
  getLastLogin,
  getErrorBySerial
};
