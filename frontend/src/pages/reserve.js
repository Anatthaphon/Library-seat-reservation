import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import "./Planning.css";
import ReservePopup from "./ReservePopup";

export default function Reserve() {
  const navigate = useNavigate();
  const location = useLocation();

  const [popup, setPopup] = useState(null);
  const [bookings, setBookings] = useState([]);

  // รับผลจองกลับมาจาก SeatMap
  useEffect(() => {
    if (location.state && location.state.booking) {
      setBookings((prev) => [...prev, location.state.booking]);
    }
  }, [location.state]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // active ได้แค่ 3 วัน (today + 2)
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 2);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, []);

  const hours = Array.from({ length: 10 }, (_, i) => 9 + i);

  const isSameDay = (a, b) =>
    new Date(a).toDateString() === new Date(b).toDateString();

  return (
    <div className="planning-wrapper">
      <h1>Hello World</h1>
      <div className="calendar-box">
        {/* ===== Header ===== */}
        <div className="calendar-header">
          {days.map((d) => (
            <div key={d.toDateString()} className="day-title">
              {d.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
              })}
            </div>
          ))}
        </div>

        {/* ===== Calendar Grid ===== */}
        <div className="calendar-grid">
          {hours.map((hour) => (
            <div className="hour-row" key={hour}>
              {days.map((day) => {
                const disabled = day < today || day > maxDate;

                return (
                  <div
                    key={day.toDateString() + hour}
                    className={`cell ${disabled ? "disabled" : ""}`}
                    onClick={() =>
                      !disabled && setPopup({ date: day, hour })
                    }
                  >
                    {bookings
                      .filter(
                        (b) =>
                          isSameDay(b.date, day) &&
                          parseInt(b.startTime) === hour
                      )
                      .map((b, i) => (
                        <div
                          key={i}
                          className={`booking color-${
                            new Date(b.date).getDate() % 3
                          }`}
                        >
                          <div className="time">
                            {b.startTime} - {b.endTime}
                          </div>
                          <div className="seat">{b.seatId}</div>
                        </div>
                      ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ===== Popup ===== */}
      {popup && (
        <ReservePopup
          data={popup}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
