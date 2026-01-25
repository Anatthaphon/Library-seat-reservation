import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';

// Pages
import Planning from './pages/Planning';
import SeatMap from './pages/SeatMap';
import Reserve from './pages/reserve';
<<<<<<< HEAD
import Dashboard from "./pages/dashboard";
=======

>>>>>>> c474ab7e4fedaebb6f1a1c1206dd4356e450a171
// Components
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
            <Route path="/" element={<Navigate to="/planning" replace />} />
            <Route path="/planning" element={<Planning />} />
<<<<<<< HEAD
            <Route path="/dashboard" element={<Dashboard />} />
        
=======

>>>>>>> c474ab7e4fedaebb6f1a1c1206dd4356e450a171
            {/* Seat map */}
            <Route path="/seat-map" element={<SeatMap />} />
            <Route path="/seatmap" element={<SeatMap />} />

            {/* Reservation */}
            <Route path="/reserve" element={<Reserve />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
