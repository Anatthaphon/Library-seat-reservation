import React from 'react';
import '../styles/WeeklyCalendar.css';

const WeeklyCalendar = ({ schedules, onEventClick, onCellClick, currentDate }) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = Array.from({ length: 10 }, (_, i) => 9 + i);

  const getMondayOfWeek = () => {
    const date = new Date(currentDate);
    date.setHours(0, 0, 0, 0);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    return monday;
  };

  const getDateForDay = (dayIndex) => {
    const monday = getMondayOfWeek();
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + dayIndex);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate;
  };

  const getSchedulesForDay = (dayIndex) => {
    const targetDate = getDateForDay(dayIndex);

    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);

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

      return schedLocal.getTime() === targetLocal.getTime();
    });
  };

  const getEventPosition = (startTime) => {
    const [hours] = startTime.split(':').map(Number);
    return (hours - 9) * 60;
  };

  const getEventHeight = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const durationMinutes =
      (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);

    return durationMinutes; // 1 นาที = 1px
  };

  // ✅ ล็อกวันอาทิตย์ + วันในอดีต (เพิ่มแพลนไม่ได้)
  const isDateBookable = (date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate.getDay() === 0) return false; // Sunday
    if (targetDate < today) return false;        // Past

    return true;
  };

  // ✅ เช็กว่า event “อยู่ในอดีต” ไหม (จบเวลาแล้ว)
  const isPastSchedule = (schedule) => {
    const d = new Date(schedule.date);

    const endTime = schedule?.timeSlot?.endTime || '00:00';
    const [hh, mm] = endTime.split(':').map(Number);

    const eventEnd = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      hh,
      mm,
      0,
      0
    );

    return eventEnd < new Date();
  };

  const handleCellClick = (dayIndex, hour) => {
    const selectedDate = getDateForDay(dayIndex);

    if (!isDateBookable(selectedDate)) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const d = new Date(selectedDate);
      d.setHours(0, 0, 0, 0);

      if (d.getDay() === 0) {
        alert('ไม่สามารถจองวันอาทิตย์ได้');
      } else if (d < today) {
        alert('ไม่สามารถเพิ่มแพลนในวันที่ผ่านมาแล้วได้');
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
                const start = schedule.timeSlot?.startTime || '09:00';
                const end = schedule.timeSlot?.endTime || '10:00';
                const timeRange = `${start} - ${end}`;

                const titleText = schedule.notes?.trim() || schedule.title?.trim() || 'Event';

                const heightPx = getEventHeight(start, end);
                const isOneHour = heightPx <= 60;
                const titleClampClass = isOneHour ? 'clamp-1' : 'clamp-2';

                const past = isPastSchedule(schedule);

                return (
                  <div
                    key={schedule._id}
                    className={`schedule-event ${past ? 'past-event' : ''}`}
                    style={{
                      // ถ้าเป็นอดีต ให้ border เป็นเทาไปเลย (เพื่อให้ดู disabled)
                      borderColor: past ? '#9ca3af' : schedule.color,
                      top: `${getEventPosition(start)}px`,
                      height: `${heightPx}px`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(schedule);
                    }}
                  >
                    <div className="event-time">
                      <span
                        className={`event-time-badge ${past ? 'past-badge' : ''}`}
                        style={{
                          backgroundColor: past ? '#9ca3af' : schedule.color
                        }}
                      >
                        {timeRange}
                      </span>
                    </div>

                    <div className={`event-title ${titleClampClass}`} title={titleText}>
                      {titleText}
                    </div>
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
