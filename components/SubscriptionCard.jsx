import { useState } from "react";

export default function SubscriptionCard({ currentPlan }) {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(""); // upgrade/downgrade

  // Generic API caller
  const callApi = async (endpoint, showPlans = false) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subscription/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPlan }),
      });
      const data = await response.json();

      if (showPlans) {
        setPlans(data.availablePlans || []);
        setActionType(endpoint);
        setShowModal(true);
      } else {
        alert(`${endpoint} successful!`);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // Confirm selected plan
  const confirmPlan = async (selectedPlan) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subscription/confirm-${actionType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPlan, selectedPlan }),
      });
      const data = await response.json();
      console.log("Confirmed:", data);
      alert(`${actionType} to ${selectedPlan} successful!`);
    } catch (err) {
      console.error(err);
      alert("Error confirming plan!");
    } finally {
      setLoading(false);
      setShowModal(false);
      setPlans([]);
    }
  };

  return (
    <div className="p-6 border rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">
        Manage Subscription ({currentPlan})
      </h2>
      <div className="flex gap-4">
        <button
          onClick={() => callApi("renew")}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Renew
        </button>
        <button
          onClick={() => callApi("upgrade", true)}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded-lg"
        >
          Upgrade
        </button>
        <button
          onClick={() => callApi("downgrade", true)}
          disabled={loading}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
        >
          Downgrade
        </button>
        <button
          onClick={() => callApi("cancel")}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          Cancel
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">
              Select a plan to {actionType}
            </h3>
            <ul className="space-y-3">
              {plans.length > 0 ? (
                plans.map((plan) => (
                  <li
                    key={plan.id}
                    className="p-3 border rounded-lg flex justify-between items-center"
                  >
                    <span>
                      {plan.name} – ₹{plan.price}
                    </span>
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded-lg"
                      onClick={() => confirmPlan(plan.id)}
                    >
                      Choose
                    </button>
                  </li>
                ))
              ) : (
                <p>No plans available</p>
              )}
            </ul>
            <button
              className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded-lg"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
