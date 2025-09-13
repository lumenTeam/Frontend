// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
// We will add Vamshi's component here later

// A temporary component for the other page
const ManagePlansPlaceholder = () => (
  <div>
    <h1>Manage Plans Page</h1>
    <p>This page is being built by Vamshi.</p>
  </div>
);


function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/manage-plans" element={<ManagePlansPlaceholder />} />
    </Routes>
  );
}

export default App;