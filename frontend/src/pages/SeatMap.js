import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/SeatMap.css";

export default function SeatMap() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  const returnTo = state?.returnTo || "/reserve";

  const user = JSON.parse(localStorage.getItem("user"));
const role = user?.role;
const isAdmin = role === "admin";
  const [showAddModal, setShowAddModal] = useState(false);
  const [addKind, setAddKind] = useState("A"); 
// A | B | C | deco (deco = ของวางเฉยๆ กดไม่ได้)


const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);
const [selectedItemId, setSelectedItemId] = useState(null);
const [takenSeats, setTakenSeats] = useState(new Map());


useEffect(() => {
  const load = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/seatmap/items?mapId=main");
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


useEffect(() => {

  const loadBookedSeats = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/schedules");
      const data = await res.json();

      const map = new Map();
      const now = new Date();

      data.forEach(s => {
        const start = new Date(s.date);
        start.setHours(parseInt(s.timeSlot.startTime),0,0,0);

        const end = new Date(s.date);
        end.setHours(parseInt(s.timeSlot.endTime),0,0,0);

        let status = "booked";

        if(now >= start && now < end) status = "checkedin";
        else if(now >= end) status = "completed";

        map.set(String(s.room), status);
      });

      setTakenSeats(map);

    } catch (err) {
      console.error(err);
    }
  };

  // โหลดครั้งแรก
  loadBookedSeats();

  // 🔁 polling ทุก 5 วินาที
  const interval = setInterval(loadBookedSeats, 3000);

  return () => clearInterval(interval);

}, []);


  
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [addName, setAddName] = useState("");

  const selectedSeatName = useMemo(() => {
  const found = items.find(i => i._id === selectedSeat);
  return found?.meta?.name || null;
}, [selectedSeat, items]);

const selectedAdminName = useMemo(()=>{
 const f = items.find(i=>i._id===selectedItemId)
 return f?.meta?.name
},[selectedItemId,items])

if (loading) {
  return <div>Loading...</div>;
}

  // ===== กันเข้าหน้านี้แบบไม่มี state =====
  if (!state && !isAdmin) {
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

  if (!name || !name.trim()) {
    alert("กรุณากรอกชื่อโต๊ะก่อนเพิ่ม");
    return;
  }

  const isDeco = kind === "deco";

  const payload = {
    mapId: "main",
    type: isDeco ? "block" : "seat",
    zone: isDeco ? null : kind,
    size: "normal",
    pos: { left: 120, top: 120 },
    meta: {
      name: name.trim(),
    },
    isActive: true,
  };

  const res = await fetch("http://localhost:3001/api/seatmap/items", {
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

  // ✅ บันทึก history
  await fetch("http://localhost:3001/api/seatmap/history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      adminName: user?.username || "admin",
      actionType: "ADD",
      seatId: created._id,
      before: null,
      after: created.meta?.name
    })
  });

  // ✅ เพิ่มใน state
  setItems((prev) => [...prev, created]);

  // ✅ ปิด modal
  setShowAddModal(false);
  setAddName("");
};


const handleDeleteSelected = async () => {
  if (!selectedItemId) {
    alert("ยังไม่ได้เลือกโต๊ะที่จะลบ");
    return;
  }

  // หาโต๊ะก่อนลบ เพื่อเอาชื่อไปเก็บ history
  const deletedSeat = items.find(x => x._id === selectedItemId);

  const res = await fetch(`http://localhost:3001/api/seatmap/items/${selectedItemId}`, {
    method: "DELETE",
    headers: {
      "x-role": localStorage.getItem("role"),
    },
  });

  if (!res.ok) {
    alert("ลบไม่ได้ (ต้องเป็น admin)");
    return;
  }

  // บันทึก History
  await fetch("http://localhost:3001/api/seatmap/history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      adminName: user?.username || "admin",
      actionType: "DELETE",
      seatId: selectedItemId,
      before: deletedSeat?.meta?.name,
      after: null
    })
  });

  setItems((prev) => prev.filter((x) => x._id !== selectedItemId));
  setSelectedItemId(null);
};




  const handlePick = (itemId) => {
  if (takenSeats.has(itemId)) return;
  setSelectedSeat(itemId);
};



  const handleConfirm = () => {
    if (!selectedSeat) {
      alert("กรุณาเลือกที่นั่งก่อนค่ะ");
      return;
    }
    const seat = items.find(i => i._id === selectedSeat);
    navigate(returnTo, {
      replace: true,
      state: {
        id: state.id,
        date: state.date,
        startTime: state.startTime,
        endTime: state.endTime,
        seatItemId: selectedSeat,
        seatName: seat?.meta?.name,
        subject: state.subject || "",
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

/* ================= DRAG (ADMIN ONLY) ================= */
const startDrag = (e, it) => {
  if (!isAdmin) return;

  e.stopPropagation();
  setSelectedItemId(it._id);

  const startX = e.clientX;
  const startY = e.clientY;
  const startLeft = it.pos.left;
  const startTop = it.pos.top;

  const grid = 10; // snap grid
  const frame = document.querySelector(".map-frame");

  let latestPos = { left: startLeft, top: startTop };

  const handleMouseMove = (moveEvent) => {
    const dx = moveEvent.clientX - startX;
    const dy = moveEvent.clientY - startY;

    let newLeft = startLeft + dx;
    let newTop = startTop + dy;

    /* ===== Clamp inside frame ===== */
    if (frame) {
      const maxX = frame.offsetWidth - 60;
      const maxY = frame.offsetHeight - 60;

      newLeft = Math.max(0, Math.min(maxX, newLeft));
      newTop = Math.max(0, Math.min(maxY, newTop));
    }

    /* ===== Snap ===== */
    newLeft = Math.round(newLeft / grid) * grid;
    newTop = Math.round(newTop / grid) * grid;

    latestPos = { left: newLeft, top: newTop };

    setItems(prev =>
      prev.map(item =>
        item._id === it._id ? { ...item, pos: latestPos } : item
      )
    );
  };

  const handleMouseUp = async () => {
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);

  try {
    const res = await fetch(`http://localhost:3001/api/seatmap/items/${it._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-role": localStorage.getItem("role"),
      },
      body: JSON.stringify({ pos: latestPos }),
    });

    if (res.ok) {

      // บันทึก History
      await fetch("http://localhost:3001/api/seatmap/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          adminName: user?.username || "admin",
          actionType: "MOVE",
          seatId: it._id,
          before: `${startLeft}, ${startTop}`,
          after: `${latestPos.left}, ${latestPos.top}`
        })
      });

    }

  } catch (err) {
    console.error("Save position error:", err);
  }
};

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
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
        Selected item: <b>{selectedAdminName || "-"}</b>
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
  return (
    <div
      key={it._id}
      className={`seat-abs block-item ${selectedItemId === it._id ? "admin-selected" : ""}`}
      style={{
        left: it.pos.left,
        top: it.pos.top,
        cursor: isAdmin ? "grab" : "default"
      }}
      onMouseDown={(e) => startDrag(e, it)}
    >
      {it.meta?.name || it.meta?.label || "Object"}
    </div>
  );
}



  
  const status = takenSeats.get(it._id);
  const isTaken = status === "booked" || status === "checkedin";
  const isSelected = selectedSeat === it._id;


  return (
    <button
  key={it._id}
  className={[
    "seat",
    "seat-abs",
    it.zone === "B" ? "seat-b" : "",
    it.size === "tiny" ? "seat-tiny" : "",
    status === "booked" ? "seat-booked" :
    status === "checkedin" ? "seat-checkedin" :
    "seat-available",
    isSelected ? "selected" : "",
    selectedItemId === it._id ? "admin-selected" : "",
    it.zone ? `zone-${it.zone}` : "",
  ].join(" ")}
  style={{
    left: it.pos.left,
    top: it.pos.top,
    cursor: isAdmin ? "grab" : "pointer"
  }}
  onMouseDown={(e) => {
    if (isAdmin) startDrag(e, it);
  }}
  onClick={() => {
    if (isAdmin) setSelectedItemId(it._id);
    else handlePick(it._id);
  }}
  disabled={!isAdmin && isTaken}
>

      {it.meta?.name}
    </button>
  );
})}


        </div>
      </div>

      <div className="seatmap-footer">
        <div className="selected-info">
          Selected: <b>{selectedSeatName || "-"}</b>
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
