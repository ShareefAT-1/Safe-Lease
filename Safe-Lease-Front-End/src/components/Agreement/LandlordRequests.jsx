import React, { useState, useEffect, useCallback } from 'react'; 
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth'; 
import { toast } from 'react-hot-toast';
import ChatComponent from '../ChatComponent';
import axiosbase from '../../config/axios-config'; 

const LandlordRequests = () => {
    const { user, isAuthenticated, backendToken, loading: authLoading } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [error, setError] = useState(null);
    const [showChatFor, setShowChatFor] = useState(null); 

    const API_URL = axiosbase.defaults.baseURL;

    const fetchRequests = useCallback(async () => { 
        if (authLoading || !isAuthenticated || !backendToken || user?.role !== 'landlord') {
            setLoadingRequests(false);
            if (!isAuthenticated) {
                setError("You must be logged in to view requests.");
            } else if (user?.role !== 'landlord') {
                setError("You must be logged in as a landlord to view requests.");
            }
            return;
        }
        setLoadingRequests(true);
        try {
            const response = await axios.get(`${API_URL}/agreements/requests`, {
                headers: {
                    Authorization: `Bearer ${backendToken}`,
                },
            });
            setRequests(response.data?.requests || []);
            console.log("Fetched landlord requests:", response.data);
        } catch (err) {
            console.error("Error fetching landlord requests:", err);
            setError(err.response?.data?.message || "Failed to fetch agreement requests.");
            toast.error(err.response?.data?.message || "Failed to fetch agreement requests.");
        } finally {
            setLoadingRequests(false);
        }
    }, [authLoading, isAuthenticated, backendToken, user, API_URL]); 

    useEffect(() => {
        fetchRequests(); 
    }, [fetchRequests]); 

    const handleResponse = async (id, status) => {
        if (!isAuthenticated || !backendToken || user?.role !== 'landlord') {
            toast.error("You are not authorized to perform this action.");
            return;
        }
        try {
            await axios.put(
                `${API_URL}/agreements/respond/${id}`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${backendToken}`,
                    },
                }
            );
            toast.success(`Request ${status}ed`);
            fetchRequests(); 
        } catch (error) {
            console.error(`Error updating agreement status to ${status}:`, error);
            toast.error(error.response?.data?.message || `Failed to update status to ${status}.`);
        }
    };

    const handleNegotiate = async (agreementId, currentTerms) => {
        const newRentStr = prompt(`Enter new rent (current: ${currentTerms.rentAmount}):`, currentTerms.rentAmount);
        const newStartDateStr = prompt(`Enter new start date (current: ${new Date(currentTerms.startDate).toLocaleDateString()}):`, currentTerms.startDate ? currentTerms.startDate.substring(0,10) : ''); 
        const newEndDateStr = prompt(`Enter new end date (current: ${new Date(currentTerms.endDate).toLocaleDateString()}):`, currentTerms.endDate ? currentTerms.endDate.substring(0,10) : ''); 
        const newAgreementTerms = prompt(`Enter new agreement terms (current: ${currentTerms.agreementTerms}):`, currentTerms.agreementTerms);
        
        if (newRentStr === null || newStartDateStr === null || newEndDateStr === null || newAgreementTerms === null) {
            toast('Negotiation cancelled.', { icon: 'ℹ️' }); 
            return;
        }

        const newRent = parseFloat(newRentStr);
        const newStartDate = new Date(newStartDateStr).toISOString();
        const newEndDate = new Date(newEndDateStr).toISOString();

        const negotiationData = {
            rentAmount: newRent,
            startDate: newStartDate,
            endDate: newEndDate,
            agreementTerms: newAgreementTerms,
        };

        console.log("Sending negotiation data:", negotiationData); 

        try {
            await axios.put(
                `${API_URL}/agreements/negotiate/${agreementId}`, 
                negotiationData, 
                {
                    headers: {
                        Authorization: `Bearer ${backendToken}`,
                    },
                }
            );
            toast.success("Negotiation terms sent successfully!");
            fetchRequests(); 
        } catch (error) {
            console.error("Error sending negotiation terms:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to send negotiation terms.";
            toast.error(errorMessage);
        }
    };

    const openChatModal = (tenantId, tenantName) => {
        setShowChatFor({ recipientId: tenantId, recipientName: tenantName });
    };

    const closeChatModal = () => {
        setShowChatFor(null);
    };

    if (authLoading || loadingRequests) {
        return (
            <div className="text-center p-8">Loading requests...</div>
        );
    }

    if (error) {
        return <div className="text-center p-8 text-red-600">{error}</div>;
    }

    if (!requests.length) {
        return <div className="text-center p-8 text-gray-600">No agreement requests found.</div>;
    }

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Tenant Agreement Requests</h1>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {requests.map((request) => {
                    const propertyTitle = request.property?.title || request.property?.propertyName || 'Unknown Property';
                    const tenantName = request.tenant?.name || request.tenant?.username || 'Unknown Tenant';
                    
                    // Construct property location dynamically based on available fields
                    let propertyLocation = 'N/A';
                    if (request.property?.address && typeof request.property.address === 'object') {
                        propertyLocation = [request.property.address.city, request.property.address.state]
                            .filter(Boolean)
                            .join(', ');
                    } else if (request.property?.location) { // For manual properties with a single location string
                        propertyLocation = request.property.location;
                    } else if (request.property?.city || request.property?.state) { // Fallback for direct city/state
                        propertyLocation = [request.property.city, request.property.state]
                            .filter(Boolean)
                            .join(', ');
                    }


                    return (
                        <div key={request._id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between border border-gray-200">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    Request for: {propertyTitle}
                                </h2>
                                {propertyLocation !== 'N/A' && (
                                    <p className="text-gray-600 mb-1">
                                        <strong>Property Location:</strong> {propertyLocation}
                                    </p>
                                )}
                                <p className="text-gray-600 mb-1">
                                    <strong>Tenant:</strong> {tenantName}
                                </p>
                                <p className="text-gray-600 mb-1">
                                    <strong>Status:</strong> <span className={`font-medium ${
                                    request.status === 'pending' ? 'text-yellow-600' :
                                    request.status === 'approved' ? 'text-green-600' :
                                    request.status === 'rejected' ? 'text-red-600' :
                                    'text-blue-600'
                                }`}>{request.status}</span>
                                </p>
                                <p className="text-gray-600 mb-1">
                                    <strong>Requested Rent:</strong> ₹{request.rentAmount?.toLocaleString() || 'N/A'}
                                </p>
                                <p className="text-gray-600 mb-1">
                                    <strong>Proposed Start:</strong> {request.startDate ? new Date(request.startDate).toLocaleDateString() : 'N/A'}
                                </p>
                                <p className="text-gray-600 mb-1">
                                    <strong>Proposed End:</strong> {request.endDate ? new Date(request.endDate).toLocaleDateString() : 'N/A'}
                                </p>
                                {request.leaseTermMonths && ( // If you add this to the schema and it's populated
                                    <p className="text-gray-600 mb-1"><strong>Lease Term:</strong> {request.leaseTermMonths} months</p>
                                )}
                                {request.depositAmount && ( // If you add this to the schema and it's populated
                                    <p className="text-gray-600 mb-1"><strong>Deposit:</strong> ₹{request.depositAmount.toLocaleString()}</p>
                                )}
                                <p className="text-gray-600 mb-4">
                                    <strong>Terms:</strong> {request.agreementTerms || 'No terms provided.'}
                                </p>
                                {request.message && (
                                    <p className="text-gray-700 italic border-t pt-2 mt-2">"{request.message}"</p>
                                )}
                                {request.proposedTerms && (
                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                        <h4 className="font-semibold text-blue-800">Last Proposed Terms:</h4>
                                        <p className="text-blue-700">Rent: ₹{request.proposedTerms.rentAmount?.toLocaleString()}</p>
                                        <p className="text-blue-700">Start Date: {new Date(request.proposedTerms.startDate).toLocaleDateString()}</p>
                                        <p className="text-blue-700">End Date: {new Date(request.proposedTerms.endDate).toLocaleDateString()}</p>
                                        <p className="text-blue-700">Terms: {request.proposedTerms.agreementTerms}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 space-y-2">
                                {request.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleResponse(request._id, 'approved')}
                                            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-200 text-sm"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleNegotiate(request._id, { 
                                                rentAmount: request.rentAmount, 
                                                startDate: request.startDate, 
                                                endDate: request.endDate, 
                                                agreementTerms: request.agreementTerms 
                                            })}
                                            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200 text-sm"
                                        >
                                            Negotiate
                                        </button>
                                        <button
                                            onClick={() => handleResponse(request._id, 'rejected')}
                                            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-200 text-sm"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {request.tenant?._id && (
                                    <button
                                        onClick={() => openChatModal(request.tenant._id, request.tenant.name || request.tenant.username)}
                                        className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition duration-200 text-sm"
                                    >
                                        Chat with {request.tenant?.name || request.tenant?.username || 'Tenant'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {showChatFor && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-3/4 flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-lg">
                            <h3 className="text-lg font-semibold">Chat with {showChatFor.recipientName}</h3>
                            <button
                                onClick={closeChatModal}
                                className="text-white hover:text-gray-200 text-2xl font-bold p-1 rounded-full hover:bg-blue-700 transition"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <ChatComponent recipientId={showChatFor.recipientId} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandlordRequests;