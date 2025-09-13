import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';


import 'bootstrap/dist/css/bootstrap.min.css';

const UserDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [popularPlan, setPopularPlan] = useState(null);

  // Fetch most popular plan
  useEffect(() => {
    const fetchPopularPlan = async () => {
      const { data, error } = await supabase
        .from('popular_plan')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Error fetching popular plan:', error);
      } else if (data && data.length > 0) {
        setPopularPlan(data[0]);
      }
    };

    fetchPopularPlan();
  }, []);

  // Dummy plans (remove later when backend is ready)
  const plans = [
    { id: 1, name: 'Basic Plan', status: 'Active', price: 499 },
    { id: 2, name: 'Premium Plan', status: 'Inactive', price: 999 },
    { id: 3, name: 'Ultimate Plan', status: 'Active', price: 1499 },
  ];

  return (
    <div className="bg-light min-vh-100">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold" href="#">Lumen Dashboard</a>
          <div className="d-flex">
            <button
              className="btn btn-outline-light"
              onClick={() => window.location.reload()}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mt-5">
        {/* Welcome Section */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h3 className="card-title">Welcome back, {user?.email || 'User'}!</h3>
            <p className="card-text text-muted">
              Manage your subscriptions and browse new plans below.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mb-4 d-flex gap-3">
          <button
            className="btn btn-primary btn-lg shadow-sm"
            onClick={() => navigate('/user/subscriptions')}
          >
            Manage Subscriptions
          </button>
          <button
            className="btn btn-success btn-lg shadow-sm"
            onClick={() => navigate('/plans')}
          >
            Browse Plans
          </button>
        </div>

        {/* Most Popular Plan */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h4 className="card-title">Most Popular Plan</h4>
            {popularPlan ? (
              <p className="card-text">
                ⭐ {popularPlan.name} ({popularPlan.subscriptions_count} subscriptions)
              </p>
            ) : (
              <p className="text-muted">Loading most popular plan...</p>
            )}
          </div>
        </div>

        {/* Plans Table */}
        <div className="card shadow-sm">
          <div className="card-body">
            <h4 className="card-title mb-3">Your Plans</h4>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Plan Name</th>
                    <th>Status</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map(plan => (
                    <tr key={plan.id}>
                      <td>{plan.name}</td>
                      <td className={plan.status === 'Active' ? 'text-success' : 'text-danger'}>
                        {plan.status}
                      </td>
                      <td>₹{plan.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Effects */}
      <style jsx>{`
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.2s ease;
        }
        .card:hover {
          transform: translateY(-2px);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;
