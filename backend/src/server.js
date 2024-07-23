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

const corsOptions = {
  origin: 'http://192.168.37.1:3000',
  credentials: true,
};
app.use(cors(corsOptions));

// Set EJS as the view engine (optional if you want to render dynamic EJS files)
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "../views"));

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
// Creating session
app.use(
  session({
    name: "certStore",
    secret: "cert-store-key-123098-store-765432-key-88409-cert",
    resave: false,
    store: sessionStore,
    saveUninitialized: true,
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
