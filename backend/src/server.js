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

const cron = require("node-cron");
const findRemoveSync = require('find-remove');

const corsOptions = {
  origin: 'http://10.182.3.123:3000',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//static routes for images
app.use(express.static(path.join(__dirname, '..', 'public')));

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
// pdf deletion cron
cron.schedule("0 */6 * * *", () => {
  try {
    const result = findRemoveSync(".\\public\\reports", {
      age: { seconds: 86400 },
      extensions: [".pdf"]
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
    saveUninitialized: false,// new session will not be saved to the store even if it hasn’t been modified
    cookie: {maxAge: 24 * 60 * 60 * 1000 }// 1 day in milliseconds
  })
);
// Serve static files from the public directory
// app.use(express.static("public"));
// Routes
app.use(signupRoute);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
