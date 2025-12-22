import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';

// Pages
import Planning from './pages/Planning';

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
            {/* TODO: Implement authentication routes */}
            {/* <Route path="/login" element={<Login />} /> */}
            {/* <Route path="/register" element={<Register />} /> */}
            {/* <Route path="/home" element={<Home />} /> */}
            {/* TODO: Implement seat reservation system */}
            {/* <Route path="/seats" element={<SeatReservation />} /> */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
