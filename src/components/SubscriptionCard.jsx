import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import 'bootstrap/dist/css/bootstrap.min.css';

const SubscriptionCard = ({ user }) => {
  const navigate = useNavigate();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [upgradePlans, setUpgradePlans] = useState([]);
  const [downgradePlans, setDowngradePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch current subscription and available plans
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        
        // Fetch current subscription directly from supabase
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          console.error('Error fetching subscription:', subscriptionError);
          return;
        }

        if (subscriptionData) {
          setCurrentSubscription(subscriptionData);
          
          // Fetch upgrade and downgrade plans
          await fetchPlansForUpgradeDowngrade(subscriptionData.current_plan);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchSubscriptionData();
    }
  }, [user]);

  // Fetch plans for upgrade/downgrade based on current plan
  const fetchPlansForUpgradeDowngrade = async (currentPlan) => {
    try {
      // API call for upgrade plans (higher than current plan)
      const { data: upgradeData, error: upgradeError } = await supabase
        .rpc('get_upgrade_plans', { current_plan: currentPlan });

      // API call for downgrade plans (lower than current plan)
      const { data: downgradeData, error: downgradeError } = await supabase
        .rpc('get_downgrade_plans', { current_plan: currentPlan });

      if (upgradeError) console.error('Error fetching upgrade plans:', upgradeError);
      else setUpgradePlans(upgradeData || []);

      if (downgradeError) console.error('Error fetching downgrade plans:', downgradeError);
      else setDowngradePlans(downgradeData || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  // Handle plan upgrade
  const handleUpgrade = async (newPlan) => {
    try {
      setActionLoading(true);
      const { data, error } = await supabase
        .rpc('upgrade_subscription', {
          user_id: user.id,
          subscription_id: currentSubscription.id,
          new_plan: newPlan
        });

      if (error) {
        console.error('Error upgrading plan:', error);
        alert('Failed to upgrade plan. Please try again.');
      } else {
        alert('Plan upgraded successfully!');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle plan downgrade
  const handleDowngrade = async (newPlan) => {
    try {
      setActionLoading(true);
      const { data, error } = await supabase
        .rpc('downgrade_subscription', {
          user_id: user.id,
          subscription_id: currentSubscription.id,
          new_plan: newPlan
        });

      if (error) {
        console.error('Error downgrading plan:', error);
        alert('Failed to downgrade plan. Please try again.');
      } else {
        alert('Plan downgraded successfully!');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle subscription renewal
  const handleRenew = async (daysToExtend) => {
    try {
      setActionLoading(true);
      const { data, error } = await supabase
        .rpc('renew_subscription', {
          user_id: user.id,
          subscription_id: currentSubscription.id,
          days_to_extend: daysToExtend
        });

      if (error) {
        console.error('Error renewing subscription:', error);
        alert('Failed to renew subscription. Please try again.');
      } else {
        alert(`Subscription renewed for ${daysToExtend} days!`);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
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
      const { data, error } = await supabase
        .rpc('cancel_subscription', {
          user_id: user.id,
          subscription_id: currentSubscription.id,
          end_date: 0
        });

      if (error) {
        console.error('Error cancelling subscription:', error);
        alert('Failed to cancel subscription. Please try again.');
      } else {
        alert('Subscription cancelled successfully!');
        navigate('/user/dashboard');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setActionLoading(false);
    }
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
                    <p><strong>Plan:</strong> {currentSubscription.current_plan}</p>
                    <p><strong>Status:</strong> 
                      <span className="badge bg-success ms-2">{currentSubscription.status}</span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Start Date:</strong> {new Date(currentSubscription.start_date).toLocaleDateString()}</p>
                    <p><strong>End Date:</strong> {new Date(currentSubscription.end_date).toLocaleDateString()}</p>
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
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Renew for 30 Days'}
                </button>
                <button
                  className="btn btn-info btn-lg shadow-sm"
                  onClick={() => handleRenew(90)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Renew for 90 Days'}
                </button>
                <button
                  className="btn btn-danger btn-lg shadow-sm"
                  onClick={handleCancel}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Cancel Subscription'}
                </button>
              </div>
            </div>

            {/* Upgrade Plans */}
            {upgradePlans.length > 0 && (
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
                          <tr key={plan.id}>
                            <td>{plan.name}</td>
                            <td>₹{plan.price}</td>
                            <td>{plan.description || 'Premium features included'}</td>
                            <td>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleUpgrade(plan.name)}
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
            {downgradePlans.length > 0 && (
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
                            <td>₹{plan.price_per_month}</td>
                            <td>{plan.description || 'Basic features included'}</td>
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