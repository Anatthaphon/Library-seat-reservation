import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* เว้นฝั่งซ้ายไว้โล่ง ๆ */}
        <div></div>

        {/* เมนูฝั่งขวา (ถ้าอยากให้มี) */}
        <ul className="navbar-menu">

          {/* ถ้ายังไม่อยากให้มีเมนูเลย ลบ <li> ทั้งหมดได้ */}
          
          {/* 
          <li className="navbar-item">
            <Link to="/planning" className="navbar-link">
              Planning
            </Link>
          </li>
          */}

        </ul>

      </div>
    </nav>
  );
};

export default Navbar;