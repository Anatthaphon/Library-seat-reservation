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

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem("bookings");
    return saved ? JSON.parse(saved) : [];
  });

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

    useEffect(() => {
      if (location.state?.booking) {
        const incoming = location.state.booking;

        if (incoming.seatId && !incoming.confirmedFromPopup) {
          setDraft({
            ...incoming,
            date: new Date(incoming.date), // แปลง format วันที่
            startTime: parseInt(incoming.startTime),
            endTime: parseInt(incoming.endTime)
          });
        } 
        // กรณีที่กดยืนยันจากใน Popup มาแล้ว (มี flag confirmedFromPopup) ค่อยสั่งบันทึกจริง
        else if (incoming.confirmedFromPopup && !incoming.id) {
          const newBooking = {
            ...incoming,
            id: Date.now() + Math.random(),
          };
          setBookings(prev => [...prev, newBooking]);
        }

        // ล้าง state เพื่อไม่ให้เปิดซ้ำเมื่อ Refresh
        window.history.replaceState({}, document.title);
      }
    }, [location.state]);

  const cancelCountThisMonth = useMemo(() => {
    const now = new Date();
    return cancelHistory.filter(item => {
      const d = new Date(item.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [cancelHistory]);

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

  // ✅ แก้ไข: แสดงแถวแค่ 9:00 - 17:00 (แถวสุดท้ายคือ 17:00-18:00)
  const hours = Array.from({ length: 9 }, (_, i) => 9 + i); 

  // ✅ แก้ไข: ปิดการจองถ้าเวลาผ่านไปแล้ว หรือเกิน 10 นาทีแรก
  const isSlotDisabled = (day, hour) => {
    if (day.getDay() === 0 || day < today || day > maxDate) return true;
    const now = new Date();
    const isToday = day.toDateString() === now.toDateString();
    if (isToday) {
      if (hour < now.getHours()) return true;
      if (hour === now.getHours() && now.getMinutes() > 10) return true;
    }
    return false;
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
            {cancelCountThisMonth}/{MAX_CANCEL_PER_MONTH} in {currentTime.toLocaleDateString("en-GB", { month: "long" })}
          </span>
          <span>Time {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="calendar-scroll">
              <div className="week-nav">
        {/* ปุ่มย้อนกลับ */}
        <button onClick={() => setWeekOffset((w) => w - 1)}>
          ← Previous Week
        </button>

        <span>
          {days[0].toLocaleDateString("en-GB", { day: "numeric", month: "long" })} – {days[6].toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
        </span>

        {/* ปุ่มถัดไป */}
        <button onClick={() => setWeekOffset((w) => w + 1)}>
          Next Week →
        </button>
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
                const disabled = isSlotDisabled(day, hour);
                const isAlreadyBooked = bookings.some(b => {
                  const bDate = new Date(b.date).toDateString();
                  return bDate === day.toDateString() && hour >= parseInt(b.startTime) && hour < parseInt(b.endTime);
                });
                const startingBookings = bookings.filter(b => 
                  new Date(b.date).toDateString() === day.toDateString() && parseInt(b.startTime) === hour
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
                        past={new Date(b.date).setHours(parseInt(b.endTime)) < new Date()}
                        onShowDetails={(booking) => { setSelectedBooking(booking); setShowViewPopup(true); }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="cancel-policy-notice">
        * การยกเลิกการจองสามารถทำได้สูงสุด 3 ครั้งต่อเดือนเท่านั้น
      </div>

      {draft && (
        <ReservePopup
          data={draft}
          allBookings={bookings}
          onClose={() => setDraft(null)}
          onAccept={(final) => {
            setBookings(prev => [...prev, { ...final, date: final.date.toISOString(), id: Date.now() + Math.random() }]);
            setDraft(null);
          }}
          onSelectSeat={(curr) => navigate("/seatmap", { state: { ...curr, date: curr.date.toISOString(), returnTo: "/reserve" } })}
        />
      )}

      {showViewPopup && (
        <ViewBookingPopup
          booking={selectedBooking}
          onClose={() => { setShowViewPopup(false); setSelectedBooking(null); }}
          onDelete={() => {
            if (cancelCountThisMonth >= MAX_CANCEL_PER_MONTH) {
              alert(`คุณยกเลิกครบ ${MAX_CANCEL_PER_MONTH} ครั้งแล้ว`);
              return;
            }
            setShowViewPopup(false);
            setShowCancelPopup(true);
          }}
        />
      )}

      {showCancelPopup && (
        <CancelPopup onCancel={() => setShowCancelPopup(false)} onConfirm={handleConfirmDelete} />
      )}
    </div>
  );
}