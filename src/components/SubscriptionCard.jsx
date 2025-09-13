import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const SubscriptionCard = ({ user }) => {
  const navigate = useNavigate();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [upgradePlans, setUpgradePlans] = useState([]);
  const [downgradePlans, setDowngradePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Base API URL - adjust this to match your backend
  const API_BASE = 'http://localhost:3000/api'; // Update with your backend URL

  // Fetch current subscription and available plans
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        
        // Fetch all available plans first
        const plansResponse = await fetch(`${API_BASE}/plans`);
        if (plansResponse.ok) {
          const plansData = await plansResponse.json();
          setAllPlans(plansData);
        }
        
        // Fetch current subscription using your backend API
        const subscriptionResponse = await fetch(`${API_BASE}/fetchSubscription/${user.id}`);
        
        if (subscriptionResponse.ok) {
          const subscriptionData = await subscriptionResponse.json();
          
          // Find active subscription
          const activeSubscription = subscriptionData.find(sub => 
            sub.Status !== 'cancelled' && new Date(sub['End Date']) > new Date()
          );
          
          if (activeSubscription) {
            setCurrentSubscription(activeSubscription);
            
            // Get upgrade and downgrade plans
            const currentPlan = activeSubscription.Subscription_Plans;
            const currentPrice = currentPlan.price_per_month;
            
            const upgradeOptions = plansData.filter(plan => 
              plan.price_per_month > currentPrice
            );
            const downgradeOptions = plansData.filter(plan => 
              plan.price_per_month < currentPrice
            );
            
            setUpgradePlans(upgradeOptions);
            setDowngradePlans(downgradeOptions);
          }
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchSubscriptionData();
    }
  }, [user]);

  // Handle plan upgrade
  const handleUpgrade = async (targetPlanId) => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`${API_BASE}/upgrade/${currentSubscription['Subscription Id']}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          targetPlanId: targetPlanId
        })
      });

      if (response.ok) {
        alert('Plan upgraded successfully!');
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Failed to upgrade plan: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle plan downgrade
  const handleDowngrade = async (targetPlanId) => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`${API_BASE}/downgrade/${currentSubscription['Subscription Id']}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          targetPlanId: targetPlanId
        })
      });

      if (response.ok) {
        alert('Plan downgraded successfully!');
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Failed to downgrade plan: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error downgrading plan:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle subscription renewal
  const handleRenew = async (daysToExtend) => {
    try {
      setActionLoading(true);
      
      // Calculate new end date
      const currentEndDate = new Date(currentSubscription['End Date']);
      const newEndDate = new Date(currentEndDate);
      newEndDate.setDate(newEndDate.getDate() + daysToExtend);
      
      const response = await fetch(`${API_BASE}/renew/${currentSubscription['Subscription Id']}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          newEndDate: newEndDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
        })
      });

      if (response.ok) {
        alert(`Subscription renewed for ${daysToExtend} days!`);
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Failed to renew subscription: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error renewing subscription:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle subscription cancellation
  const handleCancel = async () => {
    const confirmCancel = window.confirm('Are you sure you want to cancel your subscription?');
    if (!confirmCancel) return;

    try {
      setActionLoading(true);
      
      const response = await fetch(`${API_BASE}/cancel/${currentSubscription['Subscription Id']}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        })
      });

      if (response.ok) {
        alert('Subscription cancelled successfully!');
        navigate('/user/dashboard');
      } else {
        const errorData = await response.json();
        alert(`Failed to cancel subscription: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100">
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
          <div className="container-fluid">
            <a className="navbar-brand fw-bold" href="#">Lumen Dashboard</a>
            <div className="d-flex">
              <button
                className="btn btn-outline-light"
                onClick={() => navigate('/user/dashboard')}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </nav>
        <div className="container mt-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading your subscription details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">Lumen Dashboard</span>
          <div className="d-flex">
            <button
              className="btn btn-outline-light"
              onClick={() => navigate('/user/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="container mt-5">
        {/* Page Header */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h3 className="card-title">Manage Your Subscription</h3>
            <p className="card-text text-muted">
              Upgrade, downgrade, renew, or cancel your subscription.
            </p>
          </div>
        </div>

        {currentSubscription ? (
          <>
            {/* Current Subscription Details */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h4 className="card-title">Current Subscription</h4>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Plan:</strong> {currentSubscription.Subscription_Plans?.plan_name || 'N/A'}</p>
                    <p><strong>Price:</strong> ₹{currentSubscription.Subscription_Plans?.price_per_month || 'N/A'}/month</p>
                    <p><strong>Status:</strong> 
                      <span className={`badge ms-2 ${currentSubscription.Status === 'cancelled' ? 'bg-danger' : 'bg-success'}`}>
                        {currentSubscription.Status || 'active'}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Start Date:</strong> {formatDate(currentSubscription['Start Date'])}</p>
                    <p><strong>End Date:</strong> {formatDate(currentSubscription['End Date'])}</p>
                    <p><strong>Last Renewed:</strong> {formatDate(currentSubscription['Last Renewed Date'])}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-4">
              <h4>Quick Actions</h4>
              <div className="d-flex gap-3 flex-wrap">
                <button
                  className="btn btn-warning btn-lg shadow-sm"
                  onClick={() => handleRenew(30)}
                  disabled={actionLoading || currentSubscription.Status === 'cancelled'}
                >
                  {actionLoading ? 'Processing...' : 'Renew for 30 Days'}
                </button>
                <button
                  className="btn btn-info btn-lg shadow-sm"
                  onClick={() => handleRenew(90)}
                  disabled={actionLoading || currentSubscription.Status === 'cancelled'}
                >
                  {actionLoading ? 'Processing...' : 'Renew for 90 Days'}
                </button>
                <button
                  className="btn btn-danger btn-lg shadow-sm"
                  onClick={handleCancel}
                  disabled={actionLoading || currentSubscription.Status === 'cancelled'}
                >
                  {actionLoading ? 'Processing...' : 'Cancel Subscription'}
                </button>
              </div>
            </div>

            {/* Upgrade Plans */}
            {upgradePlans.length > 0 && currentSubscription.Status !== 'cancelled' && (
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h4 className="card-title mb-3">Upgrade Options</h4>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>Plan Name</th>
                          <th>Price</th>
                          <th>Features</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upgradePlans.map((plan) => (
                          <tr key={plan.plan_id}>
                            <td>{plan.plan_name}</td>
                            <td>₹{plan.price_per_month}/month</td>
                            <td>{plan.features || 'Premium features included'}</td>
                            <td>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleUpgrade(plan.plan_id)}
                                disabled={actionLoading}
                              >
                                {actionLoading ? 'Processing...' : 'Upgrade'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Downgrade Plans */}
            {downgradePlans.length > 0 && currentSubscription.Status !== 'cancelled' && (
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h4 className="card-title mb-3">Downgrade Options</h4>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>Plan Name</th>
                          <th>Price</th>
                          <th>Features</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {downgradePlans.map((plan) => (
                          <tr key={plan.plan_id}>
                            <td>{plan.plan_name}</td>
                            <td>₹{plan.price_per_month}/month</td>
                            <td>{plan.features || 'Basic features included'}</td>
                            <td>
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => handleDowngrade(plan.plan_id)}
                                disabled={actionLoading}
                              >
                                {actionLoading ? 'Processing...' : 'Downgrade'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* No Plans Available */}
            {upgradePlans.length === 0 && downgradePlans.length === 0 && (
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <h5>No upgrade or downgrade options available</h5>
                  <p className="text-muted">You can still renew or manage your current subscription.</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5>No Active Subscription</h5>
              <p className="text-muted">You don't have an active subscription.</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/plans')}
              >
                Browse Plans
              </button>
            </div>
          </div>
        )}
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
        .table tr:hover {
          background-color: rgba(0,123,255,0.1);
        }
      `}</style>
    </div>
  );
};

export default SubscriptionCard;