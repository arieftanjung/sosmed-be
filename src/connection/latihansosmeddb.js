require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER_NAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  connectionLimit: 10,
  port: 3306,
});

db.getConnection((err, conn) => {
  if (err) {
    console.log("error cuy");
  }
  console.log(`connected sa id ${conn.threadId}`);
});

module.exports = db;
