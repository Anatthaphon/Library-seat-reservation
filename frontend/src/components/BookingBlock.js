import React, { useState } from "react";
import "../styles/BookingBlock.css";

export default function BookingBlock({ booking, onRequestDelete, past }) {
  const [hover, setHover] = useState(false);

  const getColorByDay = (dateStr) => {
    const d = new Date(dateStr).getDay();
    const dayColors = {
      1: "#facc15", // Mon
      2: "#ec4899", // Tue
      3: "#22c55e", // Wed
      4: "#f97316", // Thu
      5: "#06b6d4", // Fri
      6: "#8b5cf6", // Sat
      0: "#9ca3af", // Sun
    };
    return dayColors[d] || "#3b82f6";
  };

  const themeColor = getColorByDay(booking.date);
  const duration = booking.endTime - booking.startTime;

  return (
    <div
      className={`new-booking-card ${past ? "is-past" : ""}`}
      style={{ 
        borderColor: themeColor,
        height: `calc(${duration} * 100% - 12px)`, 
        zIndex: 50 
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      // แก้ไขตรงนี้: กันการคลิกทะลุไปที่ cell ตาราง
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        className="card-header-bar"
        style={{ backgroundColor: themeColor }}
      >
        <span className="time-text-label">
          {booking.startTime}:00 – {booking.endTime}:00
        </span>
      </div>

      <div className="card-body-content">
        <span className="seat-number-text">
          Seat {booking.seatId}
        </span>

        {hover && !past && (
          <button
            className="delete-icon-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // กันไม่ให้เด้ง Popup จอง
              onRequestDelete(booking);
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}