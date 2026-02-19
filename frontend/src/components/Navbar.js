import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* LEFT — โลโก้หรือชื่อเว็บ */}
        <div className="navbar-logo">
          <Link to="/">Library</Link>
        </div>

        {/* RIGHT */}
        <ul className="navbar-menu">

          {!token ? (
            <>
              <li>
                <Link to="/login" className="nav-btn">
                  Log in
                </Link>
              </li>

              <li>
                <Link to="/register" className="nav-btn outline">
                  Sign up
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-user">
                {user?.studentId} {user?.name} {user?.surname}
              </li>

              <li>
                <button onClick={logout} className="nav-btn">
                  Logout
                </button>
              </li>
            </>
          )}

        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
