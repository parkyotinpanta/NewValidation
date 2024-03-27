// db.js

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost', // ใช้ 'localhost' เพราะ MySQL อยู่ใน Docker
  user: 'root',
  password: '1234',
  database: 'Validation'
});

module.exports = connection.promise();
