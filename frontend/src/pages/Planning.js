import React, { useState, useEffect } from 'react';
import { scheduleAPI } from '../services/api';
import WeeklyCalendar from '../components/WeeklyCalendar';
import EventPopup from '../components/EventPopup';
import '../styles/Planning.css';

const Planning = () => {

  const [schedules, setSchedules] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  useEffect(() => {
    loadSchedules();
  }, [currentDate]);

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
  console.log('Cell clicked:', dateTime);
  console.log('Date object:', dateTime.date);
  console.log('Date ISO:', dateTime.date.toISOString());
  
  setSelectedDateTime(dateTime);
  setSelectedEvent(null);
  setPopupType(1);
  setShowPopup(true);
};

  const handleSaveEvent = async (eventData) => {
  try {
    // TODO: Replace with actual user from authentication
    const user = { id:'65842827e4b00a1234567890', fullName: 'Mock User' };

    // คำนวณเวลา
    const duration = parseInt(eventData.timeSpent) || 1;

    // ตรวจสอบไม่เกิน 3 ชั่วโมง
    if (duration > 3) {
      alert('สามารถจองได้สูงสุด 3 ชั่วโมงเท่านั้น');
      return;
    }

    const startHour = selectedDateTime
      ? parseInt(selectedDateTime.startTime.split(':')[0])
      : (selectedEvent ? parseInt(selectedEvent.timeSlot.startTime.split(':')[0]) : 9);
    const endHour = startHour + duration;
    
    // ใช้วันที่จาก selectedDateTime (ถ้าสร้างใหม่) หรือ selectedEvent (ถ้าแก้ไข)
    let eventDate;
    if (selectedDateTime) {
      // กำลังสร้าง Event ใหม่
      eventDate = new Date(selectedDateTime.date);
    } else if (selectedEvent) {
      // กำลังแก้ไข Event เดิม - ใช้วันที่เดิม
      eventDate = new Date(selectedEvent.date);
    } else {
      // fallback
      eventDate = new Date();
    }
    
    const localISOString = new Date(
  eventDate.getFullYear(),
  eventDate.getMonth(),
  eventDate.getDate(),
  12, 0, 0, 0  // เที่ยงวันของวันนั้น (หลีกเลี่ยง timezone issue)
).toISOString();
    
    const scheduleData = {
      title: eventData.title || selectedEvent?.title || 'Event',
      notes: eventData.notes || '',
      date: localISOString,
      dayOfWeek: eventDate.getDay(),
      timeSlot: {
        startTime: `${startHour.toString().padStart(2, '0')}:00`,
        endTime: `${endHour.toString().padStart(2, '0')}:00`
      },
      duration: duration,
      instructor: user?.id,
      instructorName: user?.fullName || 'Unknown',
      room: selectedEvent?.room || `Room ${Math.floor(Math.random() * 400) + 100}`,
      color: selectedEvent?.color || getRandomColor(),
      type: 'lecture',
      status: 'scheduled'
    };

    console.log('Saving schedule:', scheduleData);
    console.log('Is editing:', !!selectedEvent);
    console.log('Date:', eventDate.toLocaleDateString());

    if (selectedEvent) {
      await scheduleAPI.update(selectedEvent._id, scheduleData);
      console.log('Schedule updated');
    } else {
      const response = await scheduleAPI.create(scheduleData);
      console.log('Schedule created:', response.data);
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

  const getRandomColor = () => {
    const colors = [
      '#22c55e', // Green
      '#3b82f6', // Blue
      '#f59e0b', // Orange
      '#ec4899', // Pink
      '#8b5cf6', // Purple
      '#06b6d4', // Cyan
      '#ef4444'  // Red
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const formatDateRange = () => {
    const startOfWeek = new Date(currentDate);
    const currentDay = startOfWeek.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Monday start
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    
    return `${months[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
  };

  return (
    <div className="planning-page">
      <div className="planning-header">
        <h1>Planning</h1>
        <div className="header-info">
          <span>Constructor</span>
          <span>Time {new Date().getHours().toString().padStart(2, '0')}:00</span>
          <span>Day {new Date().getDate()}.{(new Date().getMonth() + 1).toString().padStart(2, '0')}.{new Date().getFullYear().toString().slice(-2)}</span>
        </div>
      </div>

      <div className="calendar-controls">
        <button onClick={() => navigateWeek(-1)}>← Previous Week</button>
        <div className="date-range">
          {formatDateRange()}
        </div>
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
    </div>
  );

};

export default Planning;