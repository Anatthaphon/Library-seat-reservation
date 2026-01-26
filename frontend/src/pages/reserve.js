import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import ReservePopup from "./ReservePopup";
import CancelPopup from "../components/CancelPopup";
import BookingBlock from "../components/BookingBlock";
import "../styles/Reserve.css";

export default function Reserve() {
  const location = useLocation();

  // booking ที่ยืนยันแล้ว
  const [bookings, setBookings] = useState([]);

  // booking ที่กำลังเลือก (popup จอง)
  const [draft, setDraft] = useState(null);

  // booking ที่จะลบ
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);

  // คุมสัปดาห์
  const [weekOffset, setWeekOffset] = useState(0);

  // ===== รับค่ากลับจาก SeatMap =====
  useEffect(() => {
    if (location.state?.booking) {
      setDraft(location.state.booking);
    }
  }, [location.state]);

  // ===== วันนี้ =====
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // ===== จองได้แค่ 3 วัน =====
  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() + 2);
    return d;
  }, [today]);

  // ===== วันในสัปดาห์ =====
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + weekOffset * 7 + i);
      return d;
    });
  }, [today, weekOffset]);

  // ชั่วโมง 09:00 - 18:00
  const hours = Array.from({ length: 10 }, (_, i) => 9 + i);

  // ===== disable logic =====
  const isDisabled = (day) => {
    if (day < today) return true;
    if (day.getDay() === 0) return true;
    if (day > maxDate) return true;
    return false;
  };

  // ===== เช็ค booking ผ่านเวลาแล้วไหม =====
  const isPastBooking = (booking) => {
    const now = new Date();
    const bookingEnd = new Date(booking.date);
    bookingEnd.setHours(booking.endTime, 0, 0, 0);
    return bookingEnd < now;
  };

  return (
    <div className="planning-wrapper">
      <div className="calendar-box">

        {/* ===== Navigation ===== */}
        <div className="calendar-nav">
          <button onClick={() => setWeekOffset((w) => w - 1)}>‹</button>
          <span>
            {days[0].toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
            })}
            {" – "}
            {days[6].toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
            })}
          </span>
          <button onClick={() => setWeekOffset((w) => w + 1)}>›</button>
        </div>

        {/* ===== Calendar ===== */}
        <div className="calendar-scroll">
          <div className="calendar-header">
            <div className="time-col" />
            {days.map((d) => (
              <div key={d.toDateString()} className="day-title">
                {d.toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                })}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {hours.map((hour) => (
              <div className="hour-row" key={hour}>
                <div className="time-col">{hour}:00</div>

                {days.map((day) => {
                  const disabled = isDisabled(day);

                  const bookingHere = bookings.find(
                    (b) =>
                      new Date(b.date).toDateString() ===
                        day.toDateString() &&
                      hour >= b.startTime &&
                      hour < b.endTime
                  );

                  return (
                    <div
                      key={day.toDateString() + hour}
                      className={`cell ${disabled ? "disabled" : ""}`}
                      onClick={() => {
                        if (disabled || bookingHere) return;

                        setDraft({
                          date: day,
                          startTime: hour,
                          endTime: hour + 1,
                          seatId: null,
                        });
                      }}
                    >
                      {bookingHere && (
                        <BookingBlock
                          booking={bookingHere}
                          past={isPastBooking(bookingHere)}
                          onRequestDelete={(b) => {
                            setSelectedBooking(b);
                            setShowCancelPopup(true);
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Popup จอง ===== */}
      {draft && (
        <ReservePopup
          data={draft}
          onClose={() => setDraft(null)}
          onAccept={(finalBooking) => {
            setBookings((prev) => [...prev, finalBooking]);
            setDraft(null);
          }}
        />
      )}

      {/* ===== Popup ลบ ===== */}
      {showCancelPopup && (
        <CancelPopup
          onCancel={() => {
            setShowCancelPopup(false);
            setSelectedBooking(null);
          }}
          onConfirm={() => {
            setBookings((prev) =>
              prev.filter((b) => b !== selectedBooking)
            );
            setShowCancelPopup(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}
