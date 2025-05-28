import React, { useState, useEffect } from 'react';
import RequestAgreement from '../components/Agreement/RequestAgreement';

const realPropertyId = '681ba0bc120b51741514e0e6';
const realLandlordId = '68334776e89ba604c7462d0a';

const TestRequestAgreement = () => {
  const [tenantId, setTenantId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    setTenantId(storedUserId);
  }, []);

  if (!tenantId) {
    return <p>Loading tenant info... Please login first.</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Request Agreement</h1>
      <RequestAgreement
        propertyId={realPropertyId}
        landlordId={realLandlordId}
        tenantId={tenantId}
      />
    </div>
  );
};

export default TestRequestAgreement;
