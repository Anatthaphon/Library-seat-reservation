import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Planning from './pages/Planning';
import SeatMap from './pages/SeatMap';
import Reserve from './pages/reserve';
import Dashboard from './pages/dashboard';

import AdminReservation from "./pages/AdminReservation";
import StudentInfo from "./pages/StudentInfo";
import EditSeatMap from "./pages/EditSeatMap";
import SeatMapHistory from "./pages/SeatMapHistory";



// Components
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="App">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/planning"
              element={
                <ProtectedRoute>
                  <Planning />
                </ProtectedRoute>
              }
            />


            {/* Seat map */}
            <Route path="/seat-map" element={<SeatMap />} />
            <Route
              path="/seatmap"
              element={
                <ProtectedRoute>
                  <SeatMap />
                </ProtectedRoute>
              }
            />

            {/* Reservation */}
            <Route
              path="/reserve"
              element={
                <ProtectedRoute>
                  <Reserve />
                </ProtectedRoute>
              }
            />

            {/* Admin Pages */}
            <Route path="/admin-reservation" element={<AdminReservation />} />
            <Route path="/student-info" element={<StudentInfo />} />
            <Route path="/edit-seatmap" element={<EditSeatMap />} />
            <Route path="/seatmap-history" element={<SeatMapHistory />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
