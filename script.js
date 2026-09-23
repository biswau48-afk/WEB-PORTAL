const students = {
  "FCC-1001": {name:"Ariana Rahman", roll:"1001", group:"Science", total:446, percent:89.2, grade:"A+", attendance:92, present:24, absent:2,
    marks:[["Bangla",88],["English",91],["Mathematics",95],["Physics",86],["Chemistry",86]]},
  "FCC-1002": {name:"Nafis Ahmed", roll:"1002", group:"Science", total:421, percent:84.2, grade:"A", attendance:88, present:23, absent:3,
    marks:[["Bangla",82],["English",86],["Mathematics",91],["Physics",80],["Chemistry",82]]},
  "FCC-1003": {name:"Mim Akter", roll:"1003", group:"Humanities", total:404, percent:80.8, grade:"A", attendance:96, present:25, absent:1,
    marks:[["Bangla",90],["English",84],["History",77],["Civics",78],["ICT",75]]}
};

const $ = id => document.getElementById(id);
const toast = msg => { const t=$("toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2600); };

$("menuBtn").addEventListener("click",()=> $("navMenu").classList.toggle("open"));
document.querySelectorAll("nav a").forEach(a=>a.addEventListener("click",()=> $("navMenu").classList.remove("open")));
$("year").textContent = new Date().getFullYear();

$("resultForm").addEventListener("submit", e=>{
  e.preventDefault();
  const id=$("resultId").value.trim().toUpperCase(), s=students[id];
  if(!s){$("resultOutput").innerHTML='<div class="result-box"><b>Student not found.</b><p style="font-size:12px;color:#68778d;margin-top:5px">Try FCC-1001, FCC-1002 or FCC-1003.</p></div>';return;}
  $("resultOutput").innerHTML=`<div class="result-box">
    <div class="result-top"><div><b>${s.name}</b><small style="display:block;color:#68778d">Roll ${s.roll} · ${s.group}</small></div><span class="grade">${s.grade}</span></div>
    <table class="marks"><thead><tr><th>Subject</th><th>Marks</th></tr></thead><tbody>${s.marks.map(m=>`<tr><td>${m[0]}</td><td>${m[1]}</td></tr>`).join("")}</tbody></table>
    <div style="display:flex;justify-content:space-between;margin-top:12px;font-size:12px"><b>Total: ${s.total}</b><b>${s.percent}%</b></div>
  </div>`;
});

$("attendanceForm").addEventListener("submit", e=>{
  e.preventDefault();
  const id=$("attendanceId").value.trim().toUpperCase(), s=students[id];
  if(!s){$("attendanceOutput").innerHTML='<div class="attendance-box"><b>Student not found.</b><p style="font-size:12px;color:#68778d;margin-top:5px">Try FCC-1001, FCC-1002 or FCC-1003.</p></div>';return;}
  $("attendanceOutput").innerHTML=`<div class="attendance-box">
    <b>${s.name}</b><small style="display:block;color:#68778d">Roll ${s.roll} · ${$("month").value}</small>
    <div style="margin-top:10px"><span class="big">${s.attendance}%</span></div>
    <div class="attendance-bar"><i style="width:${s.attendance}%"></i></div>
    <div style="display:flex;justify-content:space-between;font-size:12px;color:#68778d"><span>Present: <b>${s.present}</b></span><span>Absent: <b>${s.absent}</b></span><span>Total: <b>${s.present+s.absent}</b></span></div>
  </div>`;
});

$("loginDemo").addEventListener("click",()=>toast("Demo portal: connect this button to your real student login system."));
$("showAll").addEventListener("click",()=>toast("This demo currently displays the latest three notices."));
