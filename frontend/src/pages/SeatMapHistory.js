import React, { useEffect, useMemo, useState } from "react";
import styles from "../styles/SeatMapHistory.module.css";

export default function SeatMapHistory() {

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [adminFilter, setAdminFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [selectedLog, setSelectedLog] = useState(null);

  const getSeatStyle = (pos) => {

    if (!pos) return {};

    const [x, y] = pos.split(",").map(Number);

    const scale = 0.5;

    return {
      position: "absolute",
      left: x * scale + "px",
      top: y * scale + "px"
    };
  };

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/seatmap/history");
        if (!res.ok) throw new Error("โหลด history ไม่สำเร็จ");
        const data = await res.json();

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

  /* ================= FILTER ================= */

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
    <div className={styles["history-page"]}>

      <div className={styles["history-header"]}>

        <div>
          <h2>History Edit Seat Map</h2>
          <p>Track and review changes made to the seat map here.</p>
        </div>

        <button className={styles["primary-btn"]}>
          + Add New Entry
        </button>

      </div>

      {/* FILTER */}

      <div className={styles["history-filters"]}>

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

        <div className={styles["date-box"]}>
          {new Date().toLocaleDateString("th-TH")}
        </div>

      </div>

      {/* TABLE */}

      <div className={styles["history-table-wrapper"]}>

        <table className={styles["history-table"]}>

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
                <td colSpan="7" className={styles["empty"]}>
                  No history found.
                </td>
              </tr>
            )}

            {filteredLogs.map((log) => (

              <tr
                key={log._id}
                className={styles[`row-${log.actionType?.toLowerCase()}`]}
              >

                <td>{formatDate(log.createdAt)}</td>
                <td>{log.adminName}</td>
                <td>{log.actionType}</td>

                <td>{log.seatName || "-"}</td>

                <td>{log.before || "-"}</td>
                <td>{log.after || "-"}</td>

                <td>
                  <button
                    className={styles["view-btn"]}
                    onClick={() => setSelectedLog(log)}
                  >
                    View
                  </button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* MODAL */}

      {selectedLog && (

        <div className={styles["seatmap-modal"]}>

          <div className={styles["seatmap-container"]}>

            <button
              className={styles["seatmap-close-btn"]}
              onClick={() => setSelectedLog(null)}
            >
              ✕
            </button>

            <h3 className={styles["seatmap-title"]}>
              Seat Map Change
            </h3>

            <div className={styles["seatmap-canvas"]}>

              <div className={styles["history-shelf"]}>
                ชั้นหนังสือ
              </div>

              <div className={styles["history-exit"]}>
                ทางหนีไฟ
              </div>

              <div className={styles["history-electric"]}>
                ห้องควบคุมไฟฟ้า
              </div>

              {/* ADD */}

              {selectedLog.actionType === "ADD" && selectedLog.after && (
                <div
                  className={`${styles["history-seat"]} ${styles["add-seat"]}`}
                  style={getSeatStyle(selectedLog.after)}
                >
                  {selectedLog.seatName}
                </div>
              )}

              {/* DELETE */}

              {selectedLog.actionType === "DELETE" && selectedLog.before && (
                <div
                  className={`${styles["history-seat"]} ${styles["delete-seat"]}`}
                  style={getSeatStyle(selectedLog.before)}
                >
                  {selectedLog.seatName}
                </div>
              )}

              {/* MOVE */}

              {selectedLog.actionType === "MOVE" && (
                <>
                  {selectedLog.before && (
                    <div
                      className={`${styles["history-seat"]} ${styles["move-before"]}`}
                      style={getSeatStyle(selectedLog.before)}
                    >
                      {selectedLog.seatName}
                    </div>
                  )}

                  {selectedLog.after && (
                    <div
                      className={`${styles["history-seat"]} ${styles["move-after"]}`}
                      style={getSeatStyle(selectedLog.after)}
                    >
                      {selectedLog.seatName}
                    </div>
                  )}
                </>
              )}

            </div>

            {/* LEGEND */}

            <div className={styles["seatmap-legend"]}>

              <div className={styles["legend-item"]}>
                <span className={`${styles["legend-box"]} ${styles["add"]}`}></span>
                ADD
              </div>

              <div className={styles["legend-item"]}>
                <span className={`${styles["legend-box"]} ${styles["delete"]}`}></span>
                DELETE
              </div>

              <div className={styles["legend-item"]}>
                <span className={`${styles["legend-box"]} ${styles["before"]}`}></span>
                Before Move
              </div>

              <div className={styles["legend-item"]}>
                <span className={`${styles["legend-box"]} ${styles["after"]}`}></span>
                After Move
              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}