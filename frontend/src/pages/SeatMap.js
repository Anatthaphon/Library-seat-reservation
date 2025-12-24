import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/SeatMap.css";

export default function SeatMap() {
  const location = useLocation();
  const state = location.state;
  const navigate = useNavigate();

  // ===== Seats layout (match your Figma) =====
  const SEATS = useMemo(() => {
  // ===== ค่าหลัก (ปรับทั้งกลุ่มได้) =====
  const LEFT_COL_X = 100;
  const RIGHT_A_X = 750;
  const RIGHT_B_X = 850;

  const TOP_Y = 90;
  const B_TOP_Y = 70;
  const B_STEP_Y = 50;
  const STEP_Y = 57;

  const TOP_ROW_Y = 30;
  const BOTTOM_ROW_Y = 695;

  return [
    // ===== A1–A11 (ซ้าย แนวตั้ง) =====
    ...Array.from({ length: 11 }, (_, i) => ({
      id: `A${i + 1}`,
      pos: { left: LEFT_COL_X, top: TOP_Y + i * STEP_Y },
    })),

    // ===== A13–A22 (ขวา แนวตั้ง) =====
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `A${22 - i}`,
      pos: { left: RIGHT_A_X, top: TOP_Y + i * STEP_Y },
    })),

    // ===== B4–B12 (ขวาสุด แนวตั้ง) =====
    ...Array.from({ length: 9 }, (_, i) => ({
      id: `B${4 + i}`,
      pos: { left: RIGHT_B_X, top: B_TOP_Y + i * B_STEP_Y },
    })),

    // ===== แถวบน =====
    { id: "C1", pos: { left: 630, top: TOP_ROW_Y } },
    { id: "B1", pos: { left: 700, top: TOP_ROW_Y } },
    { id: "B2", pos: { left: 757, top: TOP_ROW_Y } },
    { id: "B3", pos: { left: 815, top: TOP_ROW_Y } },

    // ===== แถวล่างกลาง =====
    { id: "C4", pos: { left: 350, top: 735 } },
    { id: "C5", pos: { left: 580, top: BOTTOM_ROW_Y } },
    { id: "C6", pos: { left: 690, top: BOTTOM_ROW_Y } },
    { id: "C7", pos: { left: 800, top: BOTTOM_ROW_Y } },

    // ===== C2, C3 =====
    { id: "C2", pos: { left: 220, top: 800 } },
    { id: "C3", pos: { left: 350, top: 800 } },

    // ===== B13–B15 (สามเหลี่ยม) =====
    { id: "B13", pos: { left: 85, top: 790 }, size: "tiny" },
    { id: "B14", pos: { left: 125, top: 790 }, size: "tiny" },
    { id: "B15", pos: { left: 105, top: 820 }, size: "tiny" },

  ];
}, []);

  // Hooks must be above conditional return
  const takenSeats = useMemo(() => new Set(), []);

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
        <div className="map-zoom">
        <div className="map-frame">
          {/* Outer decoration like your figma */}
          <div className="top-left-bar" />
          <div className="left-pillars">
            <div className="pillar" style={{ top: 40 }} />
            <div className="pillar" style={{ top: 210 }} />
            <div className="pillar" style={{ top: 390 }} />
            <div className="pillar" style={{ top: 560 }} />
          </div>
        </div>

          {/* Exit label */}
          <div className="map-label exit">ทางหนีไฟ</div>

          {/* Bookshelf center */}
          <div className="bookshelf">
            <span>ชั้นหนังสือ</span>
          </div>

          {/* Computer + A12 */}
          <div
            className="computer-zone"
            style={{
              left: 90,     // ขยับซ้ายอีกนิด
              top: 730,      // ลงล่างเล็กน้อย
              gap: 40,       // เพิ่มช่องระหว่าง A12 กับ Computer
              bottom: "auto",
            }}
          >
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
                  /^B([1-9]|1[0-2])$/.test(seatId) ? "seat-b" : "",
                  s.size === "tiny" ? "seat-tiny" : "",
                  isTaken ? "taken" : "",
                  isSelected ? "selected" : "",
                ].join(" ")}
                style={{ left: s.pos.left, top: s.pos.top }}
                onClick={() => handlePick(seatId)}
                disabled={isTaken}
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
