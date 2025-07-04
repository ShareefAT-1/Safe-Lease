import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth'; // Ensure this path is correct
import { toast } from 'react-hot-toast';
import ChatComponent from '../ChatComponent'; // Ensure this path is correct
import axiosbase from '../../config/axios-config'; // Ensure this path is correct

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
        const newRentStr = prompt(`Enter new monthly rent (current: ₹${currentTerms.finalRentAmount?.toLocaleString() || 'N/A'}):`);
        const newDepositStr = prompt(`Enter new security deposit (current: ₹${currentTerms.finalDepositAmount?.toLocaleString() || 'N/A'}):`);
        const newStartDateStr = prompt(`Enter new start date (YYYY-MM-DD) (current: ${currentTerms.finalStartDate ? new Date(currentTerms.finalStartDate).toLocaleDateString() : 'N/A'}):`);
        const newLeaseTermStr = prompt(`Enter new lease term in months (current: ${currentTerms.finalLeaseTermMonths || 'N/A'} months):`);
        const newEndDateStr = prompt(`Enter new end date (YYYY-MM-DD) (current: ${currentTerms.finalEndDate ? new Date(currentTerms.finalEndDate).toLocaleDateString() : 'N/A'}):`);
        const newAgreementTerms = prompt(`Enter new general agreement terms (current: "${currentTerms.agreementTerms || ''}"):`);

        if (newRentStr === null || newDepositStr === null || newStartDateStr === null ||
            newLeaseTermStr === null || newEndDateStr === null || newAgreementTerms === null) {
            toast('Negotiation cancelled.', { icon: 'ℹ️' });
            return;
        }

        const newRent = parseFloat(newRentStr);
        const newDeposit = parseFloat(newDepositStr);
        const newLeaseTerm = parseInt(newLeaseTermStr, 10);
        const newStartDate = new Date(newStartDateStr);
        const newEndDate = new Date(newEndDateStr);

        if (isNaN(newRent) || isNaN(newDeposit) || isNaN(newLeaseTerm)) {
            toast.error("Rent, deposit, and lease term must be numbers.");
            return;
        }
        if (newStartDate.toString() === 'Invalid Date' || newEndDate.toString() === 'Invalid Date') {
            toast.error("Invalid start or end date provided.");
            return;
        }
        if (newStartDate >= newEndDate) {
            toast.error("Negotiated End Date must be after Start Date.");
            return;
        }

        const negotiationData = {
            rentAmount: newRent,
            depositAmount: newDeposit,
            startDate: newStartDate.toISOString(),
            endDate: newEndDate.toISOString(),
            leaseTermMonths: newLeaseTerm,
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

                    let propertyLocation = 'N/A';
                    if (request.property?.address && typeof request.property.address === 'object') {
                        propertyLocation = [request.property.address.city, request.property.address.state]
                            .filter(Boolean)
                            .join(', ');
                    } else if (request.property?.location) {
                        propertyLocation = request.property.location;
                    } else if (request.property?.city || request.property?.state) {
                        propertyLocation = [request.property.city, request.property.state]
                            .filter(Boolean)
                            .join(', ');
                    }

                    const displayRent = request.finalRentAmount || request.requestedTerms?.rent;
                    const displayDeposit = request.finalDepositAmount || request.requestedTerms?.deposit;
                    const displayStartDate = request.finalStartDate || request.requestedTerms?.moveInDate;
                    const displayEndDate = request.finalEndDate || request.requestedTerms?.endDate;
                    const displayLeaseTerm = request.finalLeaseTermMonths || request.requestedTerms?.leaseTerm;
                    const displayAgreementTerms = request.agreementTerms;

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
                                    <strong>Current Start:</strong> {displayStartDate ? new Date(displayStartDate).toLocaleDateString() : 'N/A'}
                                </p>
                                <p className="text-gray-600 mb-1">
                                    <strong>Current End:</strong> {displayEndDate ? new Date(displayEndDate).toLocaleDateString() : 'N/A'}
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
                                        <p className="text-gray-700">Move-in Date: {new Date(request.requestedTerms.moveInDate).toLocaleDateString()}</p>
                                        <p className="text-gray-700">Lease Term: {request.requestedTerms.leaseTerm} months</p>
                                        <p className="text-gray-700">End Date: {new Date(request.requestedTerms.endDate).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 space-y-2">
                                {request.status === 'pending' || request.status === 'negotiating' ? (
                                    <>
                                        <button
                                            onClick={() => handleResponse(request._id, 'approved')}
                                            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-200 text-sm"
                                        >
                                            Approve Current Terms
                                        </button>
                                        <button
                                            onClick={() => handleNegotiate(request._id, {
                                                finalRentAmount: displayRent,
                                                finalDepositAmount: displayDeposit,
                                                finalStartDate: displayStartDate,
                                                finalEndDate: displayEndDate,
                                                finalLeaseTermMonths: displayLeaseTerm,
                                                agreementTerms: displayAgreementTerms
                                            })}
                                            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200 text-sm"
                                        >
                                            Negotiate Terms
                                        </button>
                                        <button
                                            onClick={() => handleResponse(request._id, 'rejected')}
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