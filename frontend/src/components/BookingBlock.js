import { useState } from "react";
import "../styles/BookingBlock.css";

export default function BookingBlock({ booking, onRequestDelete }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="booking-block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div>{booking.seatId}</div>

      {hover && (
        <button
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRequestDelete(booking);
          }}
        >
          🗑
        </button>
      )}
    </div>
  );
}
