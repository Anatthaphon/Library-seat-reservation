import React from 'react';
import '../styles/WeeklyCalendar.css';

const WeeklyCalendar = ({ schedules, onEventClick, onCellClick, currentDate }) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = Array.from({ length: 10 }, (_, i) => 9 + i);

  // หาจันทร์ของสัปดาห์ปัจจุบัน
  const getMondayOfWeek = () => {
    const date = new Date(currentDate);
    date.setHours(0, 0, 0, 0);
    const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const diff = day === 0 ? -6 : 1 - day; // ถ้าเป็นอาทิตย์ ให้กลับไป 6 วัน
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    return monday;
  };

  // หาวันที่จาก dayIndex (0=Mon, 1=Tue, ..., 6=Sun)
  const getDateForDay = (dayIndex) => {
    const monday = getMondayOfWeek();
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + dayIndex);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate;
  };

  const getSchedulesForDay = (dayIndex) => {
  const targetDate = getDateForDay(dayIndex);
  const dayName = daysOfWeek[dayIndex];
  
  const filtered = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.date);
    
    // สร้าง date object ที่ local midnight
    const schedLocal = new Date(
      scheduleDate.getFullYear(),
      scheduleDate.getMonth(),
      scheduleDate.getDate()
    );
    
    const targetLocal = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );
    
    const isSameDate = schedLocal.getTime() === targetLocal.getTime();
    
    // Debug ทุก schedule
    console.log(`Checking "${schedule.title}":`);
    console.log(`  Schedule date from DB: ${schedule.date}`);
    console.log(`  Parsed to: ${scheduleDate.toLocaleString()}`);
    console.log(`  Schedule local midnight: ${schedLocal.toLocaleString()}`);
    console.log(`  Target (${dayName}): ${targetLocal.toLocaleString()}`);
    console.log(`  Match: ${isSameDate}`);
    console.log('---');
    
    return isSameDate;
  });
  
  console.log(`✅ ${dayName} (${targetDate.toLocaleDateString()}): ${filtered.length} events`);
  return filtered;
};

  const getEventPosition = (startTime) => {
    const [hours] = startTime.split(':').map(Number);
    return (hours - 9) * 60;
  };

  const getEventHeight = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    return durationMinutes;
  };

  // ✅ จองได้ทุกวัน ยกเว้นวันอาทิตย์
const isDateBookable = (date) => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  // ❌ วันอาทิตย์จองไม่ได้
  if (targetDate.getDay() === 0) {
    return false;
  }

  // ✅ วันจันทร์–เสาร์ จองได้
  return true;
};


  const handleCellClick = (dayIndex, hour) => {
    const selectedDate = getDateForDay(dayIndex);

    // ตรวจสอบว่าจองได้หรือไม่
    if (!isDateBookable(selectedDate)) {
      if (selectedDate.getDay() === 0) {
        alert('ไม่สามารถจองวันอาทิตย์ได้');
      } else {
        alert('คุณสามารถจองได้เฉพาะ 3 วันข้างหน้าเท่านั้น (ไม่นับวันอาทิตย์)');
      }
      return;
    }

    const clickedDateTime = {
      date: selectedDate,
      dayOfWeek: selectedDate.getDay(),
      hour: hour,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`
    };

    console.log('Clicked:', daysOfWeek[dayIndex], selectedDate.toLocaleDateString());
    onCellClick(clickedDateTime);
  };

  return (
    <div className="weekly-calendar">
      <div className="calendar-header">
        <div className="time-column-header"></div>
        {daysOfWeek.map((day, index) => {
          const date = getDateForDay(index);
          const bookable = isDateBookable(date);
          return (
            <div key={day} className={`day-header ${!bookable ? 'disabled' : ''}`}>
              <div className="day-name">{day}</div>
              <div className="day-date">{date.getDate()}</div>
            </div>
          );
        })}
      </div>

      <div className="calendar-body">
        <div className="time-column">
          {timeSlots.map(hour => (
            <div key={hour} className="time-slot">
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {daysOfWeek.map((day, dayIndex) => {
          const dayDate = getDateForDay(dayIndex);
          const bookable = isDateBookable(dayDate);

          return (
            <div key={day} className={`day-column ${!bookable ? 'disabled' : ''}`}>
              {timeSlots.map(hour => (
                <div
                  key={hour}
                  className={`hour-cell ${bookable ? 'clickable' : 'disabled'}`}
                  onClick={() => bookable && handleCellClick(dayIndex, hour)}
                ></div>
              ))}
            
              {getSchedulesForDay(dayIndex).map(schedule => {
                const duration = schedule.duration || 1;
                const startHour = parseInt(schedule.timeSlot.startTime.split(':')[0]);
                const timeBadges = [];
                for (let i = 0; i < duration; i++) {
                  const hour = startHour + i;
                  timeBadges.push(`${hour.toString().padStart(2, '0')}:00`);
                }

                return (
                  <div
                    key={schedule._id}
                    className="schedule-event"
                    style={{
                      borderColor: schedule.color,
                      top: `${getEventPosition(schedule.timeSlot.startTime)}px`,
                      height: `${getEventHeight(schedule.timeSlot.startTime, schedule.timeSlot.endTime)}px`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(schedule);
                    }}
                  >
                    <div className="event-time">
                      {timeBadges.map((time, idx) => (
                        <span
                          key={idx}
                          className="event-time-badge"
                          style={{ backgroundColor: schedule.color }}
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                    <div className="event-title">{schedule.notes}</div>
                    {/* {schedule.room && (
                      <div className="event-room">{schedule.room}</div>
                    )} */}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendar;