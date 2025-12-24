import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';

// Pages
import Planning from './pages/Planning';
import SeatMap from './pages/SeatMap';

// Components
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/planning" replace />} />
            <Route path="/planning" element={<Planning />} />

            {/* Seat map */}
            <Route path="/seat-map" element={<SeatMap />} />
            <Route path="/seatmap" element={<SeatMap />} />

            {/* other routes... */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
