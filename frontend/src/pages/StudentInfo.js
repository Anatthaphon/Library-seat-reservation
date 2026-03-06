import React, { useState, useEffect } from "react";
import axios from "axios"; // อย่าลืม npm install axios
import "../styles/StudentInfo.css";

// กำหนด Base URL ของ API คุณ
const API_BASE_URL = "http://localhost:3001/api";

export default function StudentInfo() {
  const [students, setStudents] = useState([]); // เริ่มต้นด้วย Array ว่าง
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [studentBookings, setStudentBookings] = useState([]);
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  // --- 1. ดึงรายชื่อนักเรียนทั้งหมด (หรือตารางสอน) จาก MongoDB ---
  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/schedules`);
      // ปรับโครงสร้างข้อมูลให้เข้ากับ UI เดิม (Mapping ข้อมูลจาก MongoDB)
      const mappedData = response.data.map(item => ({
        id: item._id, // MongoDB ใช้ _id
        name: item.title || "ไม่ระบุชื่อ",
        nickname: item.instructor?.fullName || "N/A", // ดึงจาก populate
        studentNumber: item.instructor?.username || "N/A",
        contact: "N/A", 
        email: item.instructor?.email || "N/A",
        seat: item.room || "-",
        status: item.status === "booked" ? "Booked" : "Check-in",
      }));
      setStudents(mappedData);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStudents();
  }, []);

  // --- 2. ดึงข้อมูลประวัติการจองจาก API เมื่อกดดูรายละเอียด ---
  useEffect(() => {
    if (selectedStudent) {
      const fetchHistory = async () => {
        try {
          // ดึงประวัติเฉพาะคน/รายการนั้นๆ
          const response = await axios.get(`${API_BASE_URL}/schedules/${selectedStudent.id}`);
          // ในที่นี้สมมติว่าเอาข้อมูลตัวมันเองมาโชว์ในตารางประวัติ
          setStudentBookings([response.data]); 
        } catch (error) {
          console.error("Error fetching history:", error);
        }
      };
      fetchHistory();
    }
  }, [selectedStudent]);

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลที่เลือก ${selectedIds.length} รายการ?`)) {
      try {
        // วนลบทีละรายการตาม API ที่คุณมี
        await Promise.all(selectedIds.map(id => axios.delete(`${API_BASE_URL}/schedules/${id}`)));
        alert("ลบข้อมูลสำเร็จ");
        fetchAllStudents(); // โหลดข้อมูลใหม่
        setSelectedIds([]);
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการลบ");
      }
    }
  };

  const handlePrevMonth = () => setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const filteredBookings = studentBookings.filter(b => {
    const bDate = new Date(b.date);
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

  if (loading) return <div className="loading">กำลังเชื่อมต่อฐานข้อมูล MongoDB...</div>;

  // --- View 1: Detail View ---
  if (selectedStudent) {
    return (
      <div className="student-detail-container">
        <button className="back-btn" onClick={() => setSelectedStudent(null)}>← Back</button>
        <div className="info-card">
          <h2>{selectedStudent.name}</h2>
          <p className="subtitle">ข้อมูลประวัติจากระบบ (Real-time)</p>
          
          <div className="info-grid">
            <div className="info-group"><label>Name</label><div className="read-only-field">{selectedStudent.name}</div></div>
            <div className="info-group"><label>Instructor (Nickname)</label><div className="read-only-field">{selectedStudent.nickname}</div></div>
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
              <tr><th>Date</th><th>Seat/Room</th><th>Time</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b, index) => (
                  <tr key={index} className={b.status === 'cancelled' ? 'row-orange' : 'row-white'}>
                    <td>{formatDate(b.date)}</td>
                    <td>{b.room || b.seat || "-"}</td>
                    <td>{b.timeSlot?.startTime} - {b.timeSlot?.endTime}</td>
                    <td>{b.status}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#999'}}>ไม่มีข้อมูลในเดือนนี้</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- View 2: List View ---
  return (
    <div className="student-list-container">
      <div className="list-header">
        <h1>Student Info (MongoDB)</h1>
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