import React, { useState, useEffect } from "react";
import "../styles/StudentInfo.css";

const INITIAL_MOCK_DATA = [
  { id: "1", name: "ตัั้ง", nickname: "แต่วันว่าง", studentNumber: "6612345678", contact: "081-xxxxxxx", email: "tung@ku.ac.th", seat: "A1", status: "Check-in" },
  { id: "2", name: "แป้ง", nickname: "ลื่นไหล", studentNumber: "6512345678", contact: "082-xxxxxxx", email: "pang@ku.ac.th", seat: "A4", status: "Late" },
  { id: "3", name: "โบ๊ท", nickname: "ไม่รู้", studentNumber: "6712345678", contact: "083-xxxxxxx", email: "boat@ku.ac.th", seat: "A7", status: "Booked" },
  { id: "4", name: "จิว", nickname: "จิว", studentNumber: "6622345678", contact: "084-xxxxxxx", email: "jiw@ku.ac.th", seat: "A9", status: "Inactive" },
];

export default function StudentInfo() {
  const [students, setStudents] = useState(INITIAL_MOCK_DATA);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [studentBookings, setStudentBookings] = useState([]);
  const [sortColumn, setSortColumn] = useState(""); 
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  // ดึงข้อมูลประวัติการจองจาก localStorage เมื่อเข้าหน้า Detail
  useEffect(() => {
    if (selectedStudent) {
      const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
      const cancels = JSON.parse(localStorage.getItem("cancelHistory") || "[]");
      
      // รวมการจองปกติและประวัติการยกเลิกเข้าด้วยกัน
      const combined = [
        ...bookings,
        ...cancels.map(c => ({ ...c, status: 'cancelled' }))
      ];
      setStudentBookings(combined);
    }
  }, [selectedStudent]);

  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลที่เลือก ${selectedIds.length} รายการ?`)) {
      setStudents(students.filter(s => !selectedIds.includes(s.id)));
      setSelectedIds([]);
    }
  };

  const handlePrevMonth = () => setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const filteredBookings = studentBookings.filter(b => {
    const bDate = new Date(b.date || b.bookingDate);
    return bDate.getMonth() === currentViewDate.getMonth() && 
           bDate.getFullYear() === currentViewDate.getFullYear();
  });

  const monthLabel = currentViewDate.toLocaleString('th-TH', { month: 'long', year: 'numeric' });

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`;
  };

  const handleSort = (column) => {
    const isCurrentCol = sortColumn === column;
    setSortDirection(isCurrentCol && sortDirection === "asc" ? "desc" : "asc");
    setSortColumn(column);
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (!sortColumn) return 0;
    let valA = a[sortColumn];
    let valB = b[sortColumn];
    if (sortColumn === "status") {
      const priority = { "Check-in": 4, "Late": 3, "Booked": 2, "Inactive": 1 };
      valA = priority[valA] || 0;
      valB = priority[valB] || 0;
    }
    return sortDirection === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  // --- View 1: หน้าแสดงรายละเอียดและตารางประวัติการจอง (Detail View) ---
  if (selectedStudent) {
    return (
      <div className="student-detail-container">
        <button className="back-btn" onClick={() => setSelectedStudent(null)}>← Back</button>
        <div className="info-card">
          <h2>{selectedStudent.name}</h2>
          <p className="subtitle">ประวัติการใช้งานรายเดือน</p>
          
          <div className="info-grid">
            <div className="info-group"><label>Name</label><div className="read-only-field">{selectedStudent.name}</div></div>
            <div className="info-group"><label>Nick Name</label><div className="read-only-field">{selectedStudent.nickname}</div></div>
            <div className="info-group"><label>Student Number</label><div className="read-only-field">{selectedStudent.studentNumber}</div></div>
            <div className="info-group"><label>Contact</label><div className="read-only-field">{selectedStudent.contact}</div></div>
            <div className="info-group full-width"><label>Email</label><div className="read-only-field">{selectedStudent.email}</div></div>
          </div>

          <div className="history-header">
            <h3>Booking History</h3>
            <div className="month-pagination">
              <button className="btn-nav" onClick={handlePrevMonth}>&lt;</button>
              <span className="current-month">{monthLabel}</span>
              <button className="btn-nav" onClick={handleNextMonth}>&gt;</button>
            </div>
          </div>

          <table className="history-table">
            <thead>
              <tr><th>Date</th><th>Seat</th><th>Time</th><th>หมายเหตุ</th></tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b, index) => (
                  <tr key={index} className={b.status === 'cancelled' ? 'row-orange' : 'row-white'}>
                    <td>{formatDate(b.date || b.bookingDate)}</td>
                    <td>{b.seatItemId || b.seat || "-"}</td>
                    <td>{b.startTime}:00 - {b.endTime}:00</td>
                    <td>{b.status === 'cancelled' ? 'Cancelled' : ''}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#999'}}>ไม่มีข้อมูลการจองในเดือนนี้</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- View 2: หน้าหลักตารางรายชื่อ (List View) ---
  return (
    <div className="student-list-container">
      <div className="list-header">
        <h1>Student Info</h1>
        <div className="header-actions">
          <button className="btn-delete" onClick={handleDelete} disabled={selectedIds.length === 0}>
            Delete {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
          </button>
        </div>
      </div>
      <table className="main-student-table">
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                onChange={(e) => e.target.checked ? setSelectedIds(students.map(s => s.id)) : setSelectedIds([])} 
                checked={selectedIds.length === students.length && students.length > 0} 
              />
            </th>
            <th>Name</th>
            <th onClick={() => handleSort("studentNumber")} className="sortable-header">Student Number ↓</th>
            <th onClick={() => handleSort("contact")} className="sortable-header">Contact ↓</th>
            <th onClick={() => handleSort("seat")} className="sortable-header">Seat ↓</th>
            <th onClick={() => handleSort("status")} className="sortable-header">Status ↓</th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((s) => (
            <tr key={s.id} onClick={() => setSelectedStudent(s)} className="clickable-row">
              <td>
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(s.id)} 
                  onChange={(e) => {
                    e.stopPropagation();
                    setSelectedIds(prev => e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id));
                  }} 
                  onClick={(e) => e.stopPropagation()} 
                />
              </td>
              <td>{s.name} {s.nickname}</td>
              <td>{s.studentNumber}</td>
              <td>{s.contact}</td>
              {/* --- จุดแก้ไข Logic: แสดงเลขที่นั่งสำหรับ Check-in และ Late เท่านั้น --- */}
              <td>{(s.status === "Check-in" || s.status === "Late") ? s.seat : "-"}</td>
              <td>
                <span className={`status-badge ${s.status.toLowerCase().replace(" ", "-")}`}>
                  {s.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}