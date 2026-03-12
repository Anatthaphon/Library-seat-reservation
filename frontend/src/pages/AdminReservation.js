import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/AdminReservation.css";

const API_BASE_URL = "http://localhost:3001/api/schedules";

export default function AdminReservation() {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  
  const [selectedSeatFromMap, setSelectedSeatFromMap] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    duration: "1"
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  // ดึงวันที่วันนี้ในรูปแบบ YYYY-MM-DD สำหรับใช้กับ attribute "min"
  const todayStr = new Date().toISOString().split('T')[0];

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      const mappedBookings = response.data.map(b => {
        const calculated = calculateStatus(b.date, b.timeSlot, b.status);
        let displayTime = "N/A";
        if (b.timeSlot && typeof b.timeSlot === 'object') {
          displayTime = `${b.timeSlot.startTime}-${b.timeSlot.endTime}`;
        }
        return {
          id: b._id,
          name: b.title || "Seat Reservation",
          studentId: b.instructor?.username || "N/A",
          seat: b.room || "-",
          date: new Date(b.date).toLocaleDateString('en-CA'),
          time: displayTime,
          status: calculated
        };
      });
      setAllBookings(mappedBookings.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (location.state?.seatName) {
      setSelectedSeatFromMap(location.state.seatName);
      setIsModalOpen(true); 
      if (location.state.id) {
        const original = allBookings.find(b => b.id === location.state.id);
        if (original) setEditingBooking(original);
      } else {
        setFormData({
          name: location.state.name || "",
          date: location.state.date || todayStr,
          startTime: location.state.startTime || "09:00",
          duration: location.state.duration || "1"
        });
      }
    }
  }, [location.state, allBookings]);

  useEffect(() => {
    fetchBookings();
    const timer = setInterval(fetchBookings, 30000);
    return () => clearInterval(timer);
  }, []);

  const calculateStatus = (bookingDate, timeSlot, dbStatus) => {
    const now = new Date(); 
    const bDate = new Date(bookingDate);
    if (String(dbStatus || "").toLowerCase() === "cancelled") return "Cancelled";
    let sTime = timeSlot?.startTime || "00:00";
    let eTime = timeSlot?.endTime || "23:59";
    const bStart = new Date(bDate).setHours(parseInt(sTime), 0, 0, 0);
    const bEnd = new Date(bDate).setHours(parseInt(eTime), 0, 0, 0);
    if (now > bEnd) return "Completed";
    if (now < bStart) return "Booked";
    return "Active";
  };

  const handleSave = async () => {
    if (!selectedSeatFromMap || (!editingBooking && !formData.name)) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน!");
      return;
    }
    const startHour = parseInt(formData.startTime);
    const endHour = startHour + parseInt(formData.duration);
    const endTimeStr = `${endHour < 10 ? '0' + endHour : endHour}:00`;

    const payload = {
      title: editingBooking ? editingBooking.name : formData.name,
      date: editingBooking ? editingBooking.date : formData.date,
      room: selectedSeatFromMap,
      timeSlot: {
        startTime: editingBooking ? editingBooking.time.split('-')[0] : formData.startTime,
        endTime: editingBooking ? editingBooking.time.split('-')[1] : endTimeStr
      },
      status: "booked"
    };

    try {
      if (editingBooking?.id) await axios.put(`${API_BASE_URL}/${editingBooking.id}`, payload);
      else await axios.post(API_BASE_URL, payload);
      alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
      setIsModalOpen(false);
      fetchBookings();
    } catch (err) { alert("ไม่สามารถบันทึกข้อมูลได้"); }
  };

  const handleCancel = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบรายการนี้?")) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        fetchBookings();
      } catch (err) { alert("ลบไม่สำเร็จ"); }
    }
  };

  const goToSeatMap = () => {
    navigate("/seatmap", {
      state: {
        returnTo: "/admin-reservation",
        id: editingBooking?.id,
        name: editingBooking ? editingBooking.name : formData.name,
        date: editingBooking ? editingBooking.date : formData.date,
        startTime: formData.startTime,
        duration: formData.duration
      }
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Active": return "check-in";
      case "Booked": return "booked";
      default: return "inactive";
    }
  };

  // สไตล์มินิมอลตามเรฟ
  const minimalInputStyle = {
    height: "38px",
    borderRadius: "8px",
    border: "1px solid #dcdcdc",
    padding: "0 12px",
    fontSize: "14px",
    color: "#333",
    backgroundColor: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box"
  };

  const minimalSelectStyle = {
    ...minimalInputStyle,
    cursor: "pointer",
    backgroundColor: "#fcfcfc",
    appearance: "auto" 
  };

  // Logic สำหรับกรองเวลาที่จองได้
  const getAvailableHours = () => {
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    const now = new Date();
    const currentHour = now.getHours();
    
    // ถ้าเป็นวันที่ปัจจุบัน ให้กรองเอาเฉพาะชั่วโมงที่มากกว่าเวลาปัจจุบัน
    if (formData.date === todayStr) {
      return hours.filter(h => h > currentHour);
    }
    return hours;
  };

  return (
    <div className="student-list-container">
      <div className="list-header">
        <h1>Admin Reservation Management</h1>
        <button className="btn-add" onClick={() => { 
          setEditingBooking(null); 
          setSelectedSeatFromMap(""); 
          setFormData({ name: "", date: todayStr, startTime: "09:00", duration: "1" });
          setIsModalOpen(true); 
        }}>+ จองให้นิสิต</button>
      </div>

      <table className="main-student-table">
        <thead>
          <tr>
            <th>ชื่อ-นามสกุล</th>
            <th>รหัสนิสิต</th>
            <th>ที่นั่ง</th>
            <th>วันที่</th>
            <th>เวลา</th>
            <th>สถานะ</th>
            <th style={{ textAlign: "center" }}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {allBookings.map((b) => (
            <tr key={b.id}>
              <td>{b.name}</td>
              <td>{b.studentId}</td>
              <td><strong>{b.seat}</strong></td>
              <td>{b.date}</td>
              <td>{b.time}</td>
              <td><span className={`status-badge ${getStatusClass(b.status)}`}>{b.status}</span></td>
              <td style={{ textAlign: "center" }}>
                <button className="btn-nav" onClick={() => { setEditingBooking(b); setSelectedSeatFromMap(b.seat); setIsModalOpen(true); }}>แก้ไข</button>
                <button className="btn-nav" style={{ color: "#ff4d4f" }} onClick={() => handleCancel(b.id)}>ลบ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="info-card" style={{ width: "550px", padding: "30px", borderRadius: "15px" }}>
            <h2 style={{ marginBottom: "5px", fontSize: "1.3rem" }}>{editingBooking ? "แก้ไขการจอง" : "เพิ่มการจองใหม่"}</h2>
            <p style={{ fontSize: "13px", color: "#8c8c8c", marginBottom: "25px" }}>กรุณากรอกรายละเอียดการจองที่นั่งให้ครบถ้วน</p>
            
            <div className="info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="info-group">
                <label style={{ fontSize: "13px", color: "#555", fontWeight: "500" }}>รหัสนิสิต / ชื่อ</label>
                <input 
                  type="text"
                  placeholder="ระบุตัวตน"
                  style={minimalInputStyle}
                  value={editingBooking ? editingBooking.name : formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={!!editingBooking}
                />
              </div>

              <div className="info-group">
                <label style={{ fontSize: "13px", color: "#555", fontWeight: "500" }}>ที่นั่งที่เลือก</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input readOnly value={selectedSeatFromMap} placeholder="ที่นั่ง" style={{ ...minimalInputStyle, flex: 1, backgroundColor: "#f5f5f5" }} />
                  <button type="button" className="btn-select-seat" onClick={goToSeatMap} style={{ width: "65px", height: "38px", borderRadius: "8px", backgroundColor: "#22c55e", color: "white", border: "none", cursor: "pointer" }}>เลือก</button>
                </div>
              </div>

              <div className="info-group">
                <label style={{ fontSize: "13px", color: "#555", fontWeight: "500" }}>วันที่</label>
                <input 
                  type="date" 
                  style={minimalInputStyle}
                  min={todayStr} // [BLOCK] ป้องกันการเลือกวันย้อนหลัง
                  value={editingBooking ? editingBooking.date : formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  disabled={!!editingBooking}
                />
              </div>

              <div className="info-group">
                <label style={{ fontSize: "13px", color: "#555", fontWeight: "500" }}>เริ่มเวลา</label>
                <select 
                  style={minimalSelectStyle}
                  value={formData.startTime} 
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                >
                  {getAvailableHours().length > 0 ? (
                    getAvailableHours().map(h => (
                      <option key={h} value={`${h < 10 ? '0'+h : h}:00`}>{h}:00 น.</option>
                    ))
                  ) : (
                    <option value="">ไม่มีเวลาที่จองได้</option>
                  )}
                </select>
              </div>

              <div className="info-group">
                <label style={{ fontSize: "13px", color: "#555", fontWeight: "500" }}>ระยะเวลา</label>
                <select 
                  style={minimalSelectStyle}
                  value={formData.duration} 
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  disabled={getAvailableHours().length === 0}
                >
                  <option value="1">1 ชม.</option>
                  <option value="2">2 ชม.</option>
                  <option value="3">3 ชม.</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "35px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)} style={{ height: "40px", padding: "0 20px", border: "1px solid #d9d9d9", background: "#fff", borderRadius: "8px", cursor: "pointer" }}>ยกเลิก</button>
              <button 
                className="btn-add" 
                onClick={handleSave} 
                disabled={getAvailableHours().length === 0 && !editingBooking}
                style={{ 
                  height: "40px", 
                  padding: "0 25px", 
                  background: (getAvailableHours().length === 0 && !editingBooking) ? "#ccc" : "#22c55e", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: "8px", 
                  cursor: (getAvailableHours().length === 0 && !editingBooking) ? "not-allowed" : "pointer", 
                  fontWeight: "500" 
                }}
              >
                บันทึกข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}