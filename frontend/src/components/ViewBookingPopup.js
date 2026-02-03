import React from "react";
import "../styles/ReservePopup.css"; // ใช้ CSS ร่วมกับของเดิมได้

export default function ViewBookingPopup({ booking, onClose, onDelete }) {
  if (!booking) return null;

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
      <div className="event-header-label">Booking Details</div>
      <div className="event-popup">
        
        <div className="form-row space-between">
          <span>Duration</span>
          <span className="input-field-readonly">{booking.endTime - booking.startTime} hours</span>
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
            {booking.startTime}:00 – {booking.endTime}:00
          </span>
        </div>

        <div className="form-actions-container" style={{ justifyContent: 'space-between' }}>
          <button 
            className="btn-action cancel" 
            style={{ backgroundColor: '#ff4d4f', color: 'white' }} 
            onClick={() => onDelete(booking)}
          >
            Delete
          </button>
          <button className="btn-action confirm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}