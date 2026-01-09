import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/planning.css";


const DAY_COLORS = {
  0: { border: "#ff4d4f", bg: "rgba(255,77,79,0.15)" },
  1: { border: "#fadb14", bg: "rgba(250,219,20,0.2)" },
  2: { border: "#ff85c0", bg: "rgba(255,133,192,0.2)" },
  3: { border: "#52c41a", bg: "rgba(82,196,26,0.2)" },
  4: { border: "#fa8c16", bg: "rgba(250,140,22,0.2)" },
  5: { border: "#1890ff", bg: "rgba(24,144,255,0.2)" },
  6: { border: "#722ed1", bg: "rgba(114,46,209,0.2)" },
};

export default function Reserve() {
  const navigate = useNavigate();
  const today = new Date();

  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [popup, setPopup] = useState(null);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return d;
  });

  const isSelectable = (date) => {
    const diff =
      (date.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 2;
  };

  const handleCellClick = (day, hour) => {
    if (!isSelectable(new Date(day))) return;
    setPopup({ day, hour, title: "" });
  };

  const saveEvent = () => {
    const newEvent = {
      ...popup,
      id: Date.now(),
      dayIndex: popup.day.getDay(),
    };
    setEvents([...events, newEvent]);
    setPopup(null);
  };

  const handleEventClick = (e) => {
    if (selected && selected.id === e.id) {
      setPopup(e);
      setSelected(null);
    } else {
      setSelected(e);
    }
  };

  return (
    <div className="planning-wrapper">
      <div className="calendar">
        {days.map((day, dIndex) => (
          <div
            key={dIndex}
            className={`day-column ${
              isSelectable(new Date(day)) ? "" : "disabled"
            }`}
          >
            <div className="day-header">
              {day.toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
              })}
            </div>

            {[9,10,11,12,13,14,15,16,17].map((h) => (
              <div
                key={h}
                className="time-cell"
                onClick={() => handleCellClick(day, h)}
              >
                {events
                  .filter(
                    (e) =>
                      e.hour === h &&
                      new Date(e.day).toDateString() ===
                        new Date(day).toDateString()
                  )
                  .map((e) => {
                    const c = DAY_COLORS[e.dayIndex];
                    return (
                      <div
                        key={e.id}
                        className="event-box"
                        style={{
                          borderColor: c.border,
                          backgroundColor: c.bg,
                        }}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          handleEventClick(e);
                        }}
                      >
                        {e.title}
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        ))}
      </div>

      <button
        className={`reserve-btn ${selected ? "active" : ""}`}
        disabled={!selected}
        onClick={() => navigate("/seat-map")}
      >
        Reserve
      </button>

      {popup && (
        <div className="popup">
          <div className="popup-box">
            <h3>Reserve</h3>
            <input
              placeholder="Title"
              value={popup.title}
              onChange={(e) =>
                setPopup({ ...popup, title: e.target.value })
              }
            />
            <div className="popup-actions">
              <button onClick={saveEvent}>Save</button>
              <button onClick={() => setPopup(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
