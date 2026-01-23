import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
//import "./ReservePopup.css";


export default function ReservePopup({ data, onClose }) {
  const navigate = useNavigate();

  const [start, setStart] = useState(data.hour);
  const [end, setEnd] = useState(data.hour + 1);

  const isValid = end > start && end - start <= 3;

  const handleConfirm = () => {
    if (!isValid) {
      alert("เลือกเวลาได้ไม่เกิน 3 ชั่วโมง");
      return;
    }

    navigate("/seatmap", {
      state: {
        date: data.date,
        startTime: `${start}:00`,
        endTime: `${end}:00`,
      },
    });
  };

  return (
    <div className="popup-backdrop">
      <div className="popup">
        <h3>Reserve</h3>

        <label>Start</label>
        <input
          type="number"
          min={9}
          max={18}
          value={start}
          onChange={(e) => setStart(Number(e.target.value))}
        />

        <label>End</label>
        <input
          type="number"
          min={start + 1}
          max={start + 3}
          value={end}
          onChange={(e) => setEnd(Number(e.target.value))}
        />

        <div className="actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleConfirm}>Select Seat</button>
        </div>
      </div>
    </div>
  );
}
