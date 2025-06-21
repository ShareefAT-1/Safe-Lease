import React, { useState, useEffect } from 'react'; 
import { useNavigate, useParams } from 'react-router-dom'; 
import axiosbase from '../config/axios-config'; 
import { toast } from 'react-hot-toast'; 
import { useAuth } from '../hooks/useAuth'; 

const CreateAgreementPage = () => { 
    const navigate = useNavigate(); 
    const { propertyId, landlordId } = useParams(); 
    const { user, isAuthenticated, backendToken, loading: authLoading } = useAuth(); 

    const [formData, setFormData] = useState({ 
        property: propertyId || '', 
        landlord: landlordId || '', 
        startDate: '', // YYYY-MM-DD format from input
        rentAmount: '', 
        agreementTerms: '', 
        message: '', 
        leaseTerm: 12, // Default lease term in months
        deposit: '' 
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
        if (authLoading || !isAuthenticated || !backendToken || !user?.id) { 
            setFetchingDetails(false);
            return;
        }
        if (user.role !== 'tenant') {
            toast.error("Only tenants can request agreements.");
            setFetchingDetails(false);
            return;
        }


        const fetchDetails = async () => { 
            setFetchingDetails(true); 
            try { 
                const propertyRes = await axiosbase.get(`/properties/${propertyId}`, { 
                    headers: { Authorization: `Bearer ${backendToken}` } 
                }); 
                setPropertyDetails(propertyRes.data); 

                const landlordRes = await axiosbase.get(`/auth/profile/${landlordId}`, { 
                    headers: { Authorization: `Bearer ${backendToken}` } 
                }); 
                setLandlordDetails(landlordRes.data); 

            } catch (error) { 
                console.error("Error fetching details:", error); 
                const errorMessage = error.response?.data?.message || error.message || "Failed to load property or landlord details. Please check the URL."; 
                toast.error(errorMessage); 
                setPropertyDetails(null); 
                setLandlordDetails(null);
            } finally { 
                setFetchingDetails(false); 
            } 
        }; 
        fetchDetails(); 
    }, [propertyId, landlordId, navigate, authLoading, isAuthenticated, backendToken, user]); 

    const validateForm = () => { 
        const errors = {}; 
        if (!formData.startDate) errors.startDate = "Move-in date is required."; 
        if (!formData.rentAmount || parseFloat(formData.rentAmount) <= 0) errors.rentAmount = "Rent amount must be a positive number."; 
        if (!formData.deposit || parseFloat(formData.deposit) < 0) errors.deposit = "Deposit must be a non-negative number."; 
        if (!formData.leaseTerm || parseInt(formData.leaseTerm, 10) <= 0) errors.leaseTerm = "Lease term must be a positive number of months."; 
        if (!formData.agreementTerms) errors.agreementTerms = "Agreement terms are required."; 

        if (!propertyId) errors.property = "Property ID is missing in URL."; 
        if (!landlordId) errors.landlord = "Landlord ID is missing in URL."; 
        if (!user?.id) errors.tenant = "Tenant not logged in.";


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

        if (!isAuthenticated || !backendToken || !user?.id || user.role !== 'tenant') { 
            toast.error("You must be logged in as a tenant to create an agreement."); 
            setSubmitting(false); 
            return; 
        }

        try { 
            // Calculate endDate based on startDate and leaseTerm
            const parsedStartDate = new Date(formData.startDate);
            const calculatedEndDate = new Date(parsedStartDate);
            calculatedEndDate.setMonth(parsedStartDate.getMonth() + parseInt(formData.leaseTerm, 10));
            // Ensure day of month doesn't jump due to month end differences
            if (calculatedEndDate.getDate() !== parsedStartDate.getDate()) {
                calculatedEndDate.setDate(0); // Go to last day of previous month
            }
            const isoEndDate = calculatedEndDate.toISOString();


            const agreementData = { 
                property: formData.property, 
                landlord: formData.landlord, 
                tenant: user.id, 
                requestedTerms: { 
                    rent: parseFloat(formData.rentAmount), 
                    deposit: parseFloat(formData.deposit), 
                    moveInDate: new Date(formData.startDate).toISOString(), 
                    leaseTerm: parseInt(formData.leaseTerm, 10), 
                    endDate: isoEndDate, // Include calculated endDate
                },
                agreementTerms: formData.agreementTerms, 
                requestMessage: formData.message, 
            }; 

            console.log("Sending agreement data:", agreementData); // Keep this for debugging

            const response = await axiosbase.post("/agreements/request", agreementData, { 
                headers: { 
                    'Authorization': `Bearer ${backendToken}` 
                } 
            }); 

            toast.success(response.data.message || 'Agreement request sent successfully!'); 
            navigate(-1); 
        } catch (error) { 
            console.error('Error sending agreement request:', error); 
            const errorMessage = error.response?.data?.message || error.message || 'Failed to send agreement request. Please try again.'; 
            toast.error(errorMessage); 

        } finally { 
            setSubmitting(false); 
        } 
    }; 

    if (authLoading || fetchingDetails) { 
        return ( 
            <div className="flex justify-center items-center h-screen bg-gray-100"> 
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div> 
                <p className="ml-4 text-lg text-gray-700">Loading details and authenticating...</p> 
            </div> 
        ); 
    } 

    const isFormDisabled = !propertyDetails || !landlordDetails || !isAuthenticated || !user?.id || user.role !== 'tenant'; 

    return ( 
        <div className="container mx-auto p-4 my-8 font-sans"> 
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-800"> 
                Request Lease Agreement 
            </h1> 
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl max-w-2xl mx-auto border border-gray-200"> 
                {isFormDisabled && ( 
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"> 
                        <strong className="font-bold">Error:</strong> 
                        <span className="block sm:inline ml-2">
                            {(!isAuthenticated || !user?.id) && "You are not logged in or your session has expired. "}
                            {user?.role === 'landlord' && "Only tenants can request agreements. "}
                            {!propertyDetails && "Property details failed to load. "}
                            {!landlordDetails && "Landlord details failed to load."}
                        </span> 
                    </div> 
                )} 

                {propertyDetails && ( 
                    <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200"> 
                        <h2 className="text-lg font-semibold text-blue-700">Property: {propertyDetails.title || 'N/A'}</h2> 
                        <p className="text-sm text-gray-600">Address: {propertyDetails.address?.street}, {propertyDetails.address?.city}</p> 
                        <p className="text-sm text-gray-600">Rent: ₹{propertyDetails.rent?.toLocaleString() || 'N/A'}</p> 
                    </div> 
                )} 
                {landlordDetails && ( 
                    <div className="mb-6 p-3 bg-green-50 rounded-md border border-green-200"> 
                        <h2 className="text-lg font-semibold text-green-700">Landlord: {landlordDetails.name || 'N/A'}</h2> 
                        <p className="text-sm text-gray-600">Contact Email: {landlordDetails.email || 'N/A'}</p> 
                    </div> 
                )} 

                {/* Move-in Date */} 
                <div className="mb-4"> 
                    <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">Proposed Move-in Date:</label> 
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

                {/* Rent Amount */} 
                <div className="mb-4"> 
                    <label htmlFor="rentAmount" className="block text-gray-700 text-sm font-bold mb-2">Proposed Monthly Rent (₹):</label> 
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
                
                {/* Deposit Amount */} 
                <div className="mb-4"> 
                    <label htmlFor="deposit" className="block text-gray-700 text-sm font-bold mb-2">Proposed Security Deposit (₹):</label> 
                    <input 
                        type="number" 
                        id="deposit" 
                        name="deposit" 
                        value={formData.deposit} 
                        onChange={handleChange} 
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.deposit ? 'border-red-500' : 'border-gray-300'}`} 
                        required 
                        disabled={isFormDisabled || submitting} 
                    /> 
                    {formErrors.deposit && <p className="text-red-500 text-xs italic mt-1">{formErrors.deposit}</p>} 
                </div> 

                 {/* Lease Term */} 
                 <div className="mb-4"> 
                    <label htmlFor="leaseTerm" className="block text-gray-700 text-sm font-bold mb-2">Proposed Lease Term (Months):</label> 
                    <input 
                        type="number" 
                        id="leaseTerm" 
                        name="leaseTerm" 
                        value={formData.leaseTerm} 
                        onChange={handleChange} 
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.leaseTerm ? 'border-red-500' : 'border-gray-300'}`} 
                        required 
                        min="1"
                        disabled={isFormDisabled || submitting} 
                    /> 
                    {formErrors.leaseTerm && <p className="text-red-500 text-xs italic mt-1">{formErrors.leaseTerm}</p>} 
                </div> 

                {/* Agreement Terms */} 
                <div className="mb-6"> 
                    <label htmlFor="agreementTerms" className="block text-gray-700 text-sm font-bold mb-2">Proposed Agreement Terms (Details):</label> 
                    <textarea 
                         id="agreementTerms" 
                         name="agreementTerms" 
                         value={formData.agreementTerms} 
                         onChange={handleChange} 
                         rows="6" 
                         placeholder="E.g., Pet policy, maintenance responsibilities, penalties for late rent, utilities, etc. (Please also mention proposed deposit and lease term here as they are included in the 'requestedTerms' for the landlord's review)." 
                         className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.agreementTerms ? 'border-red-500' : 'border-gray-300'}`} 
                         required 
                         disabled={isFormDisabled || submitting} 
                    ></textarea> 
                    {formErrors.agreementTerms && <p className="text-red-500 text-xs italic mt-1">{formErrors.agreementTerms}</p>} 
                </div> 

                {/* Message to Landlord (Optional) */} 
                <div className="mb-6"> 
                    <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">Message to Landlord (Optional):</label> 
                    <textarea 
                        id="message" 
                        name="message" 
                        value={formData.message} 
                        onChange={handleChange} 
                        rows="3" 
                        placeholder="E.g., 'Looking forward to hearing from you! I'm available for a call next week.'" 
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300" 
                        disabled={isFormDisabled || submitting} 
                    ></textarea> 
                </div> 

                <button
                    type="submit"
                    disabled={submitting || isFormDisabled}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Sending Request...' : 'Send Agreement Request'}
                </button>
            </form>
        </div>
    );
};

export default CreateAgreementPage;