const express = require("express");
const { pool, initializeDatabase } = require("../config/db");
const app = express();
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const cors = require("cors");
const signupRoute = require("../routes/auth");
const bodyParser = require("body-parser");
const path = require("path");
const fileUpload = require("express-fileupload");
app.use(fileUpload());

const fs = require("fs");
const https = require("https");
const http = require("http");

const cron = require("node-cron");
const findRemoveSync = require("find-remove");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const allowedOrigins = [
  "http://10.182.3.123:3000",
  "https://10.182.3.123",
  "http://10.182.3.123",
  // "https://production-domain.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

//static routes for images
app.use(express.static(path.join(__dirname, "..", "public")));
// Initialize the database and create a new table dynamically
initializeDatabase();

// Configure express-session with MySQLStore after table creation
const sessionStore = new MySQLStore(
  {
    expiration: 3600000, // Session expiration time in milliseconds (1 hour)
    createDatabaseTable: true, // We don't need to create the table here since we did it manually
  },
  pool
);
// pdf deletion cron every hour hh:00:00
cron.schedule("0 */1 * * *", () => {
  try {
    const result = findRemoveSync(".\\public\\reports", {
      age: { seconds: 86400 },
      extensions: [".pdf"],
    });
  } catch (error) {
    console.error("Error removing files: ", error);
  }
});
// Creating session
app.use(
  session({
    name: "certStore",
    secret: "cert-store-key-123098-store-765432-key-88409-cert",
    resave: false,
    store: sessionStore,
    saveUninitialized: false, // new session will not be saved to the store even if it hasn’t been modified
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day in milliseconds
  })
);
// Serve static files from the public directory
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..','public', 'index.html'));
});

// Routes
app.use('/api/',signupRoute);
const httpsServer = https.createServer(
  {
    key: fs.readFileSync("./src/Key.key"),
    cert: fs.readFileSync("./src/Certificate.crt"),
  },
  app
);
const httpServer = http.createServer(app);

httpsServer.listen(443, () => {
  console.log("HTTPS Server running on port 443");
});
httpServer.listen(80, () => {
  console.log("HTTPS Server running on port 80");
});
