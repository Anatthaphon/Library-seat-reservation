import React, { useState, useEffect } from "react";
import "../styles/StudentInfo.css";

const MOCK_STUDENTS = [
  { id: "1", name: "ตัั้ง", nickname: "แต่วันว่าง", studentNumber: "6612345678", contact: "081-xxxxxxx", email: "tung@ku.ac.th", seat: "A1", status: "Check-in" },
  { id: "2", name: "แป้ง", nickname: "ลื่นไหล", studentNumber: "6512345678", contact: "082-xxxxxxx", email: "pang@ku.ac.th", seat: "A4", status: "Check-in" },
  { id: "3", name: "โบ๊ท", nickname: "ไม่รู้", studentNumber: "6712345678", contact: "083-xxxxxxx", email: "boat@ku.ac.th", seat: "A7", status: "Booked" },
  { id: "4", name: "จิว", nickname: "จิว", studentNumber: "6622345678", contact: "084-xxxxxxx", email: "jiw@ku.ac.th", seat: "A9", status: "Inactive" },
];

export default function StudentInfo() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [studentBookings, setStudentBookings] = useState([]);
  const [sortColumn, setSortColumn] = useState(""); 
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  useEffect(() => {
    if (selectedStudent) {
      const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
      const cancels = JSON.parse(localStorage.getItem("cancelHistory") || "[]");
      
      // รวมข้อมูลโดยยังคงรักษาค่าดั้งเดิมไว้เพื่อเช็คเงื่อนไขสี
      const combined = [
        ...bookings,
        ...cancels.map(c => ({ ...c, status: 'cancelled' }))
      ];
      setStudentBookings(combined);
    }
  }, [selectedStudent]);

  // --- Logic การจัดการเดือน ---
  const handlePrevMonth = () => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const filteredBookings = studentBookings.filter(b => {
    const bDate = new Date(b.date || b.bookingDate);
    return bDate.getMonth() === currentViewDate.getMonth() && 
           bDate.getFullYear() === currentViewDate.getFullYear();
  });

  const monthLabel = currentViewDate.toLocaleString('th-TH', { month: 'long', year: 'numeric' });

  // --- Helper Functions ---
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`;
  };

  const handleSort = (column) => {
    if (column === "name") return; 
    const isCurrentCol = sortColumn === column;
    if (isCurrentCol) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (column) => {
    if (column === "name") return null;
    if (sortColumn !== column) return " ↓"; 
    return sortDirection === "asc" ? " ↓" : " ↑";
  };

  const sortedStudents = [...MOCK_STUDENTS].sort((a, b) => {
    if (!sortColumn) return 0;
    let valA = a[sortColumn];
    let valB = b[sortColumn];
    if (sortColumn === "status") {
      const priority = { "Check-in": 3, "Booked": 2, "Inactive": 1 };
      valA = priority[valA] || 0;
      valB = priority[valB] || 0;
    }
    return sortDirection === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  // --- Render Detail View ---
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
                filteredBookings.map((b, index) => {
                  // --- ส่วนแก้ไข Logic สี 3 สี ---
                  let rowClass = "row-white"; // 1. สีขาว: ใช้บริการแล้ว (Default)
                  
                  const bookingDate = new Date(b.date || b.bookingDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  if (b.status === 'cancelled') {
                    rowClass = "row-orange"; // 2. สีส้ม: ยกเลิก
                  } else if (bookingDate >= today) {
                    rowClass = "row-green"; // 3. สีเขียว: ยังไม่ถึงวันจอง/กำลังใช้
                  }

                  return (
                    <tr key={index} className={rowClass}>
                      <td>{formatDate(b.date || b.bookingDate)}</td>
                      <td>{b.seatItemId || b.seat || "-"}</td>
                      <td>{b.startTime}:00 - {b.endTime}:00</td>
                      <td>{b.status === 'cancelled' ? 'Cancelled' : ''}</td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#999'}}>ไม่มีข้อมูลการจองในเดือนนี้</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- Render List View ---
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
            <th><input type="checkbox" onChange={(e) => e.target.checked ? setSelectedIds(MOCK_STUDENTS.map(s => s.id)) : setSelectedIds([])} checked={selectedIds.length === MOCK_STUDENTS.length} /></th>
            <th>Column heading</th>
            <th onClick={() => handleSort("studentNumber")}>Student Number {renderSortIcon("studentNumber")}</th>
            <th onClick={() => handleSort("contact")}>Contact {renderSortIcon("contact")}</th>
            <th onClick={() => handleSort("seat")}>Seat {renderSortIcon("seat")}</th>
            <th onClick={() => handleSort("status")}>Status {renderSortIcon("status")}</th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((s) => (
            <tr key={s.id} onClick={() => setSelectedStudent(s)} className="clickable-row">
              <td><input type="checkbox" checked={selectedIds.includes(s.id)} onChange={(e) => { e.stopPropagation(); setSelectedIds(prev => e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id)); }} onClick={(e) => e.stopPropagation()} /></td>
              <td>{s.name} {s.nickname}</td>
              <td>{s.studentNumber}</td>
              <td>{s.contact}</td>
              <td>{s.seat}</td>
              <td><span className={`status-badge ${s.status.toLowerCase().replace(" ", "-")}`}>{s.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}