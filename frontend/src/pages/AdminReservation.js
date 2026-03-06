import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AdminReservation.css";

const API_BASE_URL = "http://localhost:3001/api/schedules";

export default function AdminReservation() {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const navigate = useNavigate();

  // --- ฟังก์ชันคำนวณ Status ที่แม่นยำขึ้น ---
  const calculateStatus = (bookingDate, timeSlot, dbStatus) => {
    const now = new Date(); 
    const bDate = new Date(bookingDate);
    const currentStatus = String(dbStatus || "").toLowerCase(); // ปรับเป็นตัวเล็กให้หมดเพื่อเช็คเงื่อนไขง่ายๆ

    if (currentStatus === "cancelled") return "Cancelled";

    // 1. แยกเวลา Start/End (รองรับรูปแบบ 10-13 จากรูปของคุณ)
    let startTimeStr = "00:00";
    let endTimeStr = "23:59";

    if (timeSlot && typeof timeSlot === 'object') {
      startTimeStr = timeSlot.startTime || "00:00";
      endTimeStr = timeSlot.endTime || "23:59";
    } else if (typeof timeSlot === 'string' && timeSlot.includes('-')) {
      [startTimeStr, endTimeStr] = timeSlot.split('-');
    }

    // 2. สร้างจุดเวลา Booking Start
    const bookingStart = new Date(bDate);
    const [sH, sM] = startTimeStr.includes(':') ? startTimeStr.split(':').map(Number) : [parseInt(startTimeStr), 0];
    bookingStart.setHours(sH, sM || 0, 0, 0);

    // 3. สร้างจุดเวลา Booking End
    const bookingEnd = new Date(bDate);
    const [eH, eM] = endTimeStr.includes(':') ? endTimeStr.split(':').map(Number) : [parseInt(endTimeStr), 0];
    bookingEnd.setHours(eH, eM || 0, 0, 0);

    // 4. จุดเวลาที่ถือว่า "สาย" (Start + 10 นาที)
    const lateThreshold = new Date(bookingStart.getTime() + 10 * 60000);

    // --- เช็คสถานะตามลำดับความสำคัญ ---
    
    // A. ถ้าเวลาตอนนี้เลยเวลาจบการจองไปแล้ว
    if (now > bookingEnd) return "Completed";

    // B. ถ้ายังไม่ถึงเวลาเริ่มจอง
    if (now < bookingStart) return "Booked";

    // C. อยู่ในช่วงเวลาจองแล้ว (Check In หรือยัง?)
    // ถ้าสถานะใน DB ยังเป็น 'booked' แต่เวลาตอนนี้เลยช่วงสาย (10 นาทีแรก) มาแล้ว
    if (currentStatus === "booked" && now > lateThreshold) {
        return "Late";
    }

    // D. ถ้าเช็คอินแล้ว (เช่นสถานะเปลี่ยนเป็น active หรือ checked-in)
    if (currentStatus === "active" || currentStatus === "checked-in") {
        return "Active";
    }

    // E. ถึงเวลาจองแล้วแต่ยังไม่เกิน 10 นาที (ยังไม่สาย)
    return "Booked";
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      
      const mappedBookings = response.data.map(b => {
        const calculated = calculateStatus(b.date, b.timeSlot, b.status);
        
        let displayTime = "N/A";
        if (b.timeSlot && typeof b.timeSlot === 'object') {
          displayTime = `${b.timeSlot.startTime}-${b.timeSlot.endTime}`;
        } else if (typeof b.timeSlot === 'string') {
          displayTime = b.timeSlot;
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

      // เรียงวันที่ใหม่ไปเก่า
      mappedBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAllBookings(mappedBookings);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const timer = setInterval(fetchBookings, 30000); // อัปเดตทุก 30 วินาที
    return () => clearInterval(timer);
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "Active": return "check-in";
      case "Late": return "late"; 
      case "Booked": return "booked";
      case "Completed": return "inactive";
      case "Cancelled": return "inactive";
      default: return "";
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบรายการนี้?")) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        setAllBookings(prev => prev.filter(b => b.id !== id));
      } catch (err) {
        alert("ลบไม่สำเร็จ");
      }
    }
  };

  if (loading) return <div style={{padding: "20px"}}>กำลังเชื่อมต่อฐานข้อมูล...</div>;

  return (
    <div className="student-list-container">
      <div className="list-header">
        <div>
          <h1>Admin Reservation Management</h1>
          <p style={{ color: "#8c8c8c" }}>ข้อมูลอัปเดตอัตโนมัติ (6 มีนาคม 2569)</p>
        </div>
        <div className="header-actions">
          <button className="btn-add" onClick={() => setIsModalOpen(true)}>+ จองให้นิสิต</button>
        </div>
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
              <td>
                <span className={`status-badge ${getStatusClass(b.status)}`}>
                  {b.status}
                </span>
              </td>
              <td style={{ textAlign: "center" }}>
                <button className="btn-nav" style={{width: "auto", padding: "0 10px"}} onClick={() => { setEditingBooking(b); setIsModalOpen(true); }}>แก้ไข</button>
                <button className="btn-nav" style={{ width: "auto", padding: "0 10px", color: "#ff4d4f" }} onClick={() => handleCancel(b.id)}>ลบ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="info-card" style={{ width: "500px", position: "relative" }}>
            <h2>{editingBooking ? "แก้ไขการจอง" : "เพิ่มการจองใหม่"}</h2>
            <div className="info-grid">
              <div className="info-group full-width">
                <label>รหัสนิสิต / ชื่อ</label>
                <input className="read-only-field" style={{ background: "white", width: "100%" }} defaultValue={editingBooking?.name} />
              </div>
              <div className="info-group">
                <label>วันที่</label>
                <input type="date" className="read-only-field" style={{ background: "white", width: "100%" }} defaultValue={editingBooking?.date} />
              </div>
              <div className="info-group">
                <label style={{ visibility: "hidden" }}>เลือกที่นั่ง</label>
                <button type="button" className="btn-select-seat" onClick={() => navigate("/seatmap")}>เลือกที่นั่ง</button>
              </div>
            </div>
            <div style={{ marginTop: "30px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>ยกเลิก</button>
              <button className="btn-add" onClick={() => setIsModalOpen(false)}>บันทึกข้อมูล</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}