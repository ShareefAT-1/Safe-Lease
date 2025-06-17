import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

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
    const [formErrors, setFormErrors] = useState({}); // State for client-side validation errors

    // State to hold fetched details for display (not for submission logic itself)
    const [propertyDetails, setPropertyDetails] = useState(null);
    const [landlordDetails, setLandlordDetails] = useState(null);
    const [fetchingDetails, setFetchingDetails] = useState(true); // To show loading state for details

    useEffect(() => {
        // Redirect or show error if crucial IDs are missing from URL
        if (!propertyId || !landlordId) {
            toast.error("Property ID or Landlord ID is missing in the URL. Cannot create agreement request.");
            navigate('/properties'); // Or a more appropriate fallback page
            return;
        }

        const fetchDetails = async () => {
            setFetchingDetails(true);
            try {
                // Fetch property details
                const propertyRes = await axios.get(`http://localhost:4000/properties/${propertyId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setPropertyDetails(propertyRes.data.property);

                // Fetch landlord details (assuming 'users' endpoint for user details)
                const landlordRes = await axios.get(`http://localhost:4000/users/${landlordId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setLandlordDetails(landlordRes.data.user);

            } catch (error) {
                console.error("Error fetching details:", error);
                toast.error("Failed to load property or landlord details. Please check the URL.");
                // Optionally disable form submission if critical details can't be loaded
            } finally {
                setFetchingDetails(false);
            }
        };
        fetchDetails();
    }, [propertyId, landlordId, navigate]); // Add navigate to dependency array

    const validateForm = () => {
        const errors = {};
        if (!formData.startDate) errors.startDate = "Start date is required.";
        if (!formData.endDate) errors.endDate = "End date is required.";
        if (!formData.rentAmount || formData.rentAmount <= 0) errors.rentAmount = "Rent amount must be a positive number.";
        if (!formData.agreementTerms) errors.agreementTerms = "Agreement terms are required."; // Backend requires this field

        // Ensure property and landlord IDs are present from URL params
        if (!propertyId) errors.property = "Property ID is missing in URL.";
        if (!landlordId) errors.landlord = "Landlord ID is missing in URL.";

        setFormErrors(errors);
        return Object.keys(errors).length === 0; // Return true if no errors
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        // Clear error for the field being changed
        if (formErrors[name]) {
            setFormErrors((prevErrors) => {
                const newErrors = { ...prevErrors };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation before sending request
        if (!validateForm()) {
            toast.error("Please fill in all required fields correctly.");
            return;
        }

        setSubmitting(true);

        try {
            // The tenant's request is sent to the /agreements/request endpoint
            const response = await axios.post('http://localhost:4000/agreements/request', formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Include your auth token
                }
            });

            toast.success(response.data.message || 'Agreement request sent successfully!');
            navigate('/dashboard'); // Or '/my-requests', '/agreements'
        } catch (error) {
            console.error('Error sending agreement request:', error); // Log the full error object for detailed debugging
            // Access more specific error message from backend if available
            const errorMessage = error.response?.data?.error || error.message || 'Failed to send agreement request. Please try again.';
            toast.error(errorMessage);

            // If it's a 400 validation error from backend, try to map to fields
            if (error.response && error.response.status === 400 && error.response.data.details) {
                // This part depends on how specific your backend sends validation errors
                // For now, it just displays the general message
            }
        } finally {
            setSubmitting(false); // Reset submitting state
        }
    };

    if (fetchingDetails) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                <p className="ml-4 text-lg text-gray-700">Loading property and landlord details...</p>
            </div>
        );
    }

    // Disable form if crucial IDs are missing (should be caught by useEffect first)
    const isFormDisabled = !propertyId || !landlordId;

    return (
        <div className="container mx-auto p-4 my-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">
                Request Lease Agreement
            </h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl max-w-2xl mx-auto border border-gray-200">
                {isFormDisabled && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline ml-2">Missing essential information (Property ID or Landlord ID) in the URL.</span>
                    </div>
                )}

                {/* Display Property and Landlord info if fetched */}
                {propertyDetails && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                        <h2 className="text-lg font-semibold text-blue-700">Property: {propertyDetails.title || propertyDetails.propertyName || 'N/A'}</h2>
                        <p className="text-sm text-gray-600">Address: {propertyDetails.address || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Landlord Email: {landlordDetails?.email || 'N/A'}</p>
                    </div>
                )}
                {landlordDetails && (
                    <div className="mb-6 p-3 bg-green-50 rounded-md border border-green-200">
                        <h2 className="text-lg font-semibold text-green-700">Landlord: {landlordDetails.name || landlordDetails.username || 'N/A'}</h2>
                        <p className="text-sm text-gray-600">Contact Email: {landlordDetails.email || 'N/A'}</p>
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
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                        required
                        disabled={isFormDisabled || submitting}
                    />
                    {formErrors.startDate && <p className="text-red-500 text-xs italic mt-1">{formErrors.startDate}</p>}
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
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                        required
                        disabled={isFormDisabled || submitting}
                    />
                    {formErrors.endDate && <p className="text-red-500 text-xs italic mt-1">{formErrors.endDate}</p>}
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
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.rentAmount ? 'border-red-500' : 'border-gray-300'}`}
                        required
                        disabled={isFormDisabled || submitting}
                    />
                    {formErrors.rentAmount && <p className="text-red-500 text-xs italic mt-1">{formErrors.rentAmount}</p>}
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
                        placeholder="E.g., Pet policy, maintenance responsibilities, etc. (Required by backend, even if optional for user input, it needs content)"
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.agreementTerms ? 'border-red-500' : 'border-gray-300'}`}
                        // Note: Backend requires this. If it's truly optional for the user,
                        // you might send an empty string or default text if user leaves it blank.
                        // Here, it's marked as required by validation.
                        required
                        disabled={isFormDisabled || submitting}
                    ></textarea>
                    {formErrors.agreementTerms && <p className="text-red-500 text-xs italic mt-1">{formErrors.agreementTerms}</p>}
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
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                        disabled={isFormDisabled || submitting}
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={submitting || isFormDisabled} // Disable button if submitting or form is fundamentally broken
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Sending Request...' : 'Send Lease Request'}
                </button>
            </form>
        </div>
    );
};

export default CreateAgreementPage;