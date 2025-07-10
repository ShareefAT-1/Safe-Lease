import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '.././services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function TenantRequests() {
  const { user, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTenantRequests = async () => {
      if (!isAuthenticated || user?.role !== 'tenant') {
        setLoading(false);
        setError('You must be logged in as a tenant to view your requests.');
        return;
      }
      try {
        setLoading(true);
        const response = await api.get('/api/agreements/tenant-requests');
        setRequests(response.data.requests);
      } catch (err) {
        console.error('Error fetching tenant requests:', err);
        setError('Failed to load your lease requests. Please try again.');
        toast.error('Failed to load lease requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenantRequests();
  }, [isAuthenticated, user]);

  if (loading) {
    return <div className="text-center py-8">Loading your requests...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (!requests.length) {
    return <div className="text-center py-8 text-gray-600">You haven't made any lease requests yet.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Lease Requests</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="py-3 px-4 text-left">Property</th>
              <th className="py-3 px-4 text-left">Landlord</th>
              <th className="py-3 px-4 text-left">Rent</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Requested On</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="py-3 px-4">
                  {/* Safely access property title/name */}
                  <Link to={`/property/${request.property?._id}`} className="text-blue-600 hover:underline">
                    {request.property?.title || request.property?.propertyName || 'N/A'}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  {/* Safely access landlord username/name */}
                  {request.landlord?.username || request.landlord?.name || 'N/A'}
                </td>
                <td className="py-3 px-4">
                  {/* Safely access rent: check requestedTerms.rent first, then rentAmount */}
                  ${request.requestedTerms?.rent || request.rentAmount || 'N/A'}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    request.status === 'negotiating' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4">{new Date(request.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <Link to={`/agreement/${request._id}`} className="text-blue-600 hover:underline mr-2">
                    View Details
                  </Link>
                  {request.pdfPath && (
                    <a href={request.pdfPath} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                      View PDF
                    </a>
                  )}
                  {/* Add more actions if needed, e.g., cancel for pending requests */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}