const mysql = require("mysql");
const createTableQueries = require('./queries');

// Create a connection pool to handle multiple connections
const pool = mysql.createPool({
  port: 3306,
  host: "localhost",
  user: "root",
  password: "",
  database: "cca",
  connectionLimit: 10, // Adjust the number of connections based on your needs
});


async function createTableDynamically() {
    for(let i=0; i<createTableQueries.length; i++){
        await new Promise((resolve) => {
            pool.query(createTableQueries[i],(err)=>{
                if(err) throw err;
                console.log(`Table ${i+1} created or already exists`);
                resolve();
            })
        })
    }
}

// Function to create a table dynamically
let initialized = false;

async function initializeDatabase(callback){
    if(!initialized){
        await createTableDynamically();
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
