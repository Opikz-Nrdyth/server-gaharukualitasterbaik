const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function connectToDatabase() {
  try {
    await pool.getConnection();
    console.log("Connected to MySQL database");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    throw error;
  }
}

module.exports = { pool, connectToDatabase };
