import React, { useState, useEffect } from "react";
import "../styles/AdminReservation.css";

export default function AdminReservation() {
  const [allBookings, setAllBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  // ข้อมูล Mockup สำหรับการจองที่แอดมินต้องดูแล
  const MOCK_RESERVATIONS = [
    { id: 101, name: "ตัั้ง", studentId: "6612345678", seat: "A1", date: "2026-02-17", time: "13:00-14:00", status: "Active" },
    { id: 102, name: "แป้ง", studentId: "6512345678", seat: "A4", date: "2026-02-18", time: "10:00-12:00", status: "Active" },
    { id: 103, name: "โบ๊ท", studentId: "6712345678", seat: "B5", date: "2026-02-17", time: "09:00-11:00", status: "Cancelled" },
  ];

  useEffect(() => {
    // ในอนาคตดึงจาก localStorage หรือ API
    setAllBookings(MOCK_RESERVATIONS);
  }, []);

  const handleCancel = (id) => {
    if (window.confirm("คุณแน่ใจใช่ไหมที่จะยกเลิกการจองนี้?")) {
      setAllBookings(prev => prev.map(b => b.id === id ? { ...b, status: "Cancelled" } : b));
    }
  };

  const handleOpenModal = (booking = null) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  return (
    <div className="student-list-container">
      <div className="list-header">
        <div>
          <h1>Admin Reservation Management</h1>
          <p style={{ color: "#8c8c8c" }}>จัดการ แก้ไข หรือยกเลิกการจองของนิสิตได้ที่นี่</p>
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
          {allBookings.map((b) => (
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
                <button className="btn-nav" style={{ fontSize: "14px", width: "auto", padding: "0 10px", color: "#ff4d4f" }} onClick={() => handleCancel(b.id)}>ยกเลิก</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal แบบง่ายๆ สำหรับ Add/Edit */}
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
                <label>ที่นั่ง</label>
                <input className="read-only-field" style={{ background: "white", width: "100%" }} defaultValue={editingBooking?.seat} />
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