import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ปุ่ม 3 ขีด */}
      <button className="menu-btn" onClick={() => setOpen(true)}>
        ☰
      </button>

      {/* พื้นหลัง (กดเพื่อปิดเมนู) */}
      {open && (
        <div className="overlay" onClick={() => setOpen(false)} />
      )}

      {/* กล่องเมนู */}
      <div className={`sidebar ${open ? 'open' : ''}`}>
        {/* ปุ่มกากบาท */}
        <button className="close-btn" onClick={() => setOpen(false)}>
          ✕
        </button>

        <ul>
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

          {/* เผื่ออนาคต */}
          {/* <li>
            <Link to="/history" onClick={() => setOpen(false)}>
              History
            </Link>
          </li> */}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
