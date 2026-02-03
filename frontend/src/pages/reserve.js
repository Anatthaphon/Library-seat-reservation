import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReservePopup from "./ReservePopup";
import ViewBookingPopup from "../components/ViewBookingPopup"; 
import CancelPopup from "../components/CancelPopup";
import BookingBlock from "../components/BookingBlock";
import "../styles/Reserve.css";

export default function Reserve() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const MAX_CANCEL_PER_MONTH = 100; 

  // 1. Load Data from LocalStorage
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem("bookings");
    return saved ? JSON.parse(saved) : [];
  });

  const [cancelHistory, setCancelHistory] = useState(() => {
    const saved = localStorage.getItem("cancelHistory");
    return saved ? JSON.parse(saved) : [];
  });

  // 2. States for UI
  const [draft, setDraft] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 3. Sync Clock & LocalStorage
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

  // 4. Logic รับข้อมูลจากหน้าอื่น
  useEffect(() => {
    if (location.state?.booking) {
      const incoming = location.state.booking;
      if (!incoming.id) {
        const formatToHourNumber = (t) => {
          if (typeof t === 'number') return t;
          const hourPart = String(t).split(':')[0];
          return parseInt(hourPart, 10);
        };

        const startTime = formatToHourNumber(incoming.startTime);
        const endTime = formatToHourNumber(incoming.endTime);

        const newBooking = {
          ...incoming,
          id: Date.now() + Math.random(),
          startTime: startTime, 
          endTime: endTime,
          date: incoming.date instanceof Date ? incoming.date.toISOString() : incoming.date
        };
        
        setBookings(prev => {
          const isDuplicate = prev.some(b => 
            b.date === newBooking.date && 
            b.startTime === newBooking.startTime && 
            b.seatId === newBooking.seatId
          );
          return isDuplicate ? prev : [...prev, newBooking];
        });
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 5. Quota Calculation
  const cancelCountThisMonth = useMemo(() => {
    const now = new Date();
    return cancelHistory.filter(item => {
      const d = new Date(item.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [cancelHistory]);

  const currentMonthName = currentTime.toLocaleDateString("en-GB", { month: "long" });

  // 6. Calendar Helpers
  const formatHeaderDate = (date) => {
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getFullYear()).slice(-2)}`;
  };

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
    return day.getDay() === 0 || day < today || day > maxDate;
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
          <span style={{ color: cancelCountThisMonth >= MAX_CANCEL_PER_MONTH ? '#ff4d4f' : 'inherit', fontWeight: 'bold' }}>
            {cancelCountThisMonth}/{MAX_CANCEL_PER_MONTH} in {currentMonthName}
          </span>
          <span>Time {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
          <span>Day {formatHeaderDate(currentTime)}</span>
        </div>
      </div>

      <div className="calendar-scroll">
        <div className="week-nav">
          <button onClick={() => setWeekOffset((w) => w - 1)}>‹</button>
          <span>{days[0].toLocaleDateString("en-GB", { day: "numeric", month: "long" })} – {days[6].toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</span>
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
                  new Date(b.date).toDateString() === day.toDateString() && 
                  parseInt(b.startTime) === hour
                );

                const isAlreadyBooked = bookings.some(b => {
                  const bDate = new Date(b.date).toDateString();
                  const dDate = day.toDateString();
                  const s = parseInt(b.startTime);
                  const e = parseInt(b.endTime);
                  return bDate === dDate && hour >= s && hour < e;
                });

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
                        past={new Date(b.date).setHours(parseInt(b.endTime)) < new Date()}
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

      {/* ✅ เพิ่มข้อความคำเตือนใต้ตาราง (ลอจิกจากรูปที่คุณส่งมา) */}
      <div className="cancel-policy-notice">
        * การยกเลิกการจองสามารถทำได้สูงสุด 3 ครั้งต่อเดือนเท่านั้น
      </div>

      {/* Popups */}
      {draft && (
        <ReservePopup
          data={draft}
          allBookings={bookings}
          onClose={() => setDraft(null)}
          onAccept={(final) => {
            const newB = { ...final, date: final.date.toISOString(), id: Date.now() + Math.random() };
            setBookings(prev => [...prev, newB]);
            setDraft(null);
          }}
          onSelectSeat={(curr) => {
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
              alert(`คุณยกเลิกการจองครบกำหนด ${MAX_CANCEL_PER_MONTH} ครั้งต่อเดือนแล้ว`);
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