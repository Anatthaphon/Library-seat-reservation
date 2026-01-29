import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/SeatMap.css";

export default function SeatMap() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  const returnTo = state?.returnTo || "/reserve";

  const role = localStorage.getItem("role"); // "admin" หรือ "user"
  const isAdmin = role === "admin";

  const [showAddModal, setShowAddModal] = useState(false);
  const [addKind, setAddKind] = useState("A"); 
// A | B | C | deco (deco = ของวางเฉยๆ กดไม่ได้)


const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);
const [selectedItemId, setSelectedItemId] = useState(null);


useEffect(() => {
  const load = async () => {
    try {
      const res = await fetch("/api/seatmap/items?mapId=main");
      if (!res.ok) throw new Error("โหลดไม่สำเร็จ");
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error(e);
      alert("โหลดแผนผังไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);


  const takenSeats = useMemo(() => new Set(), []);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [addName, setAddName] = useState("");

  // ===== กันเข้าหน้านี้แบบไม่มี state =====
  if (!state) {
    return (
      <div className="seatmap-page" style={{ padding: 24 }}>
        <h2>ไม่มีข้อมูลการจอง</h2>
        <p>กรุณากลับไปหน้า Reserve แล้วเลือกเวลาใหม่</p>
        <button onClick={() => navigate(returnTo, { replace: true })}>
          กลับไปหน้า Reserve
        </button>
      </div>
    );
  }
  const handleAddSeat = async (kind, name) => {
  // kind: "A" | "B" | "C" | "deco"
  const isDeco = kind === "deco";
  


  const payload = {
    mapId: "main",
    type: isDeco ? "block" : "seat",        // ✅ deco เป็น block (กดไม่ได้)
    seatId: isDeco ? null : `NEW${Date.now()}`,
    zone: isDeco ? null : kind,            // ✅ A/B/C
    size: "normal",
    pos: { left: 120, top: 120 },
    meta: {
      name: name?.trim() || (isDeco ? "Object" : ""),
      ...(isDeco ? { label: "Object" } : {}),
    },
    isActive: true,
  };

  const res = await fetch("/api/seatmap/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-role": localStorage.getItem("role"),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    alert("เพิ่มไม่ได้ (ต้องเป็น admin หรือ API ไม่เจอ)");
    return;
  }

  const created = await res.json();
  setItems((prev) => [...prev, created]);
  setShowAddModal(false);
  setAddName(""); // ✅ เคลียร์ช่อง
};


const handleDeleteSelected = async () => {
  if (!selectedItemId) {
    alert("ยังไม่ได้เลือกโต๊ะที่จะลบ");
    return;
  }

  const res = await fetch(`/api/seatmap/items/${selectedItemId}`, {
    method: "DELETE",
    headers: {
      "x-role": localStorage.getItem("role"),
    },
  });

  if (!res.ok) {
    alert("ลบไม่ได้ (ต้องเป็น admin)");
    return;
  }

  setItems((prev) => prev.filter((x) => x._id !== selectedItemId));
  setSelectedItemId(null);
};


  const handlePick = (seatId) => {
    if (takenSeats.has(seatId)) return;
    setSelectedSeat(seatId);
  };

  const handleConfirm = () => {
    if (!selectedSeat) {
      alert("กรุณาเลือกที่นั่งก่อนค่ะ");
      return;
    }

    navigate(returnTo, {
      replace: true,
      state: {
        booking: {
          date: state.date,
          startTime: state.startTime,
          endTime: state.endTime,
          seatId: selectedSeat,
          subject: state.subject || "",
        },
      },
    });
  };

  const getColorByDay = (dateObj) => {
  const d = dateObj.getDay();
  const dayColors = {
    1: '#facc15',
    2: '#ec4899',
    3: '#22c55e',
    4: '#f97316',
    5: '#06b6d4',
    6: '#8b5cf6',
    0: '#9ca3af',
  };
  return dayColors[d] || '#3b82f6';
};


  return (
    <div className="seatmap-shell">
      {/* LEFT: STATUS */}
      <aside className="side-panel left">
        <h3 className="side-title">STATUS</h3>
      <div className="status-item">
        <span className="dot available" />
        <span>Available</span>
      </div>
      <div className="status-item">
        <span className="dot booked" />
        <span>Booked</span>
      </div>
      <div className="status-item">
        <span className="dot checkedin" />
        <span>Checked-in</span>
      </div>
      <div className="status-item">
        <span className="dot disabled" />
        <span>Disabled</span>
      </div>

      {/* ✅ Booking card ใต้ STATUS */}
      <div
        className="booking-card"
        style={{ borderColor: state?.color || getColorByDay(new Date(state.date)) }}
      >
        <div
          className="booking-time"
          style={{ background: state?.color || getColorByDay(new Date(state.date)) }}
        >
          {state.startTime} - {state.endTime}
        </div>

        <div className="booking-title">
          {state.title || "Event"}
        </div>
      </div>
    </aside>


    {/* CENTER: MAP */}
    <div className="seatmap-page">
      {isAdmin && (
    <div className="admin-toolbar">
      <button className="admin-btn" onClick={() => setShowAddModal(true)}>
  + Add
</button>

      <button className="admin-btn danger" onClick={handleDeleteSelected}>Delete Selected</button>

      <div className="admin-hint">
        Selected item: <b>{selectedItemId || "-"}</b>
      </div>
    </div>
  )}
  {isAdmin && showAddModal && (
  <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
      <h3 style={{ marginTop: 0 }}>เลือกประเภทที่จะเพิ่ม</h3>

      <div className="modal-options">
        <label>
          <input
            type="radio"
            name="kind"
            value="A"
            checked={addKind === "A"}
            onChange={() => setAddKind("A")}
          />
          <b>A</b> — Tables for groups of 2–4 people
        </label>

        <label>
          <input
            type="radio"
            name="kind"
            value="B"
            checked={addKind === "B"}
            onChange={() => setAddKind("B")}
          />
          <b>B</b> — Tables for groups of 1 people
        </label>

        <label>
          <input
            type="radio"
            name="kind"
            value="C"
            checked={addKind === "C"}
            onChange={() => setAddKind("C")}
          />
          <b>C</b> — Tables for groups of 4–6 people
        </label>

        <label>
          <input
            type="radio"
            name="kind"
            value="deco"
            checked={addKind === "deco"}
            onChange={() => setAddKind("deco")}
          />
          <b>Object</b> — ของวาง/สิ่งกีดขวาง (กดเลือกไม่ได้)
        </label>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
  <label style={{ fontWeight: 800 }}>ชื่อโต๊ะที่จะแสดงบนแผนผัง</label>
  <input
    value={addName}
    onChange={(e) => setAddName(e.target.value)}
    placeholder="เช่น โต๊ะ A-ริมหน้าต่าง / โต๊ะคอม 1"
    className="name-input"
  />
</div>

      <div className="modal-actions">
        <button className="admin-btn" onClick={() => handleAddSeat(addKind, addName)}>
  Add
</button>
        <button className="admin-btn danger" onClick={() => setShowAddModal(false)}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}



      <div className="seatmap-canvas">
        <div className="map-zoom">
          <div className="map-frame">
            <div className="top-left-bar" />
            <div className="left-pillars">
              <div className="pillar" style={{ top: 40 }} />
              <div className="pillar" style={{ top: 210 }} />
              <div className="pillar" style={{ top: 390 }} />
              <div className="pillar" style={{ top: 560 }} />
            </div>
          </div>

          <div className="map-label exit">ทางหนีไฟ</div>

          <div className="bookshelf">
            <span>ชั้นหนังสือ</span>
          </div>

          <div className="computer-zone" style={{ left: 90, top: 730, gap: 40 }}>
            <div className="seat seat-abs fixed-seat">A12</div>
            <div className="computer-box">Computer</div>
          </div>

          <div className="control-room">ห้องควบคุมไฟฟ้า</div>

          {items.map((it) => {
  const isSeat = it.type === "seat";
  const isBlock = it.type === "block";
  if (!isSeat && !isBlock) return null;

  if (isBlock) {
    // ✅ ของวาง: แสดงเป็นกล่องเทา กดไม่ได้
    return (
      <div
        key={it._id}
        className={`seat-abs block-item ${selectedItemId === it._id ? "admin-selected" : ""}`}
        style={{ left: it.pos.left, top: it.pos.top }}
        onClick={() => isAdmin && setSelectedItemId(it._id)}
      >
        {it.meta?.name || it.meta?.label || "Object"}
      </div>
    );
  }

  // ✅ seat ปกติ: กดได้ (user) / เลือกแก้ไขได้ (admin)
  const isTaken = takenSeats.has(it.seatId);
  const isSelected = selectedSeat === it.seatId;

  return (
    <button
      key={it._id}
      className={[
        "seat",
        "seat-abs",
        it.zone === "B" ? "seat-b" : "",
        it.size === "tiny" ? "seat-tiny" : "",
        isTaken ? "taken" : "",
        isSelected ? "selected" : "",
        selectedItemId === it._id ? "admin-selected" : "",
        it.zone ? `zone-${it.zone}` : "",
      ].join(" ")}
      style={{ left: it.pos.left, top: it.pos.top }}
      onClick={() => {
        if (isAdmin) setSelectedItemId(it._id);
        else handlePick(it.seatId);
      }}
      disabled={!isAdmin && isTaken}
    >
      {it.meta?.name?.trim() ? it.meta.name : it.seatId}
    </button>
  );
})}


        </div>
      </div>

      <div className="seatmap-footer">
        <div className="selected-info">
          Selected: <b>{selectedSeat || "-"}</b>
        </div>

        <button className="confirm-btn" onClick={handleConfirm}>
          Confirm Reservation
        </button>
      </div>
    </div>

    {/* RIGHT: TABLE */}
    <aside className="side-panel right">
      <h3 className="side-title">TABLE</h3>

      <div className="table-item">
        <span className="label a">A</span>
        <span>Tables for groups of 2–4 people.</span>
      </div>

      <div className="table-item">
        <span className="label b">B</span>
        <span>Tables for groups of 1 people.</span>
      </div>

      <div className="table-item">
        <span className="label c">C</span>
        <span>Tables for groups of 4–6 people.</span>
      </div>

      <div className="table-item">
        <span className="label computer">Computer</span>
        <span>Search for information on the internet</span>
      </div>
    </aside>
  </div>
);}
