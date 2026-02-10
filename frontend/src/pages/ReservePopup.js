import React, { useEffect, useState } from "react";

function formatDate(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
}

export default function ReservePopup({ data, onClose, onAccept, onSelectSeat, allBookings }) {
  const [duration, setDuration] = useState(1);

  // คำนวณชั่วโมงสูงสุดที่ไม่เกินเวลาปิด 18.00
  const maxAvailableHours = Math.min(3, 18 - data.startTime);

  useEffect(() => {
    if (data.endTime && data.startTime) {
      const currentDuration = data.endTime - data.startTime;
      setDuration(currentDuration > maxAvailableHours ? maxAvailableHours : currentDuration);
    }
  }, [data.startTime, data.endTime, maxAvailableHours]);

  if (!data || typeof data.startTime !== "number") return null;

  const handleConfirm = () => {
    if (!data.seatId) {
      alert("กรุณาเลือกที่นั่งให้เรียบร้อย");
      return;
    }

    const newStartTime = data.startTime;
    const newEndTime = data.startTime + duration;
    const newDateStr = new Date(data.date).toDateString();

    // ✅ แก้ไข Logic ตรวจสอบการจองซ้อนให้ครอบคลุม 100%
    const isOverlapping = allBookings.some(b => {
      const bDateStr = new Date(b.date).toDateString();
      
      // เช็คเฉพาะที่นั่งเดียวกัน ในวันเดียวกัน
      if (bDateStr === newDateStr && b.seatId === data.seatId) {
        const existingStart = parseInt(b.startTime);
        const existingEnd = parseInt(b.endTime);

        // สูตรตรวจสอบการซ้อนทับ:
        // ถ้า (เวลาเริ่มใหม่ น้อยกว่า เวลาจบเดิม) และ (เวลาจบใหม่ มากกว่า เวลาเริ่มเดิม) 
        // แปลว่ามีการทับซ้อนกันแน่นอน ไม่ว่าจะทับบางส่วนหรือทับทั้งหมด
        if (newStartTime < existingEnd && newEndTime > existingStart) {
          return true;
        }
      }
      return false;
    });

    if (isOverlapping) {
      alert("❌ ไม่สามารถจองได้: ช่วงเวลานี้ที่นั่งถูกจองไปแล้ว หรือมีการจองบางส่วนซ้อนทับอยู่");
      return;
    }

    onAccept({
      ...data,
      startTime: newStartTime,
      endTime: newEndTime,
      date: data.date instanceof Date ? data.date : new Date(data.date),
    });
  };

  return (
    <div className="event-popup-overlay">
      <div className="event-popup">
        <div className="form-row space-between">
          <span>Duration (Max 3 hrs)</span>
          <select
            className="input-field"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            {Array.from({ length: maxAvailableHours }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i + 1 === 1 ? "hour" : "hours"}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row space-between">
          <span>Seat</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {data.seatId ? (
              <>
                <strong style={{ color: '#2ecc71', fontSize: '18px' }}>{data.seatId}</strong>
                <button className="btn-action" style={{ fontSize: '12px', padding: '4px 8px' }} 
                        onClick={() => onSelectSeat({...data, endTime: data.startTime + duration})}>Change</button>
              </>
            ) : (
              <button className="btn-action" onClick={() => onSelectSeat({...data, endTime: data.startTime + duration})}>Select seat</button>
            )}
          </div>
        </div>

        <div className="form-row space-between">
          <span>Date</span>
          <span>{formatDate(data.date)}</span>
        </div>

        <div className="form-row space-between">
          <span>Time</span>
          <span style={{ fontWeight: 'bold', color: '#3498db' }}>
            {data.startTime}:00 – {data.startTime + duration}:00
          </span>
        </div>

        <div className="form-actions-container">
          <button className="btn-action cancel" onClick={onClose}>Cancel</button>
          <button className="btn-action confirm" onClick={handleConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}