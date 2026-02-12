import React from 'react';

const EventSelector = ({ events, currentIndex, onPrev, onNext, colorGetter }) => {
  if (!events || events.length === 0) return null;

  const currentEvent = events[currentIndex];
  const eventDate = new Date(currentEvent.date);
  const bgColor = currentEvent.color || colorGetter(eventDate);

  return (
    <div className="side-panel-box event-selector-box">
      <h3 className="side-title">EVENT</h3>
      <div className="event-nav-container">
        <button className="nav-arrow" onClick={onPrev}>‹</button>
        
        <div className="booking-card" style={{ borderColor: bgColor }}>
          <div className="booking-time" style={{ background: bgColor }}>
            {currentEvent.timeSlot?.startTime} - {currentEvent.timeSlot?.endTime}
          </div>
          <div className="booking-title">
            {currentEvent.title || "Untitled Event"}
          </div>
        </div>

        <button className="nav-arrow" onClick={onNext}>›</button>
      </div>
      <div className="event-indicator">
        {currentIndex + 1} / {events.length}
      </div>
    </div>
  );
};

export default EventSelector;