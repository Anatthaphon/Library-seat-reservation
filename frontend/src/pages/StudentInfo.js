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

  // ดึงข้อมูลประวัติการจองเมื่อเลือกนิสิต
  useEffect(() => {
    if (selectedStudent) {
      const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
      const cancels = JSON.parse(localStorage.getItem("cancelHistory") || "[]");
      
      // รวมข้อมูลจำลอง (ในงานจริงควรกรองตาม ID ของ selectedStudent)
      const combined = [
        ...bookings.map(b => ({ ...b, status: 'active' })),
        ...cancels.map(c => ({ ...c, status: 'cancelled', seat: 'C3', date: '2025-01-05' }))
      ];
      setStudentBookings(combined);
    }
  }, [selectedStudent]);

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

    if (sortDirection === "asc") return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(MOCK_STUDENTS.map(s => s.id));
    else setSelectedIds([]);
  };

  const handleSelectRow = (e, id) => {
    e.stopPropagation();
    if (e.target.checked) setSelectedIds(prev => [...prev, id]);
    else setSelectedIds(prev => prev.filter(item => item !== id));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`;
  };

  // --- ส่วนแสดงผลหน้ารายละเอียด (Detail View) ---
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
                  <td>{formatDate(b.date || b.bookingDate)}</td>
                  <td>{b.seatItemId || b.seat || "-"}</td>
                  <td>{b.startTime || "12"}:00 - {b.endTime || "13"}:00</td>
                  <td>{b.status === 'cancelled' ? 'Cancelled' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- ส่วนแสดงผลหน้ารายชื่อ (List View) ---
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
              <input 
                type="checkbox" 
                onChange={handleSelectAll}
                checked={selectedIds.length === MOCK_STUDENTS.length && MOCK_STUDENTS.length > 0}
              />
            </th>
            <th style={{ cursor: "default" }}>Column heading</th>
            <th onClick={() => handleSort("studentNumber")} className="sortable-header">
              Student Number {renderSortIcon("studentNumber")}
            </th>
            <th onClick={() => handleSort("contact")} className="sortable-header">
              Contact {renderSortIcon("contact")}
            </th>
            <th onClick={() => handleSort("seat")} className="sortable-header">
              Seat {renderSortIcon("seat")}
            </th>
            <th onClick={() => handleSort("status")} className="sortable-header">
              Status {renderSortIcon("status")}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((s) => (
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
              <td>{s.seat}</td>
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