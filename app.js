// app.js

const express = require('express');
const { body, validationResult, sanitize } = require('express-validator');// validationResult เป็นค่าตัวกลางไม่สามารถเปลี่ยนได้
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//! Middleware สำหรับตรวจสอบข้อมูล
// validation มี middleware ในตัวมันอยู่แล้ว หรือง่ายๆ คือ ตรวจสอบข้อมูลในตัวมันอยู่แล้ว 
const validateData = [
    body('username').not().isEmpty().isLength({ min: 6 }).withMessage('ชื่อของคุณต้องมีความยาว6ตัวขึ้นไป'),// username ต้องห้ามเป็นช่องว่าง 
    body('password').isLength({ min: 6 }).withMessage('พาสเวิร์ดของคุณต้องมี6ตัวขึ้นไป'),// password ต้องมีความยาวอย่างน้อย 6 ตัวอักษร
    body('username').customSanitizer(value => {
        return value.trim().toLowerCase(); // กำหนดในช่อง username ให้มี การปรับตัวอักษร และช่องว่าง 
    })

    // .toLowerCase() ปรับตัวอักษระ ใหญ่ให้เป็นเล็กอัตโนมัติ
    //.trim() ลบช่องว่างออกหน้าและหลัง
    // การเลือกใช้ เครื่องมือมีหลากหลายรูปแบบ เช่น 
    // .isEmail(): ตรวจสอบว่าข้อมูลที่รับเข้ามาเป็นอีเมลที่ถูกต้องหรือไม่
    // .isLength(options): ตรวจสอบความยาวของข้อมูลที่รับเข้ามา โดยคุณสามารถกำหนดความยาวขั้นต่ำและขั้นสูงได้
    // .isNumeric(): ตรวจสอบว่าข้อมูลที่รับเข้ามาเป็นตัวเลขหรือไม่
    // .isAlphanumeric(): ตรวจสอบว่าข้อมูลที่รับเข้ามามีเฉพาะตัวอักษรและตัวเลขเท่านั้นหรือไม่
    // .isIn(values): ตรวจสอบว่าข้อมูลที่รับเข้ามาอยู่ในรายการของค่าที่กำหนดไว้หรือไม่
    // .matches(pattern, modifiers): ตรวจสอบว่าข้อมูลที่รับเข้ามาตรงกับรูปแบบ (pattern) ที่กำหนดไว้หรือไม่
    // .customSanitizer(function): ใช้สำหรับเขียนฟังก์ชันที่กำหนดการแปลงข้อมูลก่อนการตรวจสอบ นอกจากนี้ยังมี .custom() ซึ่งใช้สำหรับเขียนฟังก์ชันที่กำหนดเงื่อนไขการตรวจสอบเองได้ด้วย
    // .not() ใช้เพื่อระบุว่าข้อมูลที่ตรวจสอบต้องไม่ว่างเปล่า (ไม่ควรเป็น isEmpty())
    // .withMessage() เป็นเมธอดที่ใช้กำหนดข้อความข้อผิดพลาดที่จะแสดงถ้าข้อมูลที่รับเข้ามาไม่ผ่านเงื่อนไข
];

//! POST endpoint สำหรับการสมัครสมาชิก
app.post('/insert', validateData, async (req, res) => {
    // ตรวจสอบ errors ที่เกิดขึ้นจากการตรวจสอบข้อมูล
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // เช็คว่ามี error เกิดขึ้นรึเปล่า ถ้ามีก็ทำการ response status 400 กลับไป
        return res.status(400).json({ errors: errors.array() }); //ซึ่งคำสั่ง errors.array() จะได้ผลลัพธ์เป็น array ของรายการ error ที่ตรวจพบทั้งหมด
    }

    // ดำเนินการเพิ่มข้อมูลผู้ใช้งานลงในฐานข้อมูล
    try { // try จะวิ่งเข้านี่ก่อนทำใน fucntion นี่ได้หรือไม่? 
        const { username, password } = req.body;
        await db.query('INSERT INTO User (username, password) VALUES (?, ?)', [username, password]);
        res.status(200).json({ message: 'insert successful!' });
    } catch (error) { // catch ถ้าข้างบนไม่ทำงานจะวิ่งมานี่
        console.error('Error signing up:', error);
        res.status(500).json({ message: 'sever error ซ้ำ!' }); // ค่าตั้งต้น คือ 500 เพราะseverเกิดข้อผิดพลาด แต่เราเปลี่ยนเป็น 400 เพราะ คำขอที่ส่งมาไม่ถูกต้องจึ่งจะเข้าใจ
    }
});


//! GET endpoint เพื่อดึงข้อมูลผู้ใช้งานทั้งหมด
app.get('/User', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM User'); // [row]เพราะค่าที่ออกไปเป็น arry เลยต้องมีครอบให้มัน เหมือน retrun {"pageSize":ตัวแปร.pageSize}
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(400).json({ message: 'Server error' }); // ค่าตั้งต้น คือ 500 เพราะseverเกิดข้อผิดพลาด แต่เราเปลี่ยนเป็น 400 เพราะ คำขอที่ส่งมาไม่ถูกต้องจึ่งจะเข้าใจ
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
