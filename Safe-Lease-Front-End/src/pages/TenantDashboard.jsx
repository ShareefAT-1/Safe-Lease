import React from 'react';

const TenantDashboard = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-800 mb-4">Tenant Dashboard</h1>
        <p className="text-lg text-gray-600">Welcome, Tenant! Your personalized dashboard is being built.</p>
        <p className="text-md text-gray-500 mt-2">You can add your active agreements, chat history, and payment status here.</p>
      </div>
    </div>
  );
};

export default TenantDashboard;