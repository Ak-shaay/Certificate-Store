// const mysql = require("mysql");
const mysql = require('mysql2');

const createTableQueries = require('./queries');

// Create a connection pool to handle multiple connections
const pool = mysql.createPool({
  port: 3307,
  host: "localhost",
  user: "root",
  password: "Test@123",
  database: "certdb",
  connectionLimit: 10, // Adjust the number of connections based on your needs
});


// Function to create a table dynamically
let initialized = false;

async function initializeDatabase(callback){
    if(!initialized){
        // await createTableDynamically();
        initialized = true;
    }
    else{
        callback();
    }
}

//function to execute queries
function executeQuery (query, values=[]){
    return new Promise((resolve, reject) => {
        pool.query(query, values, (err, result)=>{
            if(err){
                reject(err);
            }else{
                resolve(result);
            }
        })
    })
}

// Export the pool and the createTable function
module.exports = {
  pool,
  initializeDatabase,
  executeQuery,
};
