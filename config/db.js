// config/db.js
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
  waitForConnections: true,
  connectionLimit: 10, // Número máximo de conexiones en el pool
  queueLimit: 0 // Sin límite de cola para solicitudes pendientes
});

// Exportar el pool de conexiones usando promesas para facilitar consultas asincrónicas
module.exports = pool.promise();
