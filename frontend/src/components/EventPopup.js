import React, { useState, useEffect } from 'react'; 
import '../styles/EventPopup.css'; 

const EventPopup = ({ isOpen, onClose, onSave, eventData = null, type = 1 }) => {
  const [formData, setFormData] = useState({ title: '', notes: '', timeSpent: '1' });
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  // รีเซ็ตข้อมูลและปิด Dropdown ทุกครั้งที่เปิด Popup หรือเปลี่ยนประเภท Event
  useEffect(() => {
    if (isOpen) {
      setShowTimeDropdown(false); // ปิดลิสต์เวลาไว้เสมอเมื่อเข้ามาครั้งแรก
      
      if (eventData) {
        setFormData({
          title: eventData.title || '',
          notes: eventData.notes || '',
          timeSpent: eventData.duration?.toString() || '1',
        });
      } else {
        setFormData({ title: '', notes: '', timeSpent: type === 3 ? '3' : '1' });
      }
    }
  }, [eventData, isOpen, type]);

  if (!isOpen) return null;

  // Icons SVG ตามสไตล์ UI
  const ClockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="field-icon-svg">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );

  const EditIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="field-icon-svg">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
    </svg>
  );

  return (
    <div className="event-popup-overlay" onClick={onClose}>
      {/* Header Label ด้านบนการ์ด */}
      
      <div className="event-popup" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          
          <div className="form-body">
            {/* Event 8 & 9 (Type 1 & 3) */}
            {(type === 1 || type === 3) && (
              <>
                <div className="form-row first-row">
                 Plan Title
                </div>

                <div className="form-row">
                  <EditIcon />
                  <input
                    className="input-field"
                    type="text"
                    placeholder="Add Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>

                <div className="time-section-container">
                  <div 
                    className={`form-row space-between ${type === 1 ? 'clickable' : ''}`} 
                    onClick={() => type === 1 && setShowTimeDropdown(!showTimeDropdown)}
                  >
                    <div className="row-left">
                      <ClockIcon />
                      <span className="label-text">Time Spent</span>
                    </div>
                    {type === 3 ? (
                      <span className="time-value-fixed">3 hr.</span>
                    ) : (
                      <span className="time-value-display">{formData.timeSpent} hr.</span>
                    )}
                  </div>

                  {/* Dropdown List สำหรับ Event 8 */}
                  {showTimeDropdown && type === 1 && (
                    <div className="time-dropdown-list">
                      {['1', '2', '3'].map(time => (
                        <div key={time} className="form-row clickable dropdown-item" onClick={() => {
                          setFormData({...formData, timeSpent: time});
                          setShowTimeDropdown(false);
                        }}>
                          <ClockIcon />
                          <span className="time-option-text">{time} hr.</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Event 7 (Type 2) */}
            {type === 2 && (
              <div className="time-selection-list">
                <div className="form-row"><ClockIcon /><span className="label-text">Time Spent</span></div>
                {['1', '2', '3'].map(time => (
                  <div key={time} className="form-row clickable" onClick={() => setFormData({...formData, timeSpent: time})}>
                    <ClockIcon />
                    <span className="time-option-text">{time} hr.</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Buttons (แสดงเฉพาะเมื่อไม่ใช่ Type 2 ตาม UI) */}
          {type !== 2 && (
            <div className="form-actions-container">
              <button type="button" onClick={onClose} className="btn-action btn-cancel">cancel</button>
              <div className="v-divider"></div>
              <button type="submit" className="btn-action btn-accept">accept</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EventPopup;