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
  
  const MAX_CANCEL_PER_MONTH = 3; // ตามข้อความ notice

  // ----------------- STATES -----------------
  const [bookings, setBookings] = useState([]);
  const [draftBookings, setDraftBookings] = useState(() => {
    const saved = localStorage.getItem("draftBookings");
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

  // ----------------- EFFECTS -----------------
  // Update time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("draftBookings", JSON.stringify(draftBookings));
  }, [draftBookings]);
  useEffect(() => {
    localStorage.setItem("cancelHistory", JSON.stringify(cancelHistory));
  }, [cancelHistory]);

  // ----------------- LOAD BOOKINGS -----------------
  const loadBookings = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      const res = await fetch(
        `http://localhost:3001/api/schedules/reservations?userId=${user._id || user.id}`
      );
      const data = await res.json();

      setBookings(
        (Array.isArray(data) ? data : data.data || []).map(b => ({
          ...b,
          startTime: parseInt(b.timeSlot?.startTime),
          endTime: parseInt(b.timeSlot?.endTime)
        }))
      );
    } catch (err) {
      console.error("loadBookings error:", err);
      // fallback localStorage
      const saved = localStorage.getItem("bookings");
      setBookings(saved ? JSON.parse(saved) : []);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // ----------------- DRAFT FROM LOCATION -----------------
  useEffect(() => {
    if (!location.state) return;

    const formatToHourNumber = (t) => (typeof t === "number" ? t : parseInt(String(t).split(":")[0], 10));

    const incomingDrafts = [];
    if (location.state.seatItemId) {
      incomingDrafts.push({
        ...location.state,
        id: Date.now() + Math.random(),
        seatId: location.state.seatItemId || location.state.seatId,
        startTime: formatToHourNumber(location.state.startTime),
        endTime: formatToHourNumber(location.state.endTime),
        date: location.state.date instanceof Date ? location.state.date.toISOString() : location.state.date,
        seatItemId: location.state.seatItemId
      });
    }
    if (location.state.drafts) {
      location.state.drafts.forEach(d => {
        incomingDrafts.push({
          ...d,
          id: Date.now() + Math.random(),
          date: typeof d.date === "string" ? d.date : new Date(d.date).toISOString(),
          startTime: parseInt(d.startTime),
          endTime: parseInt(d.endTime)
        });
      });
    }

    if (incomingDrafts.length > 0) {
      setDraftBookings(prev => {
        const merged = [...prev, ...incomingDrafts];
        // ป้องกันซ้ำ
        return merged.filter(
          (v,i,a) => a.findIndex(x => x.date === v.date && x.startTime === v.startTime) === i
        );
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ----------------- TIME CALC -----------------
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const maxDate = useMemo(() => { const d = new Date(today); d.setDate(today.getDate()+2); return d; }, [today]);
  const hours = Array.from({ length: 9 }, (_, i) => 9 + i); // 9-17
  const days = useMemo(() => {
    const baseDate = new Date(today);
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    baseDate.setDate(today.getDate() - diffToMonday);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + (weekOffset*7) + i);
      return d;
    });
  }, [today, weekOffset]);

  const cancelCountThisMonth = useMemo(() => {
    const now = new Date();
    return cancelHistory.filter(item => {
      const d = new Date(item.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [cancelHistory]);

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

  // ----------------- HANDLERS -----------------
  const handleConfirmDelete = () => {
    setBookings(prev => prev.filter(b => b._id !== (selectedBooking._id || selectedBooking.id)));
    setCancelHistory(prev => [...prev, { date: new Date().toISOString() }]);
    setShowCancelPopup(false);
    setSelectedBooking(null);
  };

  const handleSubmitAll = async () => {
    if (draftBookings.some(b => !(b.seatItemId || b.seatId))) {
      alert("กรุณาเลือกโต๊ะให้ครบทุก Draft ก่อน");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) { alert("กรุณาเข้าสู่ระบบก่อน"); return; }

    try {
      const res = await fetch("http://localhost:3001/api/schedules/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookings: draftBookings.map(b => ({
            userId: user._id || user.id,
            date: b.date,
            seatItemId: b.seatItemId || b.seatId,
            startTime: `${b.startTime}:00`,
            endTime: `${b.endTime}:00`
          }))
        })
      });
      if (!res.ok) throw new Error("ส่งข้อมูลไม่สำเร็จ");

      await loadBookings();
      setDraftBookings([]);
      localStorage.removeItem("draftBookings");
      alert("จองสำเร็จทั้งหมดแล้ว");
    } catch(err) { console.error(err); alert("เกิดข้อผิดพลาดในการส่งข้อมูล"); }
  };

  const handleDeleteDraft = (id) => setDraftBookings(prev => prev.filter(b => b.id !== id));

  // ----------------- RENDER -----------------
  return (
    <div className="reserve-page">
      {/* Header */}
      <div className="reserve-header">
        <h1>Reserve</h1>
        <div className="header-info">
          <span style={{ color: cancelCountThisMonth >= MAX_CANCEL_PER_MONTH ? '#ff4d4f' : 'inherit', fontWeight:'bold' }}>
            {cancelCountThisMonth}/{MAX_CANCEL_PER_MONTH} in {currentTime.toLocaleDateString("en-GB",{month:"long"})}
          </span>
          <span>Time {currentTime.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-scroll">
        <div className="week-nav">
          <button onClick={() => setWeekOffset(w => w-1)}>‹</button>
          <span>{days[0].toLocaleDateString("en-GB",{day:"numeric",month:"long"})} – {days[6].toLocaleDateString("en-GB",{day:"numeric",month:"long"})}</span>
          <button onClick={() => setWeekOffset(w => w+1)}>›</button>
        </div>

        <div className="calendar-header">
          <div className="time-col" />
          {days.map(d => <div key={d.toDateString()} className="day-title">
            <div className="day-name">{d.toLocaleDateString("en-GB",{weekday:"long"})}</div>
            <div className="day-number">{d.getDate()}</div>
          </div>)}
        </div>

        <div className="calendar-grid">
          {hours.map(hour => (
            <div className="hour-row" key={hour}>
              <div className="time-col">{hour}:00</div>
              {days.map(day => {
                const allBookings = [...bookings, ...draftBookings];
                const disabled = isSlotDisabled(day,hour);
                const isAlreadyBooked = allBookings.some(b => {
                  const bDate = new Date(b.date).toDateString();
                  return bDate === day.toDateString() && hour >= parseInt(b.startTime) && hour < parseInt(b.endTime);
                });
                const startingBookings = allBookings.filter(b => new Date(b.date).toDateString()===day.toDateString() && parseInt(b.startTime)===hour);
                return (
                  <div key={day.toDateString()+hour} className={`cell ${disabled?"disabled":""} ${isAlreadyBooked?"booked":""}`}
                    onClick={() => { if(disabled || isAlreadyBooked) return; setDraft({ date: day, startTime: hour, endTime: hour+1, seatId:null, subject:"" }); }}>
                    {startingBookings.map(b => {
                      const isDraft = draftBookings.some(d => d.id === (b.id || b._id));
                      return (
                        <BookingBlock key={b.id || b._id} booking={b} isDraft={isDraft} past={new Date(b.date).setHours(parseInt(b.endTime)) < new Date()}
                          onShowDetails={booking => {
                            if(isDraft) setDraft({...booking, date:new Date(booking.date)});
                            else { setSelectedBooking(booking); setShowViewPopup(true); }
                          }}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Confirm All Drafts */}
      {draftBookings.length>0 && (
        <div style={{marginTop:20,textAlign:"center"}}>
          <button className="confirm-btn" onClick={handleSubmitAll}>
            Confirm All Reservations ({draftBookings.length})
          </button>
        </div>
      )}

      {/* Cancel Notice */}
      <div className="cancel-policy-notice">
        * การยกเลิกการจองสามารถทำได้สูงสุด {MAX_CANCEL_PER_MONTH} ครั้งต่อเดือนเท่านั้น
      </div>

      {/* Check-in Notice */}
      <div className="checkin-notice">
        <button onClick={() => alert("เริ่ม Check-in ได้เลย!")}>Check-in</button>
        <div>
          เมื่อถึงเวลาที่ท่านจองเข้าใช้งาน กรุณา Check-in โดยการสแกน QR code ที่อยู่หน้าห้องก่อนเข้าใช้งาน<br/>
          ท่านสามารถ Check-in ได้เมื่อถึงเวลาที่ท่านจองภายใน 10 นาทีแรกเท่านั้น<br/>
          มิเช่นนั้นการจองของท่านจะถือเป็นโมฆะ และจะระงับสิทธิ์การจองของท่านเป็นเวลา 3 วัน<br/>
          (เช่น จองเวลา 09:00 น. สามารถ Check-in ได้ในเวลา 09:00 - 09:10 เท่านั้น)
        </div>
      </div>

      {/* Popups */}
      {draft && <ReservePopup
        data={draft} allBookings={bookings}
        onClose={()=>setDraft(null)}
        onDelete={()=>{ handleDeleteDraft(draft.id); setDraft(null); }}
        onAccept={(final)=>{
          const newDraft = { ...final, seatId: final.seatId, date: final.date.toISOString(), id: Date.now()+Math.random() };
          setDraftBookings(prev=>{
            const index = prev.findIndex(b => b.date===newDraft.date && b.startTime===newDraft.startTime);
            if(index!==-1){ const updated=[...prev]; updated[index]={...updated[index], ...newDraft}; return updated; }
            return [...prev,newDraft];
          });
          setDraft(null);
        }}
        onSelectSeat={(curr)=>navigate("/seatmap",{state:{...curr,id:draft?.id,date:curr.date.toISOString(),returnTo:"/reserve"}})}
      />}
      {showViewPopup && <ViewBookingPopup
        booking={selectedBooking}
        onClose={()=>{ setShowViewPopup(false); setSelectedBooking(null); }}
        onDelete={()=>{
          if(cancelCountThisMonth>=MAX_CANCEL_PER_MONTH){ alert(`คุณยกเลิกครบ ${MAX_CANCEL_PER_MONTH} ครั้งแล้ว`); return; }
          setShowViewPopup(false); setShowCancelPopup(true);
        }}
      />}
      {showCancelPopup && <CancelPopup onCancel={()=>setShowCancelPopup(false)} onConfirm={handleConfirmDelete} />}
    </div>
  );
}