import React, { useState, useEffect } from "react";
import "../styles/StudentInfo.css"

// ข้อมูลจำลองรายชื่อนักเรียน
const MOCK_STUDENTS = [
  { id: "1", name: "ตัั้ง", nickname: "แต่วันว่าง", studentNumber: "66xxxxxxxx", contact: "xxx-xxxxxxx", email: "tung@ku.ac.th" },
  { id: "2", name: "แป้ง", nickname: "ลื่นไหล", studentNumber: "65xxxxxxxx", contact: "xxx-xxxxxxx", email: "pang@ku.ac.th" },
  { id: "3", name: "โบ๊ท", nickname: "ไม่รู้", studentNumber: "67xxxxxxxx", contact: "xxx-xxxxxxx", email: "boat@ku.ac.th" },
  // เพิ่มรายชื่ออื่นๆ ตามต้องการ...
];

export default function StudentInfo() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentBookings, setStudentBookings] = useState([]);

  // ดึงข้อมูลการจองจาก localStorage มาแสดง
  useEffect(() => {
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    const cancels = JSON.parse(localStorage.getItem("cancelHistory") || "[]");
    
    // รวมข้อมูล (ในระบบจริงควร filter ตาม Student ID)
    // ตรงนี้ทำ logic จำลองว่า "สีส้ม" คือข้อมูลที่อยู่ใน cancelHistory
    const combined = [
      ...bookings.map(b => ({ ...b, status: 'active' })),
      ...cancels.map(c => ({ ...c, status: 'cancelled', seat: 'C3' })) // สมมติข้อมูลยกเลิก
    ];
    setStudentBookings(combined);
  }, [selectedStudent]);

  // ฟังก์ชันจัดรูปแบบวันที่
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`; // พ.ศ.
  };

  // --- หน้า Detail (ภาพที่ 2) ---
  if (selectedStudent) {
    return (
      <div className="student-detail-container">
        <button className="back-btn" onClick={() => setSelectedStudent(null)}>← Back</button>
        
        <div className="info-card">
          <h2>{selectedStudent.name}</h2>
          <p className="subtitle">Cancelled 2/3 January</p>
          
          <div className="info-grid">
            <div className="info-group">
              <label>Name</label>
              <div className="read-only-field">{selectedStudent.name}</div>
            </div>
            <div className="info-group">
              <label>Nick Name</label>
              <div className="read-only-field">{selectedStudent.nickname}</div>
            </div>
            <div className="info-group">
              <label>Student Number</label>
              <div className="read-only-field">{selectedStudent.studentNumber}</div>
            </div>
            <div className="info-group">
              <label>Contact</label>
              <div className="read-only-field">{selectedStudent.contact}</div>
            </div>
            <div className="info-group full-width">
              <label>Email</label>
              <div className="read-only-field">{selectedStudent.email}</div>
            </div>
          </div>

          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Seat</th>
                <th>Time</th>
                <th>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {studentBookings.map((b, index) => (
                <tr key={index} className={b.status === 'cancelled' ? 'row-orange' : 'row-green'}>
                  <td>{b.date ? formatDate(b.date) : "N/A"}</td>
                  <td>{b.seatItemId || b.seat || "-"}</td>
                  <td>{b.startTime}:00 - {b.endTime}:00</td>
                  <td>{b.status === 'cancelled' ? 'Cancelled' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- หน้า List (ภาพที่ 1) ---
  return (
    <div className="student-list-container">
      <div className="list-header">
        <div>
          <h1>Student Info</h1> 
        </div>
        <div className="header-actions">
           <button className="btn-icon">Delete</button>
           <button className="btn-icon">Filters</button>
           <button className="btn-add">+ Add new</button>
        </div>
      </div>

      <table className="main-student-table">
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>Column heading ↓</th>
            <th>Student Number ↓</th>
            <th>Contact ↓</th>
            <th>Seat ↓</th>
            <th>Status ↓</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_STUDENTS.map((s) => (
            <tr key={s.id} onClick={() => setSelectedStudent(s)} className="clickable-row">
              <td><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
              <td>{s.name} {s.nickname}</td>
              <td>{s.studentNumber}</td>
              <td>{s.contact}</td>
              <td>A1</td> {/* ข้อมูลจำลอง */}
              <td><span className="status-badge">Check-in</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}