import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CreateAgreementPage = () => {
    const navigate = useNavigate();
    const { propertyId, landlordId } = useParams();

    const [formData, setFormData] = useState({
        property: propertyId || '',
        landlord: landlordId || '',
        startDate: '',
        endDate: '',
        rentAmount: '',
        agreementTerms: '',
        message: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const [propertyDetails, setPropertyDetails] = useState(null);
    const [landlordDetails, setLandlordDetails] = useState(null);
    const [fetchingDetails, setFetchingDetails] = useState(true);

    useEffect(() => {
        if (!propertyId || !landlordId) {
            toast.error("Property ID or Landlord ID is missing in the URL. Cannot create agreement request.");
            navigate('/properties');
            return;
        }

        const fetchDetails = async () => {
            setFetchingDetails(true);
            try {
                const propertyRes = await axios.get(`http://localhost:4000/properties/${propertyId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                // Assuming property-controller's getPropertyById returns the property object directly
                setPropertyDetails(propertyRes.data);

                // --- CORRECTED AXIOS CALL URL HERE ---
                const landlordRes = await axios.get(`http://localhost:4000/auth/${landlordId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                // Assuming auth-controller's getUserById returns the user object directly
                setLandlordDetails(landlordRes.data);

            } catch (error) {
                console.error("Error fetching details:", error);
                const errorMessage = error.response?.data?.message || error.message || "Failed to load property or landlord details. Please check the URL.";
                toast.error(errorMessage);
            } finally {
                setFetchingDetails(false);
            }
        };
        fetchDetails();
    }, [propertyId, landlordId, navigate]);

    const validateForm = () => {
        const errors = {};
        if (!formData.startDate) errors.startDate = "Start date is required.";
        if (!formData.endDate) errors.endDate = "End date is required.";
        if (!formData.rentAmount || parseFloat(formData.rentAmount) <= 0) errors.rentAmount = "Rent amount must be a positive number.";
        if (!formData.agreementTerms) errors.agreementTerms = "Agreement terms are required.";

        if (!propertyId) errors.property = "Property ID is missing in URL.";
        if (!landlordId) errors.landlord = "Landlord ID is missing in URL.";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
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

        if (!validateForm()) {
            toast.error("Please fill in all required fields correctly.");
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("You need to be logged in to create an agreement.");
                setSubmitting(false); // Reset submitting if not logged in
                return;
            }

            const agreementData = {
                propertyId: formData.property,
                landlordId: formData.landlord,
                startDate: formData.startDate,
                endDate: formData.endDate,
                rentAmount: parseFloat(formData.rentAmount), // Ensure it's a number
                agreementTerms: formData.agreementTerms,
                message: formData.message,
            };

            const response = await axios.post('http://localhost:4000/agreements/request', agreementData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            toast.success(response.data.message || 'Agreement request sent successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error sending agreement request:', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to send agreement request. Please try again.';
            toast.error(errorMessage);

        } finally {
            setSubmitting(false);
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

    const isFormDisabled = !propertyId || !landlordId || !propertyDetails || !landlordDetails;

    return (
        <div className="container mx-auto p-4 my-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">
                Request Lease Agreement
            </h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl max-w-2xl mx-auto border border-gray-200">
                {isFormDisabled && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline ml-2">Missing essential information (Property ID, Landlord ID, or details failed to load).</span>
                    </div>
                )}

                {propertyDetails && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                        <h2 className="text-lg font-semibold text-blue-700">Property: {propertyDetails.title || propertyDetails.propertyName || 'N/A'}</h2>
                        <p className="text-sm text-gray-600">Address: {propertyDetails.address || propertyDetails.location || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Price: ₹{propertyDetails.price?.toLocaleString() || 'N/A'}</p>
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
                    <label htmlFor="agreementTerms" className="block text-gray-700 text-sm font-bold mb-2">Proposed Agreement Terms:</label>
                    <textarea
                        id="agreementTerms"
                        name="agreementTerms"
                        value={formData.agreementTerms}
                        onChange={handleChange}
                        rows="6"
                        placeholder="E.g., Pet policy, maintenance responsibilities, etc."
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.agreementTerms ? 'border-red-500' : 'border-gray-300'}`}
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
                    disabled={submitting || isFormDisabled}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Sending Request...' : 'Send Lease Request'}
                </button>
            </form>
        </div>
    );
};

export default CreateAgreementPage;