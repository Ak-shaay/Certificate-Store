const createTableQueries = [
  `
    CREATE TABLE IF NOT EXISTS Login (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255),
        password VARCHAR(500),
        role VARCHAR(255),
        session_id VARCHAR(500)
    )
`,
  `
    CREATE TABLE IF NOT EXISTS User (
        orgName VARCHAR(255) PRIMARY KEY,
        postalCode INT,
        region VARCHAR(255),
        state VARCHAR(255)
    )
`,
  `
    CREATE TABLE IF NOT EXISTS UserCertificate(
        serial_no VARCHAR(500) PRIMARY KEY,
        common_name VARCHAR(255),
        country VARCHAR(20) DEFAULT 'IN',
        state VARCHAR(255),
        region VARCHAR(255),
        issuer VARCHAR(255),
        validTo DATETIME,
        hash VARCHAR(500),
        validity VARCHAR(255),
        cert_Version INT
    ) `,
  `CREATE TABLE IF NOT EXISTS Endusercert(
        serial_no VARCHAR(500) PRIMARY KEY,
        common_name VARCHAR(255),
        country VARCHAR(20) DEFAULT 'IN',
        state VARCHAR(255),
        region VARCHAR(255),
        issuer VARCHAR(255),
        validTo DATETIME,
        hash VARCHAR(500),
        validity VARCHAR(255)
    ) `,
  `CREATE TABLE IF NOT EXISTS Certusage ( serial_no VARCHAR(500) PRIMARY KEY, use_case VARCHAR(500))`,
  `
    CREATE TABLE IF NOT EXISTS Logs(
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id VARCHAR(255),
      user_id INT,
      action VARCHAR(255),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) `,
];
module.exports = createTableQueries;
