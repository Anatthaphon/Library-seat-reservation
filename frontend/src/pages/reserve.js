import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReservePopup from "./ReservePopup";
import CancelPopup from "../components/CancelPopup";
import BookingBlock from "../components/BookingBlock";
import "../styles/Reserve.css";

export default function Reserve() {
  const navigate = useNavigate();
  const location = useLocation();

  const [bookings, setBookings] = useState([]);
  const [draft, setDraft] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  // --- 1. ระบบนับเวลา Real-time สำหรับ Header ---
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHeaderDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  };

  // โหลด booking
  useEffect(() => {
    const saved = localStorage.getItem("bookings");
    if (saved) {
      try {
        setBookings(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // save booking
  useEffect(() => {
    localStorage.setItem("bookings", JSON.stringify(bookings));
  }, [bookings]);

  // draft จาก seatmap / localStorage
  useEffect(() => {
    if (location.state?.booking) {
      const returned = location.state.booking;
      const updated = {
        ...returned,
        date: new Date(returned.date),
      };

      setDraft(updated);
      localStorage.setItem(
        "draftBooking",
        JSON.stringify({ ...updated, date: updated.date.toISOString() })
      );

      window.history.replaceState({}, document.title);
      return;
    }

    const savedDraft = localStorage.getItem("draftBooking");
    if (savedDraft) {
      const booking = JSON.parse(savedDraft);
      setDraft({ ...booking, date: new Date(booking.date) });
    }
  }, [location.state]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() + 2);
    return d;
  }, [today]);

  // --- 2. แก้ไขส่วนนี้เพื่อให้สัปดาห์เริ่มที่วันจันทร์เสมอ ---
  const days = useMemo(() => {
    const baseDate = new Date(today);
    const dayOfWeek = today.getDay(); 
    // ถ้าวันนี้วันอาทิตย์ (0) ถอย 6 วัน, วันอื่นถอย (dayOfWeek - 1)
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    baseDate.setDate(today.getDate() - diffToMonday);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + (weekOffset * 7) + i);
      return d;
    });
  }, [today, weekOffset]);

  const hours = Array.from({ length: 10 }, (_, i) => 9 + i);

  const isDisabled = (day) => {
    const compareToday = new Date(today);
    compareToday.setHours(0, 0, 0, 0);
    const isSunday = day.getDay() === 0;
    const isPast = day < compareToday;
    const isTooFar = day > maxDate;
    return isPast || isSunday || isTooFar;
  };

  const isPastBooking = (booking) => {
    const now = new Date();
    const end = new Date(booking.date);
    end.setHours(booking.endTime, 0, 0, 0);
    return end < now;
  };

  return (
    <div className="reserve-page">

      {/* --- 3. แก้ไข Header ตามรูปภาพที่ส่งมา --- */}
      <div className="reserve-header">
        <h1>Reserve</h1>
        <div className="header-info">
          <span>Constructor</span>
          <span>Time {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
          <span>Day {formatHeaderDate(currentTime)}</span>
        </div>
      </div>

      <div className="calendar-scroll">

        {/* WEEK NAV */}
        <div className="week-nav">
          <button onClick={() => setWeekOffset((w) => w - 1)}>‹</button>
          <span>
            {days[0].toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
            {" – "}
            {days[6].toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
          </span>
          <button onClick={() => setWeekOffset((w) => w + 1)}>›</button>
        </div>

        {/* HEADER DAYS */}
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

        {/* GRID */}
        <div className="calendar-grid">
          {hours.map((hour) => (
            <div className="hour-row" key={hour}>
              <div className="time-col">{hour}:00</div>

              {days.map((day) => {
                const disabled = isDisabled(day);
                const bookingsHere = bookings.filter(
                  (b) =>
                    new Date(b.date).toDateString() === day.toDateString() &&
                    hour >= b.startTime &&
                    hour < b.endTime
                );

                return (
                  <div
                    key={day.toDateString() + hour}
                    className={`cell ${disabled ? "disabled" : ""}`}
                    onClick={() => {
                      if (disabled) return;

                      const newDraft = {
                        date: day,
                        startTime: hour,
                        endTime: hour + 1,
                        seatId: null,
                        subject: "",
                      };

                      setDraft(newDraft);
                      localStorage.setItem(
                        "draftBooking",
                        JSON.stringify({
                          ...newDraft,
                          date: day.toISOString(),
                        })
                      );
                    }}
                  >
                    {bookingsHere.map((b) => (
                      <BookingBlock
                        key={b.id}
                        booking={b}
                        past={isPastBooking(b)}
                        onRequestDelete={(booking) => {
                          setSelectedBooking(booking);
                          setShowCancelPopup(true);
                        }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* POPUPS */}
      {draft && (
        <ReservePopup
          key={draft.seatId ? `seat-${draft.seatId}` : "no-seat"}
          data={draft}
          onClose={() => {
            localStorage.removeItem("draftBooking");
            setDraft(null);
          }}
          onAccept={(finalBooking) => {
            setBookings((prev) => [
              ...prev,
              {
                ...finalBooking,
                date: finalBooking.date.toISOString(),
                id: Date.now() + Math.random(),
              },
            ]);
            localStorage.removeItem("draftBooking");
            setDraft(null);
          }}
          onSelectSeat={(currentDraft) => {
            localStorage.setItem(
              "draftBooking",
              JSON.stringify({
                ...currentDraft,
                date: currentDraft.date.toISOString(),
              })
            );
            navigate("/seatmap", {
              state: {
                ...currentDraft,
                date: currentDraft.date.toISOString(),
                returnTo: "/reserve",
              },
            });
          }}
        />
      )}

      {showCancelPopup && (
        <CancelPopup
          onCancel={() => {
            setShowCancelPopup(false);
            setSelectedBooking(null);
          }}
          onConfirm={() => {
            setBookings((prev) =>
              prev.filter((b) => b.id !== selectedBooking.id)
            );
            setShowCancelPopup(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}