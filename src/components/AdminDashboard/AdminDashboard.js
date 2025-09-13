// src/components/AdminDashboard/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import KPICard from './KPICard';
import PopularPlansChart from './PopularPlansChart';
import SubscriptionTrendsChart from './SubscriptionTrendsChart';
import './AdminDashboard.css';
import { Link } from 'react-router-dom';

// --- MOCK API FUNCTION ---
// In a real app, this would be a fetch call.
// Example: GET /api/admin/dashboard/churn?period=month
const fetchDashboardData = async () => {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 1000));

  // Return mock data that matches what your backend will send
  return {
    kpis: {
      activeSubscriptions: 12450,
      cancellationsThisMonth: 88,
    },
    trends: [
      { month: 'Apr', newSubscriptions: 120, cancellations: 10 },
      { month: 'May', newSubscriptions: 150, cancellations: 15 },
      { month: 'Jun', newSubscriptions: 180, cancellations: 12 },
      { month: 'Jul', newSubscriptions: 160, cancellations: 25 },
      { month: 'Aug', newSubscriptions: 200, cancellations: 18 },
      { month: 'Sep', newSubscriptions: 210, cancellations: 22 },
    ],
  };
};
// --- END MOCK API ---

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect to fetch data when the component first mounts
  useEffect(() => {
    const getData = async () => {
      const data = await fetchDashboardData();
      setDashboardData(data);
      setLoading(false);
    };
    getData();
  }, []); // Empty dependency array means this runs only once on mount

  // Display a loading message while data is being fetched
  if (loading) {
    return <div className="dashboard-container"><h1>Loading Dashboard...</h1></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="action-buttons">
            <Link to="/manage-plans">
                <button>Create New Plan</button>
            </Link>
            <Link to="/manage-plans">
                <button>View All Plans</button>
            </Link>
            </div>
        </div>

      <div className="kpi-grid">
        <KPICard title="Total Active Subscriptions" value={dashboardData.kpis.activeSubscriptions.toLocaleString()} />
        <KPICard title="Cancellations (This Month)" value={dashboardData.kpis.cancellationsThisMonth} />
      </div>

      <div className="charts-grid">
        {/* PopularPlansChart fetches its own data to handle filtering */}
        <PopularPlansChart />
        
        {/* SubscriptionTrendsChart receives data as a prop */}
        <SubscriptionTrendsChart data={dashboardData.trends} />
      </div>
    </div>
  );
};

export default AdminDashboard;