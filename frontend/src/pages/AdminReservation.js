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
  const todayStr = new Date().toISOString().split('T')[0];

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      const mappedBookings = response.data.map(b => {
        const calculated = calculateStatus(b.date, b.timeSlot, b.status);
        return {
          id: b._id,
          name: b.title || "N/A", 
          studentId: b.instructor?.username || "N/A", 
          // เก็บทั้ง ID จริง (roomId) และชื่อที่โชว์ (seat)
          roomId: b.room && typeof b.room === 'object' ? b.room._id : b.room,
          seat: b.room && typeof b.room === 'object' 
                ? (b.room.meta?.name || b.room._id) 
                : (b.room || "-"),
          date: new Date(b.date).toLocaleDateString('en-CA'),
          time: b.timeSlot ? `${b.timeSlot.startTime}-${b.timeSlot.endTime}` : "N/A",
          status: calculated,
          rawTimeSlot: b.timeSlot // เก็บก้อนดิบไว้ใช้ตอนแก้ไข
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
        if (original) {
          setEditingBooking(original);
          setFormData({
            name: original.name,
            date: original.date,
            startTime: original.time.split('-')[0],
            duration: location.state.duration || "1"
          });
        }
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
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!selectedSeatFromMap || !formData.name) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน!");
      return;
    }

    const startHour = parseInt(formData.startTime);
    const endHour = startHour + parseInt(formData.duration);
    const endTimeStr = `${endHour < 10 ? '0' + endHour : endHour}:00`;

    // ค้นหาข้อมูลเดิมเพื่อดึง Room ID ที่ถูกต้องส่งกลับไป (ป้องกัน Error 400)
    const originalBooking = allBookings.find(b => b.id === editingBooking?.id);
    const roomToSave = (selectedSeatFromMap === originalBooking?.seat) 
                       ? originalBooking.roomId 
                       : selectedSeatFromMap;

    const payload = {
      title: formData.name,
      date: formData.date,
      room: roomToSave, 
      timeSlot: {
        startTime: formData.startTime,
        endTime: endTimeStr
      },
      status: "booked"
    };

    try {
      if (editingBooking?.id) {
        await axios.put(`${API_BASE_URL}/${editingBooking.id}`, payload);
      } else {
        // สำหรับเพิ่มใหม่ ถ้า backend บังคับใส่ instructor
        payload.instructor = { username: user.username || "admin" };
        await axios.post(API_BASE_URL, payload);
      }
      alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
      setIsModalOpen(false);
      fetchBookings();
    } catch (err) { 
      console.error("Save Error Details:", err.response?.data);
      alert(err.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้ (Error 400: ข้อมูลไม่ถูกต้อง)"); 
    }
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
        name: formData.name,
        date: formData.date,
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

  const minimalInputStyle = {
    height: "38px", borderRadius: "8px", border: "1px solid #dcdcdc",
    padding: "0 12px", fontSize: "14px", color: "#333", backgroundColor: "#fff",
    outline: "none", width: "100%", boxSizing: "border-box"
  };

  const minimalSelectStyle = { ...minimalInputStyle, cursor: "pointer", backgroundColor: "#fcfcfc", appearance: "auto" };

  const getAvailableHours = () => {
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    if (formData.date === todayStr) {
      const currentHour = new Date().getHours();
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
                <button className="btn-nav" onClick={() => { 
                  setEditingBooking(b); 
                  setSelectedSeatFromMap(b.seat);
                  setFormData({
                    name: b.name,
                    date: b.date,
                    startTime: b.time.split('-')[0],
                    duration: "1"
                  });
                  setIsModalOpen(true); 
                }}>แก้ไข</button>
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
                  style={minimalInputStyle}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                  min={todayStr}
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
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
                style={{ 
                  height: "40px", padding: "0 25px", 
                  background: "#22c55e", 
                  color: "#fff", border: "none", borderRadius: "8px", 
                  cursor: "pointer", fontWeight: "500" 
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