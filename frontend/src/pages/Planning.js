import React, { useState, useEffect } from 'react';
import { scheduleAPI } from '../services/api';
import WeeklyCalendar from '../components/WeeklyCalendar';
import EventPopup from '../components/EventPopup';
import '../styles/Planning.css';
import { useNavigate } from 'react-router-dom';

const Planning = () => {
  const [schedules, setSchedules] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  // ✅ realtime clock
  const [now, setNow] = useState(new Date());

  const navigate = useNavigate();

  // 1) ถ้าผู้ใช้ "เลือก" ช่อง/อีเวนต์ จะใช้ค่านั้น
  const getSelectedSlot = () => {
    if (selectedDateTime) {
      return {
        date: selectedDateTime.date,
        startTime: selectedDateTime.startTime,
        endTime: selectedDateTime.endTime || null,
        scheduleId: null,
        title: null,
      };
    }

    if (selectedEvent) {
      return {
        date: selectedEvent.date,
        startTime: selectedEvent.timeSlot?.startTime,
        endTime: selectedEvent.timeSlot?.endTime,
        scheduleId: selectedEvent._id,
        title: selectedEvent.title,
      };
    }

    return null;
  };

  // 2) ถ้ายังไม่ได้เลือกอะไร แต่มีแพลนอยู่แล้ว -> ใช้ "แพลนล่าสุด" เป็นค่า default
  const getSlotForReservation = () => {
    const selected = getSelectedSlot();
    if (selected) return selected;

    if (schedules.length > 0) {
      const last = schedules[schedules.length - 1];
      return {
        date: last.date,
        startTime: last.timeSlot?.startTime,
        endTime: last.timeSlot?.endTime,
        scheduleId: last._id,
        title: last.title,
      };
    }

    return null;
  };

  const handleReserve = () => {
    const slot = getSlotForReservation();

    if (!slot) {
      alert('ยังไม่มีแพลน กรุณาเพิ่มแพลนก่อนจองค่ะ');
      return;
    }

    const d = new Date(slot.date);
    if (d.getDay() === 0) {
      alert('วันอาทิตย์ห้องสมุดปิด ไม่สามารถจองได้ค่ะ');
      return;
    }

    navigate('/seat-map', { state: slot });
  };

  useEffect(() => {
    loadSchedules();
  }, [currentDate]);

  // ✅ realtime update every 1 second
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadSchedules = async () => {
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const response = await scheduleAPI.getByWeek(dateStr);
      setSchedules(response.data);
      console.log('Loaded schedules:', response.data);
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setSelectedDateTime(null);
    setPopupType(1);
    setShowPopup(true);
  };

  const handleCellClick = (dateTime) => {
    const clickedDate = new Date(dateTime.date);

    if (clickedDate.getDay() === 0) {
      alert('วันอาทิตย์ห้องสมุดปิด ไม่สามารถแพลนได้ค่ะ');
      return;
    }

    setSelectedDateTime(dateTime);
    setSelectedEvent(null);
    setPopupType(1);
    setShowPopup(true);
  };

  const handleSaveEvent = async (eventData) => {
    try {
      const user = { id: '65842827e4b00a1234567890', fullName: 'Mock User' };

      const duration = parseInt(eventData.timeSpent) || 1;

      if (duration > 3) {
        alert('สามารถจองได้สูงสุด 3 ชั่วโมงเท่านั้น');
        return;
      }

      const startHour = selectedDateTime
        ? parseInt(selectedDateTime.startTime.split(':')[0])
        : (selectedEvent ? parseInt(selectedEvent.timeSlot.startTime.split(':')[0]) : 9);

      const endHour = startHour + duration;

      if (endHour > 18) {
        alert('เวลาจองต้องไม่เกิน 18:00 น.');
        return;
      }

      let eventDate;
      if (selectedDateTime) {
        eventDate = new Date(selectedDateTime.date);
      } else if (selectedEvent) {
        eventDate = new Date(selectedEvent.date);
      } else {
        eventDate = new Date();
      }

      if (eventDate.getDay() === 0) {
        alert('วันอาทิตย์ห้องสมุดปิด ไม่สามารถแพลนได้ค่ะ');
        return;
      }

      const localISOString = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate(),
        12, 0, 0, 0
      ).toISOString();

      const scheduleData = {
        title: eventData.title || selectedEvent?.title || 'Event',
        notes: eventData.notes || '',
        date: localISOString,
        dayOfWeek: eventDate.getDay(),
        timeSlot: {
          startTime: `${startHour.toString().padStart(2, '0')}:00`,
          endTime: `${endHour.toString().padStart(2, '0')}:00`,
        },
        duration,
        instructor: user?.id,
        instructorName: user?.fullName || 'Unknown',
        room: selectedEvent?.room || `Room ${Math.floor(Math.random() * 400) + 100}`,
        color: getColorByDay(eventDate),
        type: 'lecture',
        status: 'scheduled',
      };

      if (selectedEvent) {
        await scheduleAPI.update(selectedEvent._id, scheduleData);
      } else {
        await scheduleAPI.create(scheduleData);
      }

      setShowPopup(false);
      setSelectedDateTime(null);
      setSelectedEvent(null);

      await loadSchedules();

      alert('Event saved successfully!');
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event: ' + (error.response?.data?.error || error.message));
    }
  };

  const getColorByDay = (dateObj) => {
    const d = dateObj.getDay();
    const dayColors = {
      1: '#facc15',
      2: '#ec4899',
      3: '#22c55e',
      4: '#f97316',
      5: '#06b6d4',
      6: '#8b5cf6',
      0: '#9ca3af',
    };
    return dayColors[d] || '#3b82f6';
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const formatDateRange = () => {
    const startOfWeek = new Date(currentDate);
    const currentDay = startOfWeek.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    startOfWeek.setDate(startOfWeek.getDate() + diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return `${months[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
  };

  return (
    <div className="planning-page">
      <div className="planning-header">
        <h1>Planning</h1>
        <div className="header-info">
          <span>Constructor</span>
          <span>
            Time {now.getHours().toString().padStart(2, '0')}:{now.getMinutes().toString().padStart(2, '0')}
          </span>
          <span>
            Day {now.getDate()}.{(now.getMonth() + 1).toString().padStart(2, '0')}.{now.getFullYear().toString().slice(-2)}
          </span>
        </div>
      </div>

      <div className="calendar-controls">
        <button onClick={() => navigateWeek(-1)}>← Previous Week</button>
        <div className="date-range">{formatDateRange()}</div>
        <button onClick={() => navigateWeek(1)}>Next Week →</button>
      </div>

      <WeeklyCalendar
        schedules={schedules}
        onEventClick={handleEventClick}
        onCellClick={handleCellClick}
        currentDate={currentDate}
      />

      <EventPopup
        isOpen={showPopup}
        onClose={() => {
          setShowPopup(false);
          setSelectedDateTime(null);
          setSelectedEvent(null);
        }}
        onSave={handleSaveEvent}
        eventData={selectedEvent}
        type={popupType}
      />

      {/* ✅ Reserve: กดได้เมื่อมีแพลนอย่างน้อย 1 อัน */}
      <button
        className="reserve-btn"
        onClick={handleReserve}
        disabled={schedules.length === 0}
      >
        Reserve
      </button>
    </div>
  );
};

export default Planning;
