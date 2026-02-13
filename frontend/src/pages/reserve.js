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
      if (!incoming.id) {
        const formatToHourNumber = (t) => {
          if (typeof t === 'number') return t;
          return parseInt(String(t).split(':')[0], 10);
        };
        const newBooking = {
          ...incoming,
          id: Date.now() + Math.random(),
          startTime: formatToHourNumber(incoming.startTime), 
          endTime: formatToHourNumber(incoming.endTime),
          date: incoming.date instanceof Date ? incoming.date.toISOString() : incoming.date
        };
        setDraftBookings(prev => {
          const isDuplicate = prev.some(b => 
            b.date === newBooking.date && b.startTime === newBooking.startTime && b.seatItemId === newBooking.seatItemId
          );
          return isDuplicate ? prev : [...prev, newBooking];
        });
      }
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

  const [draftBookings, setDraftBookings] = useState(() => {
  const saved = localStorage.getItem("draftBookings");
  return saved ? JSON.parse(saved) : [];
});



  useEffect(() => {
  localStorage.setItem("draftBookings", JSON.stringify(draftBookings));
}, [draftBookings]);


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

  const handleSubmitAll = async () => {
  try {
    const res = await fetch("/api/schedules/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ bookings: draftBookings })
    });

    if (!res.ok) throw new Error("ส่งข้อมูลไม่สำเร็จ");

    // ย้าย draft ไป bookings จริง
    setBookings(prev => [...prev, ...draftBookings]);

    // ล้าง draft
    setDraftBookings([]);
    localStorage.removeItem("draftBookings");

    alert("จองสำเร็จทั้งหมดแล้ว");
  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
  }
};
const handleDeleteDraft = (id) => {
  setDraftBookings(prev => prev.filter(b => b.id !== id));
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
                const allCalendarBookings = [...bookings, ...draftBookings];
                const disabled = isSlotDisabled(day, hour);
                const isAlreadyBooked = allCalendarBookings.some(b => {
                  const bDate = new Date(b.date).toDateString();
                  return bDate === day.toDateString() && hour >= parseInt(b.startTime) && hour < parseInt(b.endTime);
                });
                const startingBookings = allCalendarBookings.filter(b =>
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
                    {startingBookings.map((b) => {
                      const isDraft = draftBookings.some(d => d.id === b.id);

                      return (
                        <BookingBlock
                          key={b.id}
                          booking={b}
                          isDraft={isDraft}
                          past={new Date(b.date).setHours(parseInt(b.endTime)) < new Date()}
                          onShowDetails={(booking) => {
                            if (isDraft) {
                              if (window.confirm("ลบ Draft นี้หรือไม่?")) {
                                handleDeleteDraft(booking.id);
                              }
                            } else {
                              setSelectedBooking(booking);
                              setShowViewPopup(true);
                            }
                          }}
                        />
                      );
                    })}

                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {draftBookings.length > 0 && (
  <div style={{ marginTop: 20, textAlign: "center" }}>
    <button
      className="confirm-btn"
      onClick={handleSubmitAll}
    >
      Confirm All Reservations ({draftBookings.length})
    </button>
  </div>
)}
      

      <div className="cancel-policy-notice">
        * การยกเลิกการจองสามารถทำได้สูงสุด 3 ครั้งต่อเดือนเท่านั้น
      </div>

      

      {draft && (
  <ReservePopup
    data={draft}
    allBookings={bookings}
    onClose={() => setDraft(null)}
    onAccept={(final) => {
      const newDraft = {
        ...final,
        date: final.date.toISOString(),
        id: Date.now() + Math.random()
      };

      setDraftBookings(prev => {
        const isDuplicate = prev.some(b =>
          b.date === newDraft.date &&
          b.startTime === newDraft.startTime &&
          b.seatItemId === newDraft.seatItemId
        );

        return isDuplicate ? prev : [...prev, newDraft];
      });

      setDraft(null);
    }}
    onSelectSeat={(curr) =>
      navigate("/seatmap", {
        state: {
          ...curr,
          date: curr.date.toISOString(),
          returnTo: "/reserve"
        }
      })
    }
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