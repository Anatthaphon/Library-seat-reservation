import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("user"); // 👈 role ชั่วคราว

  const switchRole = () => {
    setRole(prev => prev === "user" ? "admin" : "user");
  };

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

          <button className="switch-role-btn" onClick={switchRole}>
            Switch Role
          </button>
        </div>

        <ul>
          {role === "user" ? (
            <>
              <li>
                <Link to="/" onClick={() => setOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/planning" onClick={() => setOpen(false)}>
                  Planning
                </Link>
              </li>
              <li>
                <Link to="/reserve" onClick={() => setOpen(false)}>
                  Reservation
                </Link>
              </li>
            </>
          ) : (
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
