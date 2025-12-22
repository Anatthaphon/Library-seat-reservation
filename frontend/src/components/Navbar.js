import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/planning" className="navbar-logo">
          Planning System
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/planning" className="navbar-link">Planning</Link>
          </li>
          {/* TODO: Add authentication menu items */}
          {/* TODO: Add seat reservation menu item */}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
