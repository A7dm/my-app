const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// بيانات المعلمين فقط
const teachers = [
  { username: 'عبد الرحمن الشرفي', password: 'pass123' },
  { username: 'البراء الجعفري', password: 'pass123' }
];

app.use(bodyParser.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// تسجيل دخول المعلمين فقط (الطلاب ينجحون بالدخول من المتصفح)
app.post('/login', (req, res) => {
  const { username, password, accountType } = req.body;

  if (accountType === 'teacher') {
    const user = teachers.find(t => t.username === username && t.password === password);
    if (user) {
  return res.json({ 
    success: true,
    redirect: 'login-page/teacher-dashboard.html',
    username: user.username // نرسل اسم المعلم للخلفية
  });
}  else {
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
    }
  } else if (accountType === 'student') {
    // لا نفحص بيانات الطالب في السيرفر، فقط نرسل نجاح دخول
    return res.json({ success: true, redirect: 'student-dashboard/student-dashboard.html' });
  } else {
    return res.status(400).json({ success: false, message: 'نوع الحساب غير معروف' });
  }
});

app.listen(port, () => {
  console.log(`🚀 السيرفر يعمل على: http://localhost:${port}`);
});
