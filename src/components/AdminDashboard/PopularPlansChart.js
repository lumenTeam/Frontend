// src/components/AdminDashboard/PopularPlansChart.js
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- MOCK API FUNCTION ---
// In a real app, this would be a fetch call to your backend.
// Example: GET /api/admin/dashboard/top-plans?period=${period}
const fetchPopularPlans = async (period) => {
  console.log(`Fetching popular plans for period: ${period}`);
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));

  // Mock data for different periods
  const mockData = {
    month: [
      { name: 'Fibernet 100', users: 400 },
      { name: 'Fibernet 500', users: 320 },
      { name: 'Copper 50', users: 200 },
      { name: 'OTT Max', users: 150 },
    ],
    year: [
      { name: 'Fibernet 100', users: 4500 },
      { name: 'Fibernet 500', users: 3800 },
      { name: 'Copper 50', users: 2200 },
      { name: 'OTT Max', users: 1800 },
    ],
    all: [
      { name: 'Fibernet 100', users: 12000 },
      { name: 'Fibernet 500', users: 9500 },
      { name: 'Copper 50', users: 6000 },
      { name: 'OTT Max', users: 4500 },
    ],
  };
  return mockData[period];
};
// --- END MOCK API ---

const PopularPlansChart = () => {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect hook to fetch data whenever the 'period' changes
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const planData = await fetchPopularPlans(period);
      setData(planData);
      setLoading(false);
    };
    getData();
  }, [period]); // Dependency array: this effect runs again when 'period' changes

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>Popular Plans</h2>
        <div className="filter-buttons">
          <button className={period === 'month' ? 'active' : ''} onClick={() => setPeriod('month')}>Month</button>
          <button className={period === 'year' ? 'active' : ''} onClick={() => setPeriod('year')}>Year</button>
          <button className={period === 'all' ? 'active' : ''} onClick={() => setPeriod('all')}>All Time</button>
        </div>
      </div>
      {loading ? <p>Loading chart data...</p> : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="users" fill="#007bff" name="Active Users" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PopularPlansChart;