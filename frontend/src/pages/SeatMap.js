import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/SeatMap.css";

export default function SeatMap() {
  const location = useLocation();
  const state = location.state;
  const navigate = useNavigate();

  // ===== Seats layout (match your Figma) =====
  const SEATS = useMemo(() => {
    const leftX = 145;
    const rightAX = 700;
    const rightBX = 830;

    const topY = 120;
    const stepY = 62;

    return [
      // A1-A11 (left column)
      ...Array.from({ length: 11 }, (_, i) => ({
        id: `A${i + 1}`,
        pos: { left: leftX, top: topY + i * stepY },
      })),

      // Right A column (A22 down to A13)
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `A${22 - i}`, // A22..A13
        pos: { left: rightAX, top: topY + i * stepY },
      })),

      // Right B column (B4..B12)
      ...Array.from({ length: 9 }, (_, i) => ({
        id: `B${4 + i}`,
        pos: { left: rightBX, top: topY + i * stepY },
      })),

      // Top row: C4, B1, B2, B3
      { id: "C4-top", label: "C4", pos: { left: 650, top: 70 } },
      { id: "B1", pos: { left: 770, top: 70 } },
      { id: "B2", pos: { left: 830, top: 70 } },
      { id: "B3", pos: { left: 890, top: 70 } },

      // Bottom row C4 (4 blocks)
      { id: "C4-1", label: "C4", pos: { left: 360, top: 680 } },
      { id: "C4-2", label: "C4", pos: { left: 520, top: 680 } },
      { id: "C4-3", label: "C4", pos: { left: 660, top: 680 } },
      { id: "C4-4", label: "C4", pos: { left: 780, top: 680 } },


      // C2, C3
      { id: "C2", pos: { left: 260, top: 760 } },
      { id: "C3", pos: { left: 420, top: 760 } },

      // B13-B15 triangle
      { id: "B13", pos: { left: 95, top: 760 }, size: "tiny" },
      { id: "B14", pos: { left: 145, top: 735 }, size: "tiny" },
      { id: "B15", pos: { left: 145, top: 785 }, size: "tiny" },
    ];
  }, []);

  // Hooks must be above conditional return
  const takenSeats = useMemo(
    () => new Set(["A1", "A2", "B10", "C4-2"]), // ปรับได้ตามจริง
    []
  );
  const [selectedSeat, setSelectedSeat] = useState(null);

  if (!state) {
    return (
      <div className="seatmap-page" style={{ padding: 24 }}>
        <h2>ไม่มีข้อมูลการจอง</h2>
        <p>กรุณากลับไปหน้า Planning แล้วกดปุ่ม Reserve ใหม่ค่ะ</p>
        <button className="back-btn" onClick={() => navigate("/planning")}>
          กลับไป Planning
        </button>
      </div>
    );
  }

  const handlePick = (seatId) => {
    if (takenSeats.has(seatId)) return;
    setSelectedSeat(seatId);
  };

  const handleConfirm = () => {
    if (!selectedSeat) {
      alert("กรุณาเลือกที่นั่งก่อนค่ะ");
      return;
    }
    alert(
      `จองสำเร็จ!\nSeat: ${selectedSeat}\nDate: ${new Date(
        state.date
      ).toLocaleDateString()}\nTime: ${state.startTime || "--:--"} - ${
        state.endTime || "--:--"
      }`
    );
    navigate(-1);
  };

  return (
    <div className="seatmap-page">
      {/* ===== Header ===== */}
      <div className="seatmap-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="slot-info">
          <div className="slot-title">Reserve Seat</div>
          <div className="slot-sub">
            {new Date(state.date).toLocaleDateString()} |{" "}
            {state.startTime || "--:--"} - {state.endTime || "--:--"}
          </div>
        </div>
      </div>

      {/* ===== Canvas ===== */}
      <div className="seatmap-canvas">
        <div className="map-frame">
          {/* Outer decoration like your figma */}
          <div className="top-left-bar" />
          <div className="left-pillars">
            <div className="pillar" style={{ top: 40 }} />
            <div className="pillar" style={{ top: 210 }} />
            <div className="pillar" style={{ top: 390 }} />
            <div className="pillar" style={{ top: 560 }} />
          </div>

          {/* Exit label */}
          <div className="map-label exit">ทางหนีไฟ</div>

          {/* Bookshelf center */}
          <div className="bookshelf">
            <span>ชั้นหนังสือ</span>
          </div>

          {/* Computer + A12 */}
          <div className="computer-zone">
            <div className="seat seat-abs fixed-seat">A12</div>
            <div className="computer-box">Computer</div>
          </div>

          {/* Control room */}
          <div className="control-room">ห้องควบคุมไฟฟ้า</div>

          {/* Seats */}
          {SEATS.map((s) => {
            const seatId = s.id;
            const showText = s.label ?? s.id;
            const isTaken = takenSeats.has(seatId);
            const isSelected = selectedSeat === seatId;

            return (
              <button
                key={seatId}
                className={[
                  "seat",
                  "seat-abs",
                  s.size === "tiny" ? "seat-tiny" : "",
                  isTaken ? "taken" : "",
                  isSelected ? "selected" : "",
                ].join(" ")}
                style={{ left: s.pos.left, top: s.pos.top }}
                onClick={() => handlePick(seatId)}
                disabled={isTaken}
                title={showText}
              >
                {showText}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== Footer ===== */}
      <div className="seatmap-footer">
        <div className="selected-info">
          Selected: <b>{selectedSeat || "-"}</b>
        </div>

        <button className="confirm-btn" onClick={handleConfirm}>
          Confirm Reservation
        </button>
      </div>
    </div>
  );
}
