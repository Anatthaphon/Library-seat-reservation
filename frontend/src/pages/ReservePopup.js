import React, { useEffect, useState } from "react";

function formatDate(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ReservePopup({ data, onClose, onAccept, onSelectSeat }) {
  const [duration, setDuration] = useState(1);

  // ซิงค์ Duration เริ่มต้นจากข้อมูลที่ส่งมา (เช่น กรณีเราแก้เวลาใน Popup แล้วไปเลือกที่นั่ง)
  useEffect(() => {
    if (data.endTime && data.startTime) {
      setDuration(data.endTime - data.startTime);
    }
  }, [data.startTime, data.endTime]);

  if (!data || typeof data.startTime !== "number") return null;

  const handleConfirm = () => {
    // ตรวจสอบว่ามี seatId ใน data หรือยัง
    if (!data.seatId) {
      alert("กรุณาเลือกที่นั่งให้เรียบร้อย");
      return;
    }

    const dateObj = data.date instanceof Date ? data.date : new Date(data.date);
    if (isNaN(dateObj)) {
      alert("วันที่ไม่ถูกต้อง");
      return;
    }

    onAccept({
      ...data,
      startTime: data.startTime,
      endTime: data.startTime + duration,
      date: dateObj,
    });
  };

  const handleGoToSeatMap = () => {
    // ต้องอัปเดต endTime ตามที่เลือกใน Popup ก่อนส่งไปหน้า SeatMap
    onSelectSeat({
      ...data,
      endTime: data.startTime + duration
    });
  };

  return (
    <div className="event-popup-overlay">
      <div className="event-header-label">Reservation Details</div>
      <div className="event-popup">
        
        {/* เลือกเวลา */}
        <div className="form-row space-between">
          <span>Duration</span>
          <select
            className="input-field"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            <option value={1}>1 hour</option>
            <option value={2}>2 hours</option>
            <option value={3}>3 hours</option>
          </select>
        </div>

        {/* ที่นั่ง */}
        <div className="form-row space-between">
          <span>Seat</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {data.seatId ? (
              <>
                <strong style={{ color: '#2ecc71', fontSize: '18px' }}>{data.seatId}</strong>
                <button 
                  className="btn-action" 
                  style={{ fontSize: '12px', padding: '4px 8px' }} 
                  onClick={handleGoToSeatMap}
                >
                  Change
                </button>
              </>
            ) : (
              <button className="btn-action" onClick={handleGoToSeatMap}>
                Select seat
              </button>
            )}
          </div>
        </div>

        {/* วันที่ */}
        <div className="form-row space-between">
          <span>Date</span>
          <span>{formatDate(data.date)}</span>
        </div>

        {/* เวลาช่วงที่จอง */}
        <div className="form-row space-between">
          <span>Time</span>
          <span>
            {data.startTime}:00 – {data.startTime + duration}:00
          </span>
        </div>

        <div className="form-actions-container">
          <button className="btn-action cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-action confirm" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}