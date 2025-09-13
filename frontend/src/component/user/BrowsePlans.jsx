import React from 'react';

const BrowsePlans = () => {
  const availablePlans = [
    { id: 1, name: 'Starter Plan', price: 299 },
    { id: 2, name: 'Advanced Plan', price: 699 },
    { id: 3, name: 'Pro Plan', price: 1299 },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Browse Plans</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Plan Name</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {availablePlans.map(plan => (
            <tr key={plan.id}>
              <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{plan.name}</td>
              <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>₹{plan.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BrowsePlans;
