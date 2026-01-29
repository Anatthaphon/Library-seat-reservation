import React from "react";
import ReactDOM from "react-dom";
import "../styles/CancelPopup.css";

export default function CancelPopup({ onCancel, onConfirm }) {
  return ReactDOM.createPortal(
    <div className="cancel-overlay">
      <div className="cancel-modal">
        <div className="cancel-header">
          <h3>Cancel Reservation</h3>
        </div>

        <div className="cancel-body">
          <p className="main-text">
            Are you sure you want to cancel this reservation?
          </p>
          <p className="sub-text">
            This action cannot be undone.
          </p>
        </div>

        <div className="cancel-footer">
          <button className="btn-action btn-no" onClick={onCancel}>
            No
          </button>
          <button className="btn-action btn-yes" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
