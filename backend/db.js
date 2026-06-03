// backend/db.js
const mysql = require('mysql2/promise');

let db;

async function connectDB() {
  try {
    db = await mysql.createConnection({
      host: 'ucka.veleri.hr',
      user: 'dsepic',
      password: '11',
      database: 'dsepic'
    });

    console.log("Connected to MySQL (Promise API)");
  }
  catch (err) {
    console.error("DB connection error:", err);
  }
}

function getDB() {
  return db;
}

module.exports = { connectDB, getDB };
