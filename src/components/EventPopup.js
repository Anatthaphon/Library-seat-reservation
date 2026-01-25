import React, { useState, useEffect } from 'react';
import '../styles/EventPopup.css';

const EventPopup = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  eventData = null,
  type = 1
}) => {
  const [formData, setFormData] = useState({ title: '', notes: '', timeSpent: '1' });
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const isReadOnly = type === 2; // ✅ type 2 = ดูอย่างเดียว (ใช้กับแพลนในอดีต)

  // รีเซ็ตข้อมูลทุกครั้งที่เปิด Popup
  useEffect(() => {
    if (isOpen) {
      setShowTimeDropdown(false);

      if (eventData) {
        setFormData({
          title: eventData.title || '',
          notes: eventData.notes || '',
          timeSpent: eventData.duration?.toString() || '1',
        });
      } else {
        setFormData({
          title: '',
          notes: '',
          timeSpent: type === 3 ? '3' : '1'
        });
      }
    }
  }, [eventData, isOpen, type]);

  if (!isOpen) return null;

  // เช็กว่าเป็น event เดิมไหม (ถึงลบได้)
  const canDelete = Boolean(eventData && (eventData._id || eventData.id));

  // ✅ Time Range แสดงในโหมดดูอย่างเดียว
  const start = eventData?.timeSlot?.startTime || '';
  const end = eventData?.timeSlot?.endTime || '';
  const timeRange = start && end ? `${start} - ${end}` : '';

  // กดลบ + Confirm ภาษาไทย
  const handleDeleteClick = () => {
    if (!canDelete) return;

    const ok = window.confirm(
      'คุณแน่ใจหรือไม่ว่าต้องการลบแพลนนี้?\nเมื่อลบแล้วจะไม่สามารถกู้คืนได้'
    );

    if (!ok) return;

    if (typeof onDelete === 'function') {
      onDelete(eventData);
    }
  };

  // Icons
  const ClockIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="field-icon-svg"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );

  const EditIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="field-icon-svg"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );

  return (
    <div className="event-popup-overlay" onClick={onClose}>
      <div className="event-popup" onClick={(e) => e.stopPropagation()}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isReadOnly) onSave(formData); // ✅ กันเผลอ submit ในโหมดดูอย่างเดียว
          }}
        >
          <div className="form-body">
            {/* ✅ TYPE 2 = READ ONLY (สำหรับแพลนในอดีต) */}
            {isReadOnly ? (
              <>
                <div className="form-row first-row">
                  Plan Details
                </div>

                {/* เวลา */}
                {timeRange && (
                  <div className="form-row">
                    <ClockIcon />
                    <div className="label-text" style={{ marginLeft: 8 }}>
                      {timeRange}
                    </div>
                  </div>
                )}

                {/* notes */}
                <div className="form-row">
                  <EditIcon />
                  <input
                    className="input-field"
                    type="text"
                    value={formData.notes}
                    disabled
                    readOnly
                    style={{ opacity: 0.8, cursor: 'not-allowed' }}
                  />
                </div>

                {/* duration */}
                <div className="form-row space-between">
                  <div className="row-left">
                    <ClockIcon />
                    <span className="label-text">Time Spent</span>
                  </div>
                  <span className="time-value-display">{formData.timeSpent} hr.</span>
                </div>
              </>
            ) : (
              <>
                {/* Type 1 & 3 */}
                {(type === 1 || type === 3) && (
                  <>
                    <div className="form-row first-row">Plan Title</div>

                    <div className="form-row">
                      <EditIcon />
                      <input
                        className="input-field"
                        type="text"
                        placeholder="Add Notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

                      {/* Dropdown */}
                      {showTimeDropdown && type === 1 && (
                        <div className="time-dropdown-list">
                          {['1', '2', '3'].map((time) => (
                            <div
                              key={time}
                              className="form-row clickable dropdown-item"
                              onClick={() => {
                                setFormData({ ...formData, timeSpent: time });
                                setShowTimeDropdown(false);
                              }}
                            >
                              <ClockIcon />
                              <span className="time-option-text">{time} hr.</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Type 2 เดิม (time selection) — เราไม่ใช้แล้ว เพราะ type 2 คือ read-only */}
              </>
            )}
          </div>

          {/* ✅ Footer: ถ้า Read-only ให้มีแค่ Close */}
          {isReadOnly ? (
            <div className="form-actions-container">
              <button
                type="button"
                onClick={onClose}
                className="btn-action btn-cancel"
                style={{ width: '100%' }}
              >
                close
              </button>
            </div>
          ) : (
            <div className="form-actions-container">
              {/* มีปุ่มลบเฉพาะตอนแก้ */}
              {canDelete ? (
                <>
                  <button
                    type="button"
                    className="btn-action btn-delete"
                    onClick={handleDeleteClick}
                  >
                    delete
                  </button>

                  <div className="v-divider"></div>

                  <button type="button" onClick={onClose} className="btn-action btn-cancel">
                    cancel
                  </button>

                  <div className="v-divider"></div>

                  <button type="submit" className="btn-action btn-accept">
                    accept
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={onClose} className="btn-action btn-cancel">
                    cancel
                  </button>

                  <div className="v-divider"></div>

                  <button type="submit" className="btn-action btn-accept">
                    accept
                  </button>
                </>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EventPopup;
