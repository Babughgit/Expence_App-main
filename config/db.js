require('dotenv').config('.env');

const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 10000, // 10 seconds timeout
});

async function connectToDatabase() {
    try {
        const connection = await db.getConnection();
        console.log("db connected");
        connection.release(); // Always release the connection after usage
    } catch (err) {
        console.error("error connecting to the database", err);
    }
}

connectToDatabase();

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);


module.exports = db;
