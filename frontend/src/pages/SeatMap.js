import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/SeatMap.css';

export default function SeatMap() {
  const location = useLocation();
  const state = location.state; // { date, startTime, endTime, scheduleId, title }
  const navigate = useNavigate();

  // ถ้าเข้าหน้านี้ตรง ๆ โดยไม่มี state ให้เด้งกลับไป Planning
  if (!state) {
    return (
      <div className="seatmap-page" style={{ padding: 24 }}>
        <h2>ไม่มีข้อมูลการจอง</h2>
        <p>กรุณากลับไปหน้า Planning แล้วกดปุ่ม Reserve ใหม่ค่ะ</p>
        <button className="back-btn" onClick={() => navigate('/planning')}>กลับไป Planning</button>
      </div>
    );
  }

  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const cols = 10;

  const takenSeats = useMemo(() => new Set(['A1', 'A2', 'C5', 'D6', 'F10']), []);

  const [selectedSeat, setSelectedSeat] = useState(null);

  const handlePick = (seatId) => {
    if (takenSeats.has(seatId)) return;
    setSelectedSeat(seatId);
  };

  const handleConfirm = () => {
    if (!selectedSeat) {
      alert('กรุณาเลือกที่นั่งก่อนค่ะ');
      return;
    }

    alert(
      `จองสำเร็จ!\nSeat: ${selectedSeat}\nDate: ${new Date(state.date).toLocaleDateString()}\nTime: ${state.startTime} - ${state.endTime || '--:--'}`
    );

    navigate(-1);
  };

  return (
    <div className="seatmap-page">
      <div className="seatmap-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        <div className="slot-info">
          <div className="slot-title">Reserve Seat</div>
          <div className="slot-sub">
            {new Date(state.date).toLocaleDateString()} | {state.startTime || '--:--'} - {state.endTime || '--:--'}
          </div>
        </div>
      </div>

      <div className="screen">SCREEN</div>

      <div className="seats">
        {rows.map((r) => (
          <div className="seat-row" key={r}>
            <div className="row-label">{r}</div>

            <div className="row-seats">
              {Array.from({ length: cols }, (_, i) => {
                const seatId = `${r}${i + 1}`;
                const isTaken = takenSeats.has(seatId);
                const isSelected = selectedSeat === seatId;

                return (
                  <button
                    key={seatId}
                    className={`seat ${isTaken ? 'taken' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handlePick(seatId)}
                    disabled={isTaken}
                    title={seatId}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="seatmap-footer">
        <div className="selected-info">
          Selected: <b>{selectedSeat || '-'}</b>
        </div>

        <button className="confirm-btn" onClick={handleConfirm}>
          Confirm Reservation
        </button>
      </div>
    </div>
  );
}
