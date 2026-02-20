import React, { useState } from "react";
import "../styles/SeatMapHistory.css";

export default function SeatMapHistory() {
  const [history, setHistory] = useState([
    {
      id: 1,
      adminName: "Admin A",
      actionType: "Update Seat",
      seatId: "A12",
      beforeValue: "Available",
      afterValue: "Reserved",
      date: "2026-02-17 10:30"
    },
    {
      id: 2,
      adminName: "Admin B",
      actionType: "Delete Seat",
      seatId: "B05",
      beforeValue: "Reserved",
      afterValue: "Deleted",
      date: "2026-02-17 11:15"
    }
  ]);

  const [formData, setFormData] = useState({
    adminName: "",
    actionType: "",
    seatId: "",
    beforeValue: "",
    afterValue: ""
  });

  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.adminName || !formData.actionType) return;

    if (editingId) {
      setHistory(
        history.map((item) =>
          item.id === editingId
            ? { ...item, ...formData }
            : item
        )
      );
      setEditingId(null);
    } else {
      const newEntry = {
        id: Date.now(),
        ...formData,
        date: new Date().toLocaleString()
      };
      setHistory([...history, newEntry]);
    }

    setFormData({
      adminName: "",
      actionType: "",
      seatId: "",
      beforeValue: "",
      afterValue: ""
    });
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
  };

  const handleDelete = (id) => {
    setHistory(history.filter((item) => item.id !== id));
  };

  return (
    <div className="history-container">
      <h1>Seat Map History</h1>

      <div className="form-section">
        <h2>{editingId ? "Edit Record" : "Add New Record"}</h2>

        <input
          type="text"
          name="adminName"
          placeholder="Admin Name"
          value={formData.adminName}
          onChange={handleChange}
        />

        <input
          type="text"
          name="actionType"
          placeholder="Action Type"
          value={formData.actionType}
          onChange={handleChange}
        />

        <input
          type="text"
          name="seatId"
          placeholder="Seat ID"
          value={formData.seatId}
          onChange={handleChange}
        />

        <input
          type="text"
          name="beforeValue"
          placeholder="Before Value"
          value={formData.beforeValue}
          onChange={handleChange}
        />

        <input
          type="text"
          name="afterValue"
          placeholder="After Value"
          value={formData.afterValue}
          onChange={handleChange}
        />

        <button onClick={handleSubmit}>
          {editingId ? "Update" : "Add"}
        </button>
      </div>

      <table className="history-table">
        <thead>
          <tr>
            <th>Admin</th>
            <th>Action</th>
            <th>Seat</th>
            <th>Before</th>
            <th>After</th>
            <th>Date</th>
            <th>Manage</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr key={item.id}>
              <td>{item.adminName}</td>
              <td>{item.actionType}</td>
              <td>{item.seatId}</td>
              <td>{item.beforeValue}</td>
              <td>{item.afterValue}</td>
              <td>{item.date}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
