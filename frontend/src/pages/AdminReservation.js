import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/AdminReservation.css";

const API_BASE_URL = "http://localhost:3001/api/schedules";

export default function AdminReservation() {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonthThai = new Date().toLocaleDateString("th-TH", { month: "short" });

  /* ---------------- LOGIC: CALCULATE STATUS ---------------- */
  // ฟังก์ชันนี้จะช่วยให้ Admin เห็นสถานะแบบ Real-time เหมือนนิสิต
  const calculateAdminStatus = (bookingDate, timeSlot, dbStatus) => {
    const now = new Date();
    const bDate = new Date(bookingDate);
    const currentStatus = String(dbStatus || "reserved").toLowerCase();

    // 1. ถ้าใน DB มีสถานะเช็คอินหรือยกเลิกแล้ว ให้โชว์ตามนั้นเลย
    if (["checkedin", "checked-in", "late", "cancelled"].includes(currentStatus)) {
      return currentStatus === "checkedin" || currentStatus === "checked-in" 
        ? "Checked-in" 
        : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);
    }

    // 2. ถ้าสถานะยังเป็น reserved/booked ให้คำนวณตามเวลาจริง
    let startH = timeSlot?.startTime || "00:00";
    let endH = timeSlot?.endTime || "23:59";

    const bStart = new Date(bDate).setHours(parseInt(startH), 0, 0, 0);
    const bEnd = new Date(bDate).setHours(parseInt(endH), 0, 0, 0);
    const checkInDeadline = new Date(bStart + 10 * 60000); // เส้นตาย 10 นาที

    if (now > bEnd) return "Completed"; 
    if (now > checkInDeadline) return "No Show"; // เลยเวลาเช็คอินแล้วแต่ยังไม่มา
    if (now >= bStart && now <= checkInDeadline) return "Active (Waiting)";
    
    return "Booked"; 
  };

  /* ---------------- FETCH BOOKING ---------------- */
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/reservations`);

      let bookings = [];
      if (Array.isArray(res.data)) bookings = res.data;
      else if (Array.isArray(res.data.data)) bookings = res.data.data;
      else if (Array.isArray(res.data.bookings)) bookings = res.data.bookings;

      const mapped = bookings.map((b) => {
        // Mapping Student ID
        let studentId = "N/A";
        if (typeof b.userId === "object") {
          studentId = b.userId.studentId || b.userId.username || b.userId._id?.slice(-6);
        } else if (typeof b.userId === "string") {
          studentId = b.userId.slice(-6);
        }

        // Mapping Seat Name
        let seatName = "-";
        if (typeof b.seatItemId === "object") {
          seatName = b.seatItemId.name || b.seatItemId.meta?.name || b.seatItemId._id?.slice(-4);
        } else if (typeof b.seatItemId === "string") {
          seatName = "ID:" + b.seatItemId.slice(-4);
        }

        // Mapping Time
        let start = b.timeSlot?.startTime || b.startTime || "00:00";
        let end = b.timeSlot?.endTime || b.endTime || "00:00";

        return {
          id: b._id,
          name: b.title || b.subject || "ไม่ได้ระบุ",
          studentId: studentId,
          roomId: b.seatItemId?._id || b.seatItemId,
          seat: seatName,
          date: b.date ? new Date(b.date).toLocaleDateString("en-CA") : "N/A",
          time: `${start.split(":")[0]}:00 - ${end.split(":")[0]}:00`,
          // ใช้โลจิกคำนวณสเตตัสที่นี่
          status: calculateAdminStatus(b.date, b.timeSlot, b.status),
          cancelCount: b.userId?.monthlyCancelCount || 0,
        };
      });

      setAllBookings(mapped.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error("FETCH ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // อัปเดตข้อมูลทุก 1 นาที เพื่อให้สถานะ Active เปลี่ยนเป็น No Show โดยไม่ต้องกด Refresh
    const timer = setInterval(fetchBookings, 60000);
    return () => clearInterval(timer);
  }, []);

  /* ---------------- DELETE ---------------- */
  const handleCancel = async (id) => {
    if (!window.confirm("ต้องการลบการจองนี้หรือไม่")) return;
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      fetchBookings();
    } catch (err) {
      alert("ลบไม่สำเร็จ");
    }
  };

  /* ---------------- UI HELPER ---------------- */
  const getStatusStyle = (status) => {
    switch (status) {
      case "Checked-in": return { color: "#22c55e", fontWeight: "bold" };
      case "Active (Waiting)": return { color: "#3b82f6", fontWeight: "bold" };
      case "No Show": return { color: "#ef4444", fontWeight: "bold" };
      case "Late": return { color: "#f59e0b", fontWeight: "bold" };
      case "Completed": return { color: "#6b7280" };
      default: return { color: "#374151" };
    }
  };

  return (
    <div className="student-list-container">
      <div className="list-header">
        <h1>Admin Reservation Management</h1>
        <button
          className="btn-add"
          onClick={() => navigate("/seatmap", { state: { returnTo: "/admin-reservation" } })}
        >
          + จองให้นิสิต
        </button>
      </div>

      <table className="main-student-table">
        <thead>
          <tr>
            <th>ชื่อ</th>
            <th>รหัสนิสิต</th>
            <th>ที่นั่ง</th>
            <th>วันที่</th>
            <th>เวลา</th>
            <th>สถานะ</th>
            <th>ยกเลิก</th>
            <th>จัดการ</th>
          </tr>
        </thead>

        <tbody>
          {allBookings.length > 0 ? (
            allBookings.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.studentId}</td>
                <td><strong>{b.seat}</strong></td>
                <td>{b.date}</td>
                <td>{b.time}</td>
                <td style={getStatusStyle(b.status)}>{b.status}</td>
                <td style={{ textAlign: "center" }}>
                  <b>{b.cancelCount}/3</b> {currentMonthThai}
                </td>
                <td style={{ textAlign: "center" }}>
                  <button
                    className="btn-nav"
                    style={{ color: "#ff4d4f", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => handleCancel(b.id)}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                {loading ? "กำลังโหลดข้อมูล..." : "ไม่มีข้อมูลการจองในขณะนี้"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}