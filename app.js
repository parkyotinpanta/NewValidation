// app.js

const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware สำหรับตรวจสอบข้อมูล
const validateData = [
    body('username').not().isEmpty().isLength({ min: 6 }).withMessage('ชื่อของคุณต้องมีความยาว6ตัวขึ้นไป'),
    body('password').isLength({ min: 6 }).withMessage('พาสเวิร์ดของคุณต้องมี6ตัวขึ้นไป'),
];

app.post('/insert', validateData, async (req, res) => {
    // ตรวจสอบ errors ที่เกิดขึ้นจากการตรวจสอบข้อมูล
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // ดำเนินการเพิ่มข้อมูลผู้ใช้งานลงในฐานข้อมูล
    try {
        const { username, password } = req.body;
        await db.query('INSERT INTO User (username, password) VALUES (?, ?)', [username, password]);
        res.status(200).json({ message: 'insert successful!' });
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(400).json({ message: 'insert error' });
    }
});


// GET endpoint เพื่อดึงข้อมูลผู้ใช้งานทั้งหมด
app.get('/User', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM User');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(400).json({ message: 'Server error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
