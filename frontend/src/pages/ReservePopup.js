import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ReservePopup({ data, onClose, onAccept }) {
  const navigate = useNavigate();

  const SEATMAP_ROUTE = "/seat-map";
  const RETURN_TO = "/reserve"; 
  const initialDuration = useMemo(() => {
    const dur = Number(data?.endTime) - Number(data?.startTime);
    if (Number.isFinite(dur) && dur >= 1) return dur;
    return 1;
  }, [data?.startTime, data?.endTime]);

  const [duration, setDuration] = useState(initialDuration);
  const [subject, setSubject] = useState(data?.subject || "");

  const hasSeat = Boolean(data?.seatId);

  const computedEndTime = useMemo(() => {
    return Number(data?.startTime) + Number(duration || 1);
  }, [data?.startTime, duration]);

  const handleSelectSeat = () => {
    
    navigate(SEATMAP_ROUTE, {
      state: {
        date: data?.date,
        startTime: data?.startTime,
        endTime: computedEndTime,
        subject,
        seatId: data?.seatId || null,
        returnTo: RETURN_TO,
      },
    });
  };

  const handleAccept = async () => {
    if (!hasSeat) {
      alert("กรุณาเลือกที่นั่งก่อน");
      return;
    }

    await onAccept?.({
      ...data,
      subject,
      endTime: computedEndTime,
    });

    onClose?.();
  };

  return (
    <div style={overlay}>
      <div style={popup}>
        <h3 style={title}>Reservation Details</h3>

        {/* Subject */}
        <div style={row}>
          <div style={label}>
            ✏️ <span>Subject</span>
          </div>
          <input
            style={input}
            placeholder="Enter subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Seat */}
        <div style={row}>
          <div style={label}>
            🪑 <span>Seat</span>
          </div>
          <button style={linkBtn} onClick={handleSelectSeat}>
            {hasSeat ? data.seatId : "Select Seat"}
          </button>
        </div>

        {/* Time */}
        <div style={row}>
          <div style={label}>
            ⏱ <span>Time Spent</span>
          </div>
          <select
            style={select}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            <option value={1}>1 hour</option>
            <option value={2}>2 hours</option>
            <option value={3}>3 hours</option>
          </select>
        </div>

        {/* Footer */}
        <div style={footer}>
          <button style={footerBtn} onClick={onClose}>
            Cancel
          </button>
          <button style={{ ...footerBtn, fontWeight: 600 }} onClick={handleAccept}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== styles ===== */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const popup = {
  width: 380,
  background: "#fff",
  borderRadius: 20,
  padding: 20,
};

const title = {
  marginBottom: 16,
  color: "#7b8dbd",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 0",
  borderBottom: "1px solid #eee",
};

const label = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  color: "#7b8dbd",
  fontWeight: 500,
};

const input = {
  border: "none",
  outline: "none",
  fontSize: 14,
  textAlign: "right",
  width: 150,
};

const select = {
  borderRadius: 8,
  padding: "4px 8px",
};

const linkBtn = {
  background: "none",
  border: "none",
  color: "#4a6cf7",
  cursor: "pointer",
  fontSize: 14,
};

const footer = {
  display: "flex",
  marginTop: 12,
  borderTop: "1px solid #eee",
};

const footerBtn = {
  flex: 1,
  padding: 12,
  border: "none",
  background: "none",
  cursor: "pointer",
  fontSize: 15,
};
