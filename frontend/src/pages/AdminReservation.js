import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // อย่าลืมติดตั้ง axios: npm install axios
import "../styles/AdminReservation.css";

const API_BASE_URL = "http://localhost:3001/api/schedules";

export default function AdminReservation() {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const navigate = useNavigate();

  // --- 1. ฟังก์ชันดึงข้อมูลจาก Backend ---
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      
      // Mapping ข้อมูลจาก MongoDB ให้เข้ากับรูปแบบ Table
      const mappedBookings = response.data.map(b => ({
        id: b._id, // MongoDB ใช้ _id
        name: b.title || "จองที่นั่ง",
        studentId: b.instructor?.username || "N/A", // สมมติว่า studentId เก็บใน username ของ instructor
        seat: b.room || "-",
        date: new Date(b.date).toLocaleDateString('en-CA'), // Format: YYYY-MM-DD
        time: b.timeSlot ? `${b.timeSlot.startTime}-${b.timeSlot.endTime}` : "N/A",
        status: b.status === "booked" ? "Active" : "Cancelled"
      }));

      setAllBookings(mappedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      alert("ไม่สามารถดึงข้อมูลการจองได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // --- 2. ฟังก์ชันยกเลิกการจอง (ลบออกจาก DB) ---
  const handleCancel = async (id) => {
    if (window.confirm("คุณแน่ใจใช่ไหมที่จะยกเลิกการจองนี้? ข้อมูลจะถูกลบออกจากระบบ")) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        // อัปเดต UI หลังจากลบสำเร็จ
        setAllBookings(prev => prev.filter(b => b.id !== id));
        alert("ยกเลิกการจองสำเร็จ");
      } catch (error) {
        console.error("Error deleting booking:", error);
        alert("ไม่สามารถยกเลิกการจองได้");
      }
    }
  };

  const handleOpenModal = (booking = null) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  if (loading) return <div style={{ padding: "20px" }}>กำลังโหลดข้อมูลการจอง...</div>;

  return (
    <div className="student-list-container">
      <div className="list-header">
        <div>
          <h1>Admin Reservation Management</h1>
          <p style={{ color: "#8c8c8c" }}>จัดการ แก้ไข หรือยกเลิกการจองของนิสิตได้ที่นี่ (Backend Connected)</p>
        </div>
        <div className="header-actions">
          <button className="btn-add" onClick={() => handleOpenModal()}>+ จองให้นิสิต</button>
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
          {allBookings.length > 0 ? (
            allBookings.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.studentId}</td>
                <td><strong>{b.seat}</strong></td>
                <td>{b.date}</td>
                <td>{b.time}</td>
                <td>
                  <span className={`status-badge ${b.status === 'Cancelled' ? 'inactive' : 'check-in'}`}>
                    {b.status}
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>
                  <button className="btn-nav" style={{ fontSize: "14px", width: "auto", padding: "0 10px" }} onClick={() => handleOpenModal(b)}>แก้ไข</button>
                  <button className="btn-nav" style={{ fontSize: "14px", width: "auto", padding: "0 10px", color: "#ff4d4f" }} onClick={() => handleCancel(b.id)}>ลบ</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>ไม่พบข้อมูลการจอง</td></tr>
          )}
        </tbody>
      </table>

      {/* Modal สำหรับ Add/Edit */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="info-card" style={{ width: "500px", position: "relative" }}>
            <h2>{editingBooking ? "แก้ไขการจอง" : "จองที่นั่งใหม่ให้นิสิต"}</h2>
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
                <label style={{ visibility: "hidden" }}>Seat</label>
                <button
                  type="button"
                  className="btn-select-seat"
                  onClick={() => {
                    setIsModalOpen(false);
                    navigate("/seatmap");
                  }}
                >
                  เลือกที่นั่ง
                </button>
              </div>
            </div>
            <div style={{ marginTop: "30px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>ยกเลิก</button>
              <button className="btn-add" onClick={() => setIsModalOpen(false)}>บันทึกข้อมูล (ยังไม่เชื่อม API Update)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}