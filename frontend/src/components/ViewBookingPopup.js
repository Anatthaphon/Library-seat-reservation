import React from "react";
import "../styles/ReservePopup.css"; 

export default function ViewBookingPopup({ booking, onClose, onDelete }) {
  if (!booking) return null;

  // ✅ ฟังก์ชันแปลงเวลาให้เป็นตัวเลขที่แน่นอน ป้องกัน NaN
  const start = parseInt(booking.startTime, 10);
  const end = parseInt(booking.endTime, 10);
  const durationHours = end - start;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="event-popup-overlay">
      <div className="event-popup">
        
        <div className="form-row space-between">
          <span>Duration</span>
          {/* ✅ แสดงจำนวนชั่วโมงที่คำนวณใหม่ */}
          <span className="input-field-readonly">{durationHours} hours</span>
        </div>

        <div className="form-row space-between">
          <span>Seat</span>
          <strong style={{ color: '#2ecc71', fontSize: '18px' }}>{booking.seatId}</strong>
        </div>

        <div className="form-row space-between">
          <span>Date</span>
          <span>{formatDate(booking.date)}</span>
        </div>

        <div className="form-row space-between">
          <span>Time</span>
          <span>
            {/* ✅ แสดงเวลาแบบ HH:00 ป้องกันวินาทีโผล่ */}
            {start}:00 – {end}:00
          </span>
        </div>

        <div className="form-actions-container" style={{ justifyContent: 'space-between', marginTop: '20px' }}>
          <button 
            className="btn-action cancel" 
            style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none' }} 
            onClick={() => onDelete(booking)}
          >
            Delete
          </button>
          <button className="btn-action confirm" onClick={onClose} style={{ border: 'none' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}