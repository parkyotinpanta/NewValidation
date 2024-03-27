// db.js

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost', // ใช้ 'localhost' เพราะ MySQL อยู่ใน Docker
  user: 'root',
  password: '1234', // กันลืม ว่ารหัส คือ 1234
  database: 'Validation' // ชื่อดาต้า ไม่ใช่ เทเบิ้ล 
});

module.exports = connection.promise();
