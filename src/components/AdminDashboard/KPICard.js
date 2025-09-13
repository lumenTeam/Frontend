// src/components/AdminDashboard/KPICard.js
import React from 'react';

const KPICard = ({ title, value }) => {
  return (
    <div className="kpi-card">
      <h3>{title}</h3>
      <p className="value">{value}</p>
    </div>
  );
};

export default KPICard;