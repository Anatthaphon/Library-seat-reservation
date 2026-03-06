import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/StudentInfo.css";

// กำหนด Base URL ของ API
const API_BASE_URL = "http://localhost:3001/api";

export default function StudentInfo() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [studentBookings, setStudentBookings] = useState([]);
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  
  // State สำหรับการค้นหา
  const [searchTerm, setSearchTerm] = useState("");

  // --- 1. ดึงข้อมูลทั้งหมดจาก MongoDB ---
  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/schedules`);
      
      const mappedData = response.data.map(item => ({
        id: item._id,
        name: item.title || "ไม่ระบุชื่อ",
        nickname: item.instructor?.fullName || "N/A",
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

  // --- 2. ดึงข้อมูลประวัติเมื่อกดดูรายละเอียด ---
  useEffect(() => {
    if (selectedStudent) {
      const fetchHistory = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/schedules/${selectedStudent.id}`);
          setStudentBookings([response.data]); 
        } catch (error) {
          console.error("Error fetching history:", error);
        }
      };
      fetchHistory();
    }
  }, [selectedStudent]);

  // --- 3. Logic การค้นหา (Search Filter) ---
  const filteredStudents = students.filter((s) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(searchLower) || 
      s.studentNumber.toLowerCase().includes(searchLower) ||
      s.nickname.toLowerCase().includes(searchLower)
    );
  });

  // --- 4. Logic การเรียงลำดับ (Sorting) ---
  const sortedStudents = [...filteredStudents].sort((a, b) => {
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

  const handleSort = (column) => {
    const isCurrentCol = sortColumn === column;
    setSortDirection(isCurrentCol && sortDirection === "asc" ? "desc" : "asc");
    setSortColumn(column);
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลที่เลือก ${selectedIds.length} รายการ?`)) {
      try {
        await Promise.all(selectedIds.map(id => axios.delete(`${API_BASE_URL}/schedules/${id}`)));
        alert("ลบข้อมูลสำเร็จ");
        fetchAllStudents();
        setSelectedIds([]);
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการลบ");
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`;
  };

  if (loading) return <div className="loading" style={{ padding: "20px" }}>กำลังโหลดข้อมูลนิสิต...</div>;

  // --- VIEW 1: หน้าแสดงรายละเอียดนิสิต ---
  if (selectedStudent) {
    const monthLabel = currentViewDate.toLocaleString('th-TH', { month: 'long', year: 'numeric' });
    const filteredHistory = studentBookings.filter(b => {
      const bDate = new Date(b.date);
      return bDate.getMonth() === currentViewDate.getMonth() && 
             bDate.getFullYear() === currentViewDate.getFullYear();
    });

    return (
      <div className="student-detail-container">
        <button className="back-btn" onClick={() => setSelectedStudent(null)}>← กลับหน้าหลัก</button>
        <div className="info-card">
          <h2>{selectedStudent.name}</h2>
          <div className="info-grid">
            <div className="info-group"><label>รหัสนิสิต</label><div className="read-only-field">{selectedStudent.studentNumber}</div></div>
            <div className="info-group"><label>อาจารย์/ชื่อเล่น</label><div className="read-only-field">{selectedStudent.nickname}</div></div>
            <div className="info-group full-width"><label>อีเมล</label><div className="read-only-field">{selectedStudent.email}</div></div>
          </div>
          {/* ส่วน History Table (ย่อ) */}
          <div className="history-header" style={{ marginTop: '20px' }}>
             <h3>ประวัติการจอง ({monthLabel})</h3>
          </div>
          <table className="history-table">
            <thead>
              <tr><th>วันที่</th><th>ที่นั่ง</th><th>สถานะ</th></tr>
            </thead>
            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((b, i) => (
                  <tr key={i}>
                    <td>{formatDate(b.date)}</td>
                    <td>{b.room || "-"}</td>
                    <td>{b.status}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>ไม่มีข้อมูลในเดือนนี้</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- VIEW 2: หน้าตารางรวม (หน้าหลัก) ---
  return (
    <div className="student-list-container">
      {/* 1. Header บรรทัดแรก: หัวข้อ และ ปุ่มลบ */}
      <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h1 style={{ margin: 0 }}>Student Information</h1>
        <button 
          className="btn-delete" 
          style={{ 
            padding: '8px 16px', 
            backgroundColor: selectedIds.length > 0 ? '#ff4d4f' : '#f5f5f5',
            color: selectedIds.length > 0 ? 'white' : '#bfbfbf',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed'
          }}
          onClick={handleDelete} 
          disabled={selectedIds.length === 0}
        >
          ลบที่เลือก {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
        </button>
      </div>

      {/* 2. บรรทัดที่สอง: Search Bar (อยู่ใต้หัวข้อหลัก) */}
      <div className="search-section" style={{ marginBottom: '25px' }}>
        <div className="search-wrapper" style={{ position: 'relative', maxWidth: '500px' }}>
          <input 
            type="text" 
            placeholder="🔍 ค้นหาด้วยชื่อ หรือ รหัสนิสิต..." 
            className="search-input"
            style={{ 
              width: '100%', 
              padding: '12px 15px 12px 40px', 
              borderRadius: '8px', 
              border: '1px solid #dcdcdc',
              fontSize: '14px',
              outline: 'none',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>
            {/* คุณสามารถใส่ Icon Search ตรงนี้ได้ */}
          </span>
        </div>
      </div>

      {/* 3. ตารางข้อมูล */}
      <table className="main-student-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>
              <input 
                type="checkbox" 
                onChange={(e) => e.target.checked ? setSelectedIds(sortedStudents.map(s => s.id)) : setSelectedIds([])} 
                checked={selectedIds.length === sortedStudents.length && sortedStudents.length > 0} 
              />
            </th>
            <th onClick={() => handleSort("name")} className="sortable-header" style={{ cursor: 'pointer' }}>Name ↑↓</th>
            <th onClick={() => handleSort("studentNumber")} className="sortable-header" style={{ cursor: 'pointer' }}>Student Number ↑↓</th>
            <th>Email</th>
            <th onClick={() => handleSort("seat")} className="sortable-header" style={{ cursor: 'pointer' }}>Seat ↑↓</th>
            <th onClick={() => handleSort("status")} className="sortable-header" style={{ cursor: 'pointer' }}>Status ↑↓</th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.length > 0 ? (
            sortedStudents.map((s) => (
              <tr key={s.id} onClick={() => setSelectedStudent(s)} className="clickable-row" style={{ cursor: 'pointer' }}>
                <td onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(s.id)} 
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setSelectedIds(prev => isChecked ? [...prev, s.id] : prev.filter(id => id !== s.id));
                    }} 
                  />
                </td>
                <td><strong>{s.name}</strong> <span style={{fontSize: '12px', color: '#999'}}>({s.nickname})</span></td>
                <td>{s.studentNumber}</td>
                <td>{s.email}</td>
                <td>{s.seat}</td>
                <td>
                  <span className={`status-badge ${s.status.toLowerCase().replace(" ", "-")}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#999" }}>ไม่พบข้อมูลนิสิตที่ตรงกับการค้นหา</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}