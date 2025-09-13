// src/components/AdminDashboard/SubscriptionTrendsChart.js
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SubscriptionTrendsChart = ({ data }) => {
  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>Subscription Trends</h2>
      </div>
      {/* ResponsiveContainer makes the chart fit the parent div */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="newSubscriptions" name="New Subscriptions" stroke="#007bff" strokeWidth={2} />
          <Line type="monotone" dataKey="cancellations" name="Cancellations" stroke="#dc3545" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SubscriptionTrendsChart;