import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const RequestAgreement = ({ propertyId, landlordId }) => {
  const [message, setMessage] = useState('');

  const handleRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/agreements/request', {
        propertyId,
        landlordId,
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
    <div className="p-4 border rounded">
      <h2 className="text-lg font-semibold mb-2">Request Agreement</h2>
      <textarea
        className="w-full p-2 border"
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Optional message to landlord..."
      />
      <button
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleRequest}
      >
        Send Request
      </button>
    </div>
  );
};

export default RequestAgreement;
