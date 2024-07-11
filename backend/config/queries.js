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
];
module.exports = createTableQueries;
