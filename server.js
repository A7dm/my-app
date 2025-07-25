const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;


// تحميل الطلاب من ملف JSON إذا موجود
const studentsFile = path.join(__dirname, 'students.json');
let students = [];
let nextStudentId = 1;

if (fs.existsSync(studentsFile)) {
  students = JSON.parse(fs.readFileSync(studentsFile, 'utf-8'));
  nextStudentId = students.length ? Math.max(...students.map(s => s.id)) + 1 : 1;
}

// بيانات المعلمين فقط
const teachers = [
  { username: 'عبد الرحمن الشرفي', password: 'pass123' },
  { username: 'البراء الجعفري', password: 'pass123' }
];

app.use(bodyParser.json());
app.use(express.static(__dirname));

// ✅ إنشاء حساب طالب جديد + حفظه في ملف
app.post('/create-student', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'البيانات غير مكتملة' });
  }

  const exists = students.find(s => s.username === username);
  if (exists) {
    return res.status(409).json({ success: false, message: 'اسم المستخدم موجود بالفعل' });
  }

  students.push({ id: nextStudentId++, username, password });
  fs.writeFileSync(studentsFile, JSON.stringify(students, null, 2)); // حفظ في ملف

  return res.json({ success: true, message: 'تم إنشاء الحساب' });
});

// ✅ عرض كل الطلاب
app.get('/students', (req, res) => {
  res.json(students);
});

// ✅ حذف طالب
app.delete('/students/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = students.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: 'الطالب غير موجود' });

  students.splice(index, 1);
  fs.writeFileSync(studentsFile, JSON.stringify(students, null, 2)); // حفظ التغيير
  res.json({ success: true });
});

// ✅ تعديل بيانات طالب
app.put('/students/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { username, password } = req.body;
  const index = students.findIndex(s => s.id === id);

  if (index === -1) return res.status(404).json({ success: false, message: 'الطالب غير موجود' });

  const exists = students.some((s, i) => s.username === username && s.id !== id);
  if (exists) return res.status(409).json({ success: false, message: 'اسم المستخدم موجود مسبقاً' });

  students[index] = { id, username, password };
  fs.writeFileSync(studentsFile, JSON.stringify(students, null, 2)); // حفظ التعديل
  res.json({ success: true });
});

// ✅ تسجيل دخول
app.post('/login', (req, res) => {
  const { username, password, accountType } = req.body;

  if (accountType === 'teacher') {
    const user = teachers.find(t => t.username === username && t.password === password);
    if (user) {
      return res.json({
        success: true,
        redirect: 'login-page/teacher-dashboard.html',
        username: user.username
      });
    } else {
      return res.status(401).json({ success: false, message: 'بيانات المعلم غير صحيحة' });
    }
  } else if (accountType === 'student') {
    const student = students.find(s => s.username === username && s.password === password);
    if (student) {
      return res.json({
        success: true,
        redirect: 'student-dashboard/student-dashboard.html',
        username: student.username
      });
    } else {
      return res.status(401).json({ success: false, message: 'بيانات الطالب غير صحيحة' });
    }
  } else {
    return res.status(400).json({ success: false, message: 'نوع الحساب غير معروف' });
  }
});

// ✅ الصفحة الرئيسية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ تشغيل السيرفر
app.listen(port, () => {
  console.log(`🚀 السيرفر يعمل على: http://localhost:${port}`);
});
