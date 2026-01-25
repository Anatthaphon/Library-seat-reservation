import "../styles/CancelPopup.css";

export default function CancelPopup({ onCancel, onConfirm }) {
  return (
    <div className="overlay">
      <div className="cancel-popup">
        <h3>Cancel Reservation</h3>
        <p>
          Are you sure you want to cancel this reservation?
          <br />
          This action cannot be undone.
        </p>

        <div className="actions">
          <button onClick={onCancel}>No</button>
          <button className="danger" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
