const express = require("express");
const session = require("express-session");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database("fortune.db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || "change-this-secret-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: false }
}));
app.use(express.static(path.join(__dirname, "public")));

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  roll TEXT NOT NULL,
  batch TEXT DEFAULT '',
  group_name TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  exam TEXT NOT NULL,
  subject TEXT NOT NULL,
  marks REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  class_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('Present','Absent'))
);
CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  notice_date TEXT NOT NULL,
  type TEXT DEFAULT 'NOTICE'
);
`);

const adminExists = db.prepare("SELECT 1 FROM admins WHERE username=?").get("admin");
if (!adminExists) {
  db.prepare("INSERT INTO admins(username,password) VALUES(?,?)").run("admin", "admin123");
}

const studentExists = db.prepare("SELECT 1 FROM students WHERE student_id=?").get("FCC-1001");
if (!studentExists) {
  const addStudent = db.prepare("INSERT INTO students(student_id,name,roll,batch,group_name) VALUES(?,?,?,?,?)");
  addStudent.run("FCC-1001","Ariana Rahman","1001","Morning","Science");
  addStudent.run("FCC-1002","Nafis Ahmed","1002","Morning","Science");
  addStudent.run("FCC-1003","Mim Akter","1003","Evening","Humanities");

  const addResult = db.prepare("INSERT INTO results(student_id,exam,subject,marks) VALUES(?,?,?,?)");
  [
    ["FCC-1001","Half Yearly Examination 2026","Bangla",88],
    ["FCC-1001","Half Yearly Examination 2026","English",91],
    ["FCC-1001","Half Yearly Examination 2026","Mathematics",95],
    ["FCC-1001","Half Yearly Examination 2026","Physics",86],
    ["FCC-1001","Half Yearly Examination 2026","Chemistry",86],
    ["FCC-1002","Half Yearly Examination 2026","Bangla",82],
    ["FCC-1002","Half Yearly Examination 2026","English",86],
    ["FCC-1002","Half Yearly Examination 2026","Mathematics",91],
    ["FCC-1002","Half Yearly Examination 2026","Physics",80],
    ["FCC-1002","Half Yearly Examination 2026","Chemistry",82],
    ["FCC-1003","Half Yearly Examination 2026","Bangla",90],
    ["FCC-1003","Half Yearly Examination 2026","English",84],
    ["FCC-1003","Half Yearly Examination 2026","History",77],
    ["FCC-1003","Half Yearly Examination 2026","Civics",78],
    ["FCC-1003","Half Yearly Examination 2026","ICT",75]
  ].forEach(r=>addResult.run(...r));

  const addAttendance = db.prepare("INSERT INTO attendance(student_id,class_date,status) VALUES(?,?,?)");
  ["FCC-1001","FCC-1002","FCC-1003"].forEach(id=>{
    for(let i=1;i<=26;i++) addAttendance.run(id, `2026-09-${String(i).padStart(2,"0")}`, i===3 && id==="FCC-1002" ? "Absent" : (i===9 && id==="FCC-1003" ? "Absent":"Present"));
  });
}

function requireAdmin(req,res,next){
  if(!req.session.admin) return res.status(401).json({error:"Admin login required"});
  next();
}

app.post("/api/admin/login",(req,res)=>{
  const {username,password}=req.body;
  const admin=db.prepare("SELECT * FROM admins WHERE username=? AND password=?").get(username,password);
  if(!admin) return res.status(401).json({error:"Invalid username or password"});
  req.session.admin={id:admin.id,username:admin.username};
  res.json({ok:true,username:admin.username});
});
app.post("/api/admin/logout",(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get("/api/admin/me",(req,res)=>res.json({loggedIn:!!req.session.admin,admin:req.session.admin||null}));

app.get("/api/results/:studentId",(req,res)=>{
  const id=req.params.studentId.toUpperCase();
  const student=db.prepare("SELECT * FROM students WHERE student_id=?").get(id);
  if(!student) return res.status(404).json({error:"Student not found"});
  const exam=req.query.exam || "Half Yearly Examination 2026";
  const rows=db.prepare("SELECT subject,marks FROM results WHERE student_id=? AND exam=? ORDER BY id").all(id,exam);
  if(!rows.length) return res.status(404).json({error:"No result found for this exam"});
  const total=rows.reduce((a,b)=>a+Number(b.marks),0);
  const max=rows.length*100, percentage=+(total/max*100).toFixed(2);
  const grade=percentage>=80?"A+":percentage>=70?"A":percentage>=60?"B":percentage>=50?"C":percentage>=40?"D":"F";
  res.json({student,exam,marks:rows,total,max,percentage,grade});
});

app.get("/api/attendance/:studentId",(req,res)=>{
  const id=req.params.studentId.toUpperCase();
  const student=db.prepare("SELECT * FROM students WHERE student_id=?").get(id);
  if(!student) return res.status(404).json({error:"Student not found"});
  const month=req.query.month || "2026-09";
  const rows=db.prepare("SELECT class_date,status FROM attendance WHERE student_id=? AND class_date LIKE ? ORDER BY class_date").all(id,`${month}%`);
  const present=rows.filter(x=>x.status==="Present").length, absent=rows.length-present;
  res.json({student,month,rows,present,absent,total:rows.length,percentage:rows.length?+(present/rows.length*100).toFixed(2):0});
});

app.get("/api/notices",(req,res)=>{
  res.json(db.prepare("SELECT * FROM notices ORDER BY notice_date DESC,id DESC").all());
});

app.get("/api/admin/students",requireAdmin,(req,res)=>res.json(db.prepare("SELECT * FROM students ORDER BY id DESC").all()));
app.post("/api/admin/students",requireAdmin,(req,res)=>{
  try {
    const {student_id,name,roll,batch="",group_name=""}=req.body;
    db.prepare("INSERT INTO students(student_id,name,roll,batch,group_name) VALUES(?,?,?,?,?)").run(student_id,name,roll,batch,group_name);
    res.json({ok:true});
  } catch(e){res.status(400).json({error:"Student ID may already exist or fields are invalid"});}
});
app.delete("/api/admin/students/:id",requireAdmin,(req,res)=>{
  db.prepare("DELETE FROM students WHERE id=?").run(req.params.id);
  res.json({ok:true});
});

app.post("/api/admin/results",requireAdmin,(req,res)=>{
  const {student_id,exam,subject,marks}=req.body;
  db.prepare("INSERT INTO results(student_id,exam,subject,marks) VALUES(?,?,?,?)").run(student_id,exam,subject,Number(marks));
  res.json({ok:true});
});

app.post("/api/admin/attendance",requireAdmin,(req,res)=>{
  const {student_id,class_date,status}=req.body;
  db.prepare("INSERT INTO attendance(student_id,class_date,status) VALUES(?,?,?)").run(student_id,class_date,status);
  res.json({ok:true});
});

app.post("/api/admin/notices",requireAdmin,(req,res)=>{
  const {title,description,notice_date,type="NOTICE"}=req.body;
  db.prepare("INSERT INTO notices(title,description,notice_date,type) VALUES(?,?,?,?)").run(title,description,notice_date,type);
  res.json({ok:true});
});
app.delete("/api/admin/notices/:id",requireAdmin,(req,res)=>{
  db.prepare("DELETE FROM notices WHERE id=?").run(req.params.id);
  res.json({ok:true});
});

app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log(`Fortune Coaching Center running at http://localhost:${PORT}`));
