import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReservePopup from "./ReservePopup";
import ViewBookingPopup from "../components/ViewBookingPopup"; // ไฟล์ใหม่ที่เราสร้าง
import CancelPopup from "../components/CancelPopup";
import BookingBlock from "../components/BookingBlock";
import "../styles/Reserve.css";

export default function Reserve() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- CONFIG: ปรับค่าจำนวนครั้งสูงสุดที่นื่ ---
  const MAX_CANCEL_PER_MONTH = 100; 

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem("bookings");
    return saved ? JSON.parse(saved) : [];
  });

  // เก็บประวัติการยกเลิกในรูปแบบ [{ date: "ISOString" }]
  const [cancelHistory, setCancelHistory] = useState(() => {
    const saved = localStorage.getItem("cancelHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const [draft, setDraft] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem("cancelHistory", JSON.stringify(cancelHistory));
  }, [cancelHistory]);

  // คำนวณจำนวนครั้งที่ยกเลิกในเดือนปัจจุบัน
  const cancelCountThisMonth = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return cancelHistory.filter(item => {
      const cancelDate = new Date(item.date);
      return cancelDate.getMonth() === currentMonth && cancelDate.getFullYear() === currentYear;
    }).length;
  }, [cancelHistory]);

  const currentMonthName = currentTime.toLocaleDateString("en-GB", { month: "long" });

  const formatHeaderDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  };

  useEffect(() => {
    if (location.state?.booking) {
      const returned = location.state.booking;
      const updated = { ...returned, date: new Date(returned.date) };
      setDraft(updated);
      localStorage.setItem("draftBooking", JSON.stringify({ ...updated, date: updated.date.toISOString() }));
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

  const days = useMemo(() => {
    const baseDate = new Date(today);
    const dayOfWeek = today.getDay(); 
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
    return day.getDay() === 0 || day < compareToday || day > maxDate;
  };

  const handleConfirmDelete = () => {
    setBookings((prev) => prev.filter((b) => b.id !== selectedBooking.id));
    setCancelHistory((prev) => [...prev, { date: new Date().toISOString() }]);
    setShowCancelPopup(false);
    setSelectedBooking(null);
  };

  return (
    <div className="reserve-page">
      <div className="reserve-header">
        <h1>Reserve</h1>
        <div className="header-info">
          {/* แสดง Quota การยกเลิกแทนที่ Constructor */}
          <span style={{ 
            color: cancelCountThisMonth >= MAX_CANCEL_PER_MONTH ? '#ff4d4f' : 'inherit', 
            fontWeight: 'bold' 
          }}>
            {cancelCountThisMonth}/{MAX_CANCEL_PER_MONTH} in {currentMonthName}
          </span>
          <span>Time {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
          <span>Day {formatHeaderDate(currentTime)}</span>
        </div>
      </div>

      <div className="calendar-scroll">
        <div className="week-nav">
          <button onClick={() => setWeekOffset((w) => w - 1)}>‹</button>
          <span>
            {days[0].toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
            {" – "}
            {days[6].toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
          </span>
          <button onClick={() => setWeekOffset((w) => w + 1)}>›</button>
        </div>

        <div className="calendar-header">
          <div className="time-col" />
          {days.map((d) => (
            <div key={d.toDateString()} className="day-title">
              <div className="day-name">{d.toLocaleDateString("en-GB", { weekday: "long" })}</div>
              <div className="day-number">{d.getDate()}</div>
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {hours.map((hour) => (
            <div className="hour-row" key={hour}>
              <div className="time-col">{hour}:00</div>
              {days.map((day) => {
                const disabled = isDisabled(day);
                const startingBookings = bookings.filter(b => 
                  new Date(b.date).toDateString() === day.toDateString() && b.startTime === hour
                );
                const isAlreadyBooked = bookings.some(b => 
                  new Date(b.date).toDateString() === day.toDateString() && hour >= b.startTime && hour < b.endTime
                );

                return (
                  <div
                    key={day.toDateString() + hour}
                    className={`cell ${disabled ? "disabled" : ""} ${isAlreadyBooked ? "booked" : ""}`}
                    onClick={() => {
                      if (disabled || isAlreadyBooked) return; 
                      setDraft({ date: day, startTime: hour, endTime: hour + 1, seatId: null, subject: "" });
                    }}
                  >
                    {startingBookings.map((b) => (
                      <BookingBlock
                        key={b.id}
                        booking={b}
                        past={new Date(b.date).setHours(b.endTime) < new Date()}
                        onShowDetails={(booking) => {
                          setSelectedBooking(booking);
                          setShowViewPopup(true);
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

      {draft && (
        <ReservePopup
          data={draft}
          allBookings={bookings}
          onClose={() => { localStorage.removeItem("draftBooking"); setDraft(null); }}
          onAccept={(final) => {
            setBookings(prev => [...prev, { ...final, date: final.date.toISOString(), id: Date.now() + Math.random() }]);
            localStorage.removeItem("draftBooking");
            setDraft(null);
          }}
          onSelectSeat={(curr) => {
            localStorage.setItem("draftBooking", JSON.stringify({ ...curr, date: curr.date.toISOString() }));
            navigate("/seatmap", { state: { ...curr, date: curr.date.toISOString(), returnTo: "/reserve" } });
          }}
        />
      )}

      {showViewPopup && (
        <ViewBookingPopup
          booking={selectedBooking}
          onClose={() => { setShowViewPopup(false); setSelectedBooking(null); }}
          onDelete={() => {
            if (cancelCountThisMonth >= MAX_CANCEL_PER_MONTH) {
              alert(`You have reached the limit of ${MAX_CANCEL_PER_MONTH} cancellations this month.`);
              return;
            }
            setShowViewPopup(false);
            setShowCancelPopup(true);
          }}
        />
      )}

      {showCancelPopup && (
        <CancelPopup
          onCancel={() => { setShowCancelPopup(false); setSelectedBooking(null); }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}