import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LandlordRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/agreements/requests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setRequests(res.data?.requests || []);
      } catch (err) {
        toast.error('Failed to fetch requests');
        console.log(err);
      }
    };

    fetchRequests();
  }, []);

  const handleResponse = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/agreements/respond/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Request ${status}`);
      setRequests((prev) => prev.filter(req => req._id !== id));
    } catch (err) {
      toast.error('Failed to respond');
      console.log(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Incoming Agreement Requests</h2>
      {(requests?.length || 0) === 0 ? (
        <p>No pending requests.</p>
      ) : (
        requests.map((req) => (
          <div key={req._id} className="border p-4 mb-3 rounded">
            <p><strong>Property:</strong> {req?.property?.title || "Unknown"}</p>
            <p><strong>Tenant:</strong> {req?.tenant?.name || "Unknown"}</p>
            <p><strong>Message:</strong> {req?.message || "No message provided."}</p>
            <button
              onClick={() => handleResponse(req._id, 'approved')}
              className="bg-green-600 text-white px-3 py-1 mr-2 rounded"
            >
              Approve
            </button>
            <button
              onClick={() => handleResponse(req._id, 'rejected')}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Reject
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default LandlordRequests;
