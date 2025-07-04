import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth'; // Ensure this path is correct
import { toast } from 'react-hot-toast';
import ChatComponent from '../ChatComponent'; // Ensure this path is correct
import axiosbase from '../../config/axios-config'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const LandlordRequests = () => {
    const { user, isAuthenticated, backendToken, loading: authLoading } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [error, setError] = useState(null);
    const [showChatFor, setShowChatFor] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate

    const API_URL = axiosbase.defaults.baseURL;

    const fetchRequests = useCallback(async () => {
        if (authLoading) return; // Wait for auth to complete

        if (!isAuthenticated || !backendToken || user?.role !== 'landlord') {
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
            // Updated endpoint to match backend route /agreements/landlord-requests
            const response = await axios.get(`${API_URL}/agreements/landlord-requests`, {
                headers: {
                    Authorization: `Bearer ${backendToken}`,
                },
            });
            setRequests(response.data?.agreements || []); // Adjust to 'agreements' from backend response
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

    // --- NEW / MODIFIED HANDLERS FOR APPROVE AND NEGOTIATE ---

    // Navigates to the CreateAgreementPage for approval (pre-fills with requested terms)
    const handleApproveCurrentTerms = (agreement) => {
        navigate(`/agreements/finalize/${agreement._id}`, {
            state: {
                agreementData: {
                    property: agreement.property._id,
                    landlord: agreement.landlord._id,
                    tenant: agreement.tenant._id,
                    // Pre-fill with the tenant's requested terms for final review
                    startDate: agreement.requestedTerms.moveInDate.split('T')[0], // Format date for input
                    rentAmount: agreement.requestedTerms.rent,
                    deposit: agreement.requestedTerms.deposit,
                    leaseTerm: agreement.requestedTerms.leaseTerm,
                    agreementTerms: agreement.agreementTerms, // This is the tenant's initial terms
                    message: agreement.requestMessage,
                },
                isApprovalAction: true, // Flag to indicate this is an approval flow
                existingAgreementId: agreement._id // Pass the existing agreement ID
            }
        });
    };

    // Navigates to the CreateAgreementPage for negotiation (pre-fills with current state)
    const handleNegotiateTerms = (agreement) => {
        // Use the currently displayed terms (which might be final or requested) for pre-filling
        const currentDisplayedTerms = {
            rent: agreement.finalRentAmount || agreement.requestedTerms?.rent,
            deposit: agreement.finalDepositAmount || agreement.requestedTerms?.deposit,
            moveInDate: agreement.finalStartDate || agreement.requestedTerms?.moveInDate,
            leaseTerm: agreement.finalLeaseTermMonths || agreement.requestedTerms?.leaseTerm,
            endDate: agreement.finalEndDate || agreement.requestedTerms?.endDate,
            agreementTerms: agreement.agreementTerms,
            message: agreement.requestMessage
        };

        navigate(`/agreements/finalize/${agreement._id}`, {
            state: {
                agreementData: {
                    property: agreement.property._id,
                    landlord: agreement.landlord._id,
                    tenant: agreement.tenant._id,
                    startDate: currentDisplayedTerms.moveInDate ? new Date(currentDisplayedTerms.moveInDate).toISOString().split('T')[0] : '',
                    rentAmount: currentDisplayedTerms.rent,
                    deposit: currentDisplayedTerms.deposit,
                    leaseTerm: currentDisplayedTerms.leaseTerm,
                    agreementTerms: currentDisplayedTerms.agreementTerms,
                    message: currentDisplayedTerms.message,
                },
                isNegotiationAction: true, // Flag to indicate this is a negotiation flow
                existingAgreementId: agreement._id // Pass the existing agreement ID
            }
        });
    };

    const handleRejectRequest = async (id) => {
        if (!isAuthenticated || !backendToken || user?.role !== 'landlord') {
            toast.error("You are not authorized to perform this action.");
            return;
        }
        if (!window.confirm("Are you sure you want to reject this request? This action cannot be undone.")) {
            return;
        }
        try {
            // Using the existing /agreements/status endpoint for rejection
            await axios.put(
                `${API_URL}/agreements/${id}/status`,
                { status: 'rejected' },
                {
                    headers: {
                        Authorization: `Bearer ${backendToken}`,
                    },
                }
            );
            toast.success("Request rejected successfully!");
            fetchRequests(); // Re-fetch requests to update UI
        } catch (error) {
            console.error("Error rejecting agreement:", error);
            toast.error(error.response?.data?.message || "Failed to reject agreement.");
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
            <div className="text-center p-8 text-gray-700">Loading agreement requests...</div>
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

                    let propertyLocation = 'N/A';
                    if (request.property?.address && typeof request.property.address === 'object') {
                        propertyLocation = [request.property.address.city, request.property.address.state]
                            .filter(Boolean)
                            .join(', ');
                    } else if (request.property?.location) { // Fallback for general location string
                        propertyLocation = request.property.location;
                    } else if (request.property?.city || request.property?.state) { // Fallback if city/state are top-level
                        propertyLocation = [request.property.city, request.property.state]
                            .filter(Boolean)
                            .join(', ');
                    }

                    // Display 'final' terms if available, otherwise 'requested'
                    const displayRent = request.finalRentAmount || request.requestedTerms?.rent;
                    const displayDeposit = request.finalDepositAmount || request.requestedTerms?.deposit;
                    const displayStartDate = request.finalStartDate || request.requestedTerms?.moveInDate;
                    const displayEndDate = request.finalEndDate || request.requestedTerms?.endDate;
                    const displayLeaseTerm = request.finalLeaseTermMonths || request.requestedTerms?.leaseTerm;
                    const displayAgreementTerms = request.agreementTerms; // This holds the latest terms

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
                                    <strong>Current Rent:</strong> ₹{displayRent?.toLocaleString() || 'N/A'}
                                </p>
                                <p className="text-gray-600 mb-1">
                                    <strong>Current Deposit:</strong> ₹{displayDeposit?.toLocaleString() || 'N/A'}
                                </p>
                                <p className="text-gray-600 mb-1">
                                    <strong>Current Start:</strong> {displayStartDate ? new Date(displayStartDate).toLocaleDateString('en-IN') : 'N/A'}
                                </p>
                                <p className="text-gray-600 mb-1">
                                    <strong>Current End:</strong> {displayEndDate ? new Date(displayEndDate).toLocaleDateString('en-IN') : 'N/A'}
                                </p>
                                <p className="text-gray-600 mb-1">
                                    <strong>Current Lease Term:</strong> {displayLeaseTerm} months
                                </p>
                                <p className="text-gray-600 mb-4">
                                    <strong>Current Terms:</strong> {displayAgreementTerms || 'No terms provided.'}
                                </p>

                                {request.status === 'negotiating' && request.lastNegotiatedBy?.toString() !== user._id.toString() && (
                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                        <h4 className="font-semibold text-blue-800">Tenant's Last Message/Counter:</h4>
                                        <p className="text-blue-700 italic">"{request.requestMessage || 'No message provided.'}"</p>
                                    </div>
                                )}
                                {request.requestedTerms && (
                                    <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded">
                                        <h4 className="font-semibold text-gray-800">Tenant's Original Request:</h4>
                                        <p className="text-gray-700">Rent: ₹{request.requestedTerms.rent?.toLocaleString()}</p>
                                        <p className="text-gray-700">Deposit: ₹{request.requestedTerms.deposit?.toLocaleString()}</p>
                                        <p className="text-gray-700">Move-in Date: {new Date(request.requestedTerms.moveInDate).toLocaleDateString('en-IN')}</p>
                                        <p className="text-gray-700">Lease Term: {request.requestedTerms.leaseTerm} months</p>
                                        <p className="text-gray-700">End Date: {new Date(request.requestedTerms.endDate).toLocaleDateString('en-IN')}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 space-y-2">
                                {request.status === 'pending' || request.status === 'negotiating' ? (
                                    <>
                                        <button
                                            onClick={() => handleApproveCurrentTerms(request)} // Changed to navigate
                                            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-200 text-sm"
                                        >
                                            Approve Current Terms
                                        </button>
                                        <button
                                            onClick={() => handleNegotiateTerms(request)} // Changed to navigate
                                            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200 text-sm"
                                        >
                                            Negotiate Terms
                                        </button>
                                        <button
                                            onClick={() => handleRejectRequest(request._id)}
                                            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-200 text-sm"
                                        >
                                            Reject Request
                                        </button>
                                    </>
                                ) : (
                                    <p className={`text-center py-2 rounded-md ${
                                        request.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        Agreement {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </p>
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