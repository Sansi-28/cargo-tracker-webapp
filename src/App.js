import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import './App.css'; // Main App CSS

function App() {
  return (
    <Router>
      <div className="App">
         {/* Could add a Navbar component here if needed */}
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          {/* Add other routes if needed, e.g., /shipment/:id for a dedicated detail page */}
          {/* <Route path="/shipment/:shipmentId" element={<ShipmentDetailPage />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;