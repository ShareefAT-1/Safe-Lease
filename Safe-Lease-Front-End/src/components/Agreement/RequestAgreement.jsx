import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const RequestAgreement = ({ propertyId, landlordId, tenantId }) => {
  const [message, setMessage] = useState('');
  const [agreementTerms, setAgreementTerms] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // console.log("tenantId:", tenantId);


  const handleRequest = async () => {
    if (!agreementTerms || !rentAmount || !startDate || !endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('user_access_token');
      const res = await axios.post('http://localhost:4000/agreements/request', {
        propertyId,
        landlordId,
        tenant: tenantId,  
        agreementTerms,
        rentAmount: Number(rentAmount),
        startDate,
        endDate,
        message,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send request');
    }
  };

  return (
    <div className="p-4 border rounded space-y-3">
      <h2 className="text-lg font-semibold">Request Agreement</h2>

      <textarea
        className="w-full p-2 border"
        rows={2}
        value={agreementTerms}
        onChange={(e) => setAgreementTerms(e.target.value)}
        placeholder="Agreement Terms (required)"
      />

      <input
        type="number"
        className="w-full p-2 border"
        value={rentAmount}
        onChange={(e) => setRentAmount(e.target.value)}
        placeholder="Rent Amount (required)"
      />

      <input
        type="date"
        className="w-full p-2 border"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        placeholder="Start Date (required)"
      />

      <input
        type="date"
        className="w-full p-2 border"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        placeholder="End Date (required)"
      />

      <textarea
        className="w-full p-2 border"
        rows={2}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Optional message to landlord..."
      />

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleRequest}
      >
        Send Request
      </button>
    </div>
  );
};

export default RequestAgreement;
