import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import axios from 'axios';
import { toast } from 'react-hot-toast'; // Assuming you have toast for notifications

const CreateAgreementPage = () => {
  const navigate = useNavigate();
  const { propertyId, landlordId } = useParams(); // Get propertyId and landlordId from URL

  // State for agreement form fields
  const [formData, setFormData] = useState({
    property: propertyId || '', // Pre-fill from URL param
    landlord: landlordId || '', // Pre-fill from URL param
    startDate: '',
    endDate: '',
    rentAmount: '',
    agreementTerms: '',
    message: '', // Add a message field for the request
  });
  const [submitting, setSubmitting] = useState(false);

  // You might want to fetch and display the property/landlord details here
  // based on the IDs from the URL, but we won't make it required for submission
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [landlordDetails, setLandlordDetails] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      // Only fetch if IDs are present (i.e., we came from a property page)
      if (propertyId) {
        try {
          const propertyRes = await axios.get(`http://localhost:4000/properties/${propertyId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setPropertyDetails(propertyRes.data.property);
        } catch (error) {
          console.error("Error fetching property details:", error);
          toast.error("Failed to load property details.");
        }
      }
      if (landlordId) {
        try {
          // Assuming you have an endpoint to get user (landlord) details
          const landlordRes = await axios.get(`http://localhost:4000/users/${landlordId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setLandlordDetails(landlordRes.data.user);
        } catch (error) {
          console.error("Error fetching landlord details:", error);
          toast.error("Failed to load landlord details.");
        }
      }
    };
    fetchDetails();
  }, [propertyId, landlordId]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // The tenant's request is sent to the /agreements/request endpoint
      const response = await axios.post('http://localhost:4000/agreements/request', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Include your auth token
        }
      });

      toast.success(response.data.message || 'Agreement request sent successfully!');
      // Redirect to a dashboard or a page showing pending requests
      navigate('/dashboard'); // Or '/my-requests', '/agreements'
    } catch (error) {
      console.error('Error sending agreement request:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send agreement request.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false); // Reset submitting state
    }
  };

  return (
    <div className="container mx-auto p-4 my-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">
        Request Lease Agreement
      </h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl max-w-2xl mx-auto border border-gray-200">
        {/* Display Property and Landlord info if fetched */}
        {propertyDetails && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-700">Property: {propertyDetails.title}</h2>
            <p className="text-sm text-gray-600">{propertyDetails.address}</p>
          </div>
        )}
        {landlordDetails && (
          <div className="mb-6 p-3 bg-green-50 rounded-md border border-green-200">
            <h2 className="text-lg font-semibold text-green-700">Landlord: {landlordDetails.name}</h2>
            <p className="text-sm text-gray-600">Contact: {landlordDetails.email}</p>
          </div>
        )}

        {/* Start Date */}
        <div className="mb-4">
          <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">Proposed Start Date:</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* End Date */}
        <div className="mb-4">
          <label htmlFor="endDate" className="block text-gray-700 text-sm font-bold mb-2">Proposed End Date:</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Rent Amount */}
        <div className="mb-4">
          <label htmlFor="rentAmount" className="block text-gray-700 text-sm font-bold mb-2">Proposed Rent Amount:</label>
          <input
            type="number"
            id="rentAmount"
            name="rentAmount"
            value={formData.rentAmount}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Agreement Terms */}
        <div className="mb-6">
          <label htmlFor="agreementTerms" className="block text-gray-700 text-sm font-bold mb-2">Proposed Agreement Terms (Optional):</label>
          <textarea
            id="agreementTerms"
            name="agreementTerms"
            value={formData.agreementTerms}
            onChange={handleChange}
            rows="6"
            placeholder="E.g., Pet policy, maintenance responsibilities, etc."
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        {/* Message to Landlord (Optional) */}
        <div className="mb-6">
          <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">Message to Landlord:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="3"
            placeholder="Optional message (e.g., 'Looking forward to hearing from you!')"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-150 ease-in-out"
        >
          {submitting ? 'Sending Request...' : 'Send Lease Request'}
        </button>
      </form>
    </div>
  );
};

export default CreateAgreementPage; // Keep the export name for now, we'll adjust routing later