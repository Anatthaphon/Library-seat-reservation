import React from 'react';
import '../styles/EventTypeSelector.css';

const EventTypeSelector = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="event-type-overlay" onClick={onClose}>
      <div className="event-type-popup" onClick={(e) => e.stopPropagation()}>
        <h3>Select Event Type</h3>
        <p className="subtitle">Choose the type of event you want to create</p>
        
        <div className="event-type-options">
          <div className="event-type-card" onClick={() => onSelect(1)}>
            <div className="event-number">1</div>
            <h4>Event 1</h4>
            <p>Full details with title, notes, and custom time</p>
          </div>

          <div className="event-type-card" onClick={() => onSelect(2)}>
            <div className="event-number">2</div>
            <h4>Event 2</h4>
            <p>Quick event with time selection (1-3 hrs)</p>
          </div>

          <div className="event-type-card" onClick={() => onSelect(3)}>
            <div className="event-number">3</div>
            <h4>Event 3</h4>
            <p>Standard 3-hour event with details</p>
          </div>
        </div>

        <button className="btn-cancel-type" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default EventTypeSelector;