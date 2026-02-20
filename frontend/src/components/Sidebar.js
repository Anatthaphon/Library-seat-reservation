import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "guest";
  return (
    <>
      {/* ปุ่ม 3 ขีด */}
      <button className="menu-btn" onClick={() => setOpen(true)}>
        ☰
      </button>

      {/* พื้นหลัง */}
      {open && (
        <div className="overlay" onClick={() => setOpen(false)} />
      )}

      {/* กล่องเมนู */}
      <div className={`sidebar ${open ? 'open' : ''}`}>
        
        {/* ส่วนหัว sidebar */}
        <div className="sidebar-header">
          <button className="close-btn" onClick={() => setOpen(false)}>
            ✕
          </button>

        </div>

        <ul>

{/* ===== NOT LOGIN ===== */}
{role === "guest" && (
  <>
    <li>
      <Link to="/dashboard" onClick={() => setOpen(false)}>
        Home
      </Link>
    </li>
  </>
)}

{/* ===== USER ===== */}
{role === "user" && (
  <>
    <li>
      <Link to="/" onClick={() => setOpen(false)}>Home</Link>
    </li>

    <li>
      <Link to="/planning" onClick={() => setOpen(false)}>Planning</Link>
    </li>

    <li>
      <Link to="/reserve" onClick={() => setOpen(false)}>Reservation</Link>
    </li>
  </>
)}

{/* ===== ADMIN ===== */}
{role === "admin" && (
  <>
    <li>
      <Link to="/admin-reservation" onClick={() => setOpen(false)}>
        Reservation
      </Link>
    </li>

    <li>
      <Link to="/student-info" onClick={() => setOpen(false)}>
        Student info
      </Link>
    </li>

    <li>
      <Link to="/edit-seatmap" onClick={() => setOpen(false)}>
        Edit seat map
      </Link>
    </li>

    <li>
      <Link to="/seatmap-history" onClick={() => setOpen(false)}>
        History edit seat map
      </Link>
    </li>
  </>
)}

</ul>

      </div>
    </>
  );
};

export default Sidebar;
