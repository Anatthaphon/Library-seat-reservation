import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/StudentInfo.css";

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
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/schedules`);
      
      const reservedOnly = response.data.filter(item => 
        item.status && item.status.toLowerCase() !== "planned"
      );

      const mappedData = reservedOnly.map(item => {
        const rawStatus = item.status?.toLowerCase();
        const displayStatus = rawStatus === "booked" ? "booked" : "inactive";

        return {
          id: item._id,
          name: item.title || "ไม่ระบุชื่อ",
          nickname: item.instructor?.fullName || "N/A",
          studentNumber: item.instructor?.username || "N/A",
          email: item.instructor?.email || "N/A",
          status: displayStatus 
        };
      });

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

  useEffect(() => {
    if (selectedStudent) {
      const fetchHistory = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/schedules`);
          const history = response.data.filter(b => 
            b.instructor?.username === selectedStudent.studentNumber &&
            b.status?.toLowerCase() !== "planned"
          );
          setStudentBookings(history); 
        } catch (error) {
          console.error("Error fetching history:", error);
        }
      };
      fetchHistory();
    }
  }, [selectedStudent]);

  const handlePrevMonth = () => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const filteredStudents = students.filter((s) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(searchLower) || 
      s.studentNumber.toLowerCase().includes(searchLower)
    );
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!sortColumn) return 0;
    let valA = a[sortColumn];
    let valB = b[sortColumn];
    return sortDirection === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  const handleSort = (column) => {
    const isCurrentCol = sortColumn === column;
    setSortDirection(isCurrentCol && sortDirection === "asc" ? "desc" : "asc");
    setSortColumn(column);
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายการที่เลือก ${selectedIds.length} รายการ?`)) {
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

  const arrowButtonStyle = {
    background: '#fff', border: '1px solid #ddd', borderRadius: '50%',
    width: '32px', height: '32px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', fontSize: '16px', color: '#22c55e'
  };

  if (loading) return <div className="loading" style={{ padding: "20px" }}>กำลังโหลดข้อมูล...</div>;

  if (selectedStudent) {
    // แก้ไขตรงนี้: ดึงแค่เดือนและปี พ.ศ.
    const monthLabel = currentViewDate.toLocaleString('th-TH', { month: 'long', year: 'numeric' });
    const filteredHistory = studentBookings.filter(b => {
      if (!b.date) return false;
      const bDate = new Date(b.date);
      return bDate.getMonth() === currentViewDate.getMonth() && 
             bDate.getFullYear() === currentViewDate.getFullYear();
    });

    const monthlyCancelCount = filteredHistory.filter(b => 
      String(b.status).toLowerCase() === "cancelled"
    ).length;

    return (
      <div className="student-detail-container">
        <button className="back-btn" onClick={() => { setSelectedStudent(null); setCurrentViewDate(new Date()); }}>← กลับหน้าหลัก</button>
        <div className="info-card">
          <h2>{selectedStudent.name}</h2>
          <div className="info-grid">
            <div className="info-group"><label>รหัสนิสิต</label><div className="read-only-field">{selectedStudent.studentNumber}</div></div>
            <div className="info-group"><label>อาจารย์/ชื่อเล่น</label><div className="read-only-field">{selectedStudent.nickname}</div></div>
            <div className="info-group full-width"><label>อีเมล</label><div className="read-only-field">{selectedStudent.email}</div></div>
          </div>

          <div className="history-header" style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '150px' }}></div> 
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button onClick={handlePrevMonth} style={arrowButtonStyle}>⟨</button>
              {/* แก้ไขตรงนี้: เอาคำว่าประวัติการจองและวงเล็บออก */}
              <h3 style={{ margin: 0, minWidth: '180px', textAlign: 'center' }}>{monthLabel}</h3>
              <button onClick={handleNextMonth} style={arrowButtonStyle}>⟩</button>
            </div>
            <div style={{ width: '150px', textAlign: 'right', fontWeight: '600' }}>
              จำนวนการยกเลิก: <span style={{ color: monthlyCancelCount >= 3 ? '#ff4d4f' : '#666' }}>{monthlyCancelCount}/3</span>
            </div>
          </div>

          <table className="history-table">
          <thead>
            {/* เพิ่ม !important เพื่อบังคับสี และใส่ border-radius เล็กน้อยถ้าต้องการ */}
            <tr style={{ backgroundColor: '#1b5e20', color: 'white' }}>
              <th style={{ color: 'white', backgroundColor: '#1b5e20' }}>วันที่</th>
              <th style={{ color: 'white', backgroundColor: '#1b5e20' }}>ที่นั่ง</th>
              <th style={{ color: 'white', backgroundColor: '#1b5e20' }}>สถานะ</th>
            </tr>
          </thead>
            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((b, i) => (
                  <tr key={i}>
                    <td>{formatDate(b.date)}</td>
                    <td>{typeof b.room === 'object' ? (b.room?.meta?.name || b.room?.name || "-") : (b.room || "-")}</td>
                    <td><span className={`status-badge ${b.status?.toLowerCase() === 'booked' ? 'booked' : 'inactive'}`}>
                      {b.status?.toLowerCase() === 'booked' ? 'Booked' : 'Inactive'}
                    </span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '30px' }}>ไม่มีข้อมูลการจองในเดือนนี้</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="student-list-container">
      <div className="list-header">
        <h1>Student Information</h1>
        <button className="btn-delete" onClick={handleDelete} disabled={selectedIds.length === 0}>
          ลบที่เลือก {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
        </button>
      </div>

      <div className="search-section">
        <input 
          type="text" 
          placeholder="🔍 ค้นหาด้วยชื่อ หรือ รหัสนิสิต..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <table className="main-student-table">
        <thead>
          {/* แก้ไขตรงนี้: หัวตารางหลักสีเขียว ตัวหนังสือสีขาว */}
          <tr style={{ backgroundColor: '#22c55e', color: 'white' }}>
            <th style={{ width: '40px' }}>
              <input 
                type="checkbox" 
                onChange={(e) => e.target.checked ? setSelectedIds(sortedStudents.map(s => s.id)) : setSelectedIds([])} 
                checked={selectedIds.length === sortedStudents.length && sortedStudents.length > 0} 
              />
            </th>
            <th onClick={() => handleSort("name")} style={{ cursor: 'pointer', color: 'white' }}>Name ↑↓</th>
            <th onClick={() => handleSort("studentNumber")} style={{ cursor: 'pointer', color: 'white' }}>Student Number ↑↓</th>
            <th style={{ color: 'white' }}>Email</th>
            <th style={{ color: 'white' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((s) => (
            <tr key={s.id} onClick={() => setSelectedStudent(s)} style={{ cursor: 'pointer' }}>
              <td onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(s.id)} 
                  onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id))} 
                />
              </td>
              <td><strong>{s.name}</strong> <small>({s.nickname})</small></td>
              <td>{s.studentNumber}</td>
              <td>{s.email}</td>
              <td><span className={`status-badge ${s.status}`}>{s.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}