import React, { useEffect, useMemo, useState } from "react";
import "../styles/SeatMapHistory.css";

export default function SeatMapHistory() {

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [adminFilter, setAdminFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/seatmap/history");
        if (!res.ok) throw new Error("โหลด history ไม่สำเร็จ");
        const data = await res.json();

        // เรียงล่าสุดก่อน
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setLogs(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  /* ================= FILTER LIST ================= */

  const admins = useMemo(() => {
    const unique = new Set(logs.map(l => l.adminName));
    return Array.from(unique);
  }, [logs]);

  const changeTypes = useMemo(() => {
    const unique = new Set(logs.map(l => l.actionType));
    return Array.from(unique);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchAdmin =
        adminFilter === "all" || l.adminName === adminFilter;

      const matchType =
        typeFilter === "all" || l.actionType === typeFilter;

      return matchAdmin && matchType;
    });
  }, [logs, adminFilter, typeFilter]);

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("th-TH");
  };

  if (loading) return <div style={{ padding: 30 }}>Loading...</div>;

  return (
    <div className="history-page">

      <div className="history-header">
        <div>
          <h2>History Edit Seat Map</h2>
          <p>Track and review changes made to the seat map here.</p>
        </div>

        <button className="primary-btn">
          + Add New Entry
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="history-filters">

        <select
          value={adminFilter}
          onChange={(e) => setAdminFilter(e.target.value)}
        >
          <option value="all">All Admins</option>
          {admins.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Change Types</option>
          {changeTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <div className="date-box">
          {new Date().toLocaleDateString("th-TH")}
        </div>

      </div>

      {/* TABLE */}
      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Admin</th>
              <th>Action Type</th>
              <th>Seat Name</th>
              <th>Before</th>
              <th>After</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan="7" className="empty">
                  No history found.
                </td>
              </tr>
            )}

            {filteredLogs.map((log) => (
              <tr key={log._id}>
                <td>{formatDate(log.createdAt)}</td>
                <td>{log.adminName}</td>
                <td>{log.actionType}</td>
                <td>{log.after || log.before}</td>
                <td>{log.before || "-"}</td>
                <td>{log.after || "-"}</td>
                <td>
                  <button className="view-btn">
                    View
                  </button>
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>

    </div>
  );
}