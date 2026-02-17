import React, { useState, useEffect } from "react";
import "../styles/StudentInfo.css";

const MOCK_STUDENTS = [
  { id: "1", name: "ตัั้ง", nickname: "แต่วันว่าง", studentNumber: "66xxxxxxxx", contact: "xxx-xxxxxxx", email: "tung@ku.ac.th" },
  { id: "2", name: "แป้ง", nickname: "ลื่นไหล", studentNumber: "65xxxxxxxx", contact: "xxx-xxxxxxx", email: "pang@ku.ac.th" },
  { id: "3", name: "โบ๊ท", nickname: "ไม่รู้", studentNumber: "67xxxxxxxx", contact: "xxx-xxxxxxx", email: "boat@ku.ac.th" },
];

export default function StudentInfo() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentBookings, setStudentBookings] = useState([]);
  
  // ✅ เพิ่ม State สำหรับเก็บ ID ของนิสิตที่ถูกติ๊กเลือก
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    const cancels = JSON.parse(localStorage.getItem("cancelHistory") || "[]");
    const combined = [
      ...bookings.map(b => ({ ...b, status: 'active' })),
      ...cancels.map(c => ({ ...c, status: 'cancelled', seat: 'C3' }))
    ];
    setStudentBookings(combined);
  }, [selectedStudent]);

  // ✅ ฟังก์ชันสำหรับ "เลือกทั้งหมด"
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // ถ้าติ๊กหัวตาราง ให้ใส่ ID ของนักเรียนทุกคนลงใน Array
      setSelectedIds(MOCK_STUDENTS.map(s => s.id));
    } else {
      // ถ้าเอาติ๊กออก ให้ล้าง Array เป็นว่างเปล่า
      setSelectedIds([]);
    }
  };

  // ✅ ฟังก์ชันสำหรับเลือกรายคน
  const handleSelectRow = (e, id) => {
    e.stopPropagation(); // กันไม่ให้กดแล้วเด้งไปหน้า Detail
    if (e.target.checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`;
  };

  if (selectedStudent) {
    return (
      <div className="student-detail-container">
        <button className="back-btn" onClick={() => setSelectedStudent(null)}>← Back</button>
        <div className="info-card">
          <h2>{selectedStudent.name}</h2>
          <p className="subtitle">Cancelled 2/3 January</p>
          <div className="info-grid">
            <div className="info-group"><label>Name</label><div className="read-only-field">{selectedStudent.name}</div></div>
            <div className="info-group"><label>Nick Name</label><div className="read-only-field">{selectedStudent.nickname}</div></div>
            <div className="info-group"><label>Student Number</label><div className="read-only-field">{selectedStudent.studentNumber}</div></div>
            <div className="info-group"><label>Contact</label><div className="read-only-field">{selectedStudent.contact}</div></div>
            <div className="info-group full-width"><label>Email</label><div className="read-only-field">{selectedStudent.email}</div></div>
          </div>
          <table className="history-table">
            <thead><tr><th>Date</th><th>Seat</th><th>Time</th><th>หมายเหตุ</th></tr></thead>
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

  return (
    <div className="student-list-container">
      <div className="list-header">
        <h1>Student Info</h1>
        <div className="header-actions">
           <button className="btn-icon">Delete</button>
           <button className="btn-icon">Filters</button>
           <button className="btn-add">+ Add new</button>
        </div>
      </div>

      <table className="main-student-table">
        <thead>
          <tr>
            <th>
              {/* ✅ ติ๊กถูกอันบนสุดสำหรับเลือกทั้งหมด */}
              <input 
                type="checkbox" 
                onChange={handleSelectAll}
                checked={selectedIds.length === MOCK_STUDENTS.length && MOCK_STUDENTS.length > 0}
              />
            </th>
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
              <td>
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(s.id)}
                  onChange={(e) => handleSelectRow(e, s.id)}
                  onClick={(e) => e.stopPropagation()} 
                />
              </td>
              <td>{s.name} {s.nickname}</td>
              <td>{s.studentNumber}</td>
              <td>{s.contact}</td>
              <td>A1</td>
              <td><span className="status-badge">Check-in</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}