import React, { useState, useEffect, useCallback } from 'react'; 
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import ChatComponent from '../components/ChatComponent';
import axiosbase from '../config/axios-config'; 

const LandlordChatsPage = () => {
    const { user, isAuthenticated, backendToken, loading: authLoading } = useAuth();
    const [tenantsWithRequests, setTenantsWithRequests] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [error, setError] = useState(null);
    const [showChatFor, setShowChatFor] = useState(null); 

    const API_URL = axiosbase.defaults.baseURL; 

    const fetchTenantsWithRequests = useCallback(async () => { 
        if (authLoading || !isAuthenticated || !backendToken || user?.role !== 'landlord') {
            setLoadingConversations(false);
            if (!isAuthenticated || user?.role !== 'landlord') {
                setError("You must be logged in as a landlord to view chats.");
            }
            return;
        }
        setLoadingConversations(true);
        try {
            const response = await axios.get(`${API_URL}/agreements/requests`, {
                headers: { Authorization: `Bearer ${backendToken}` }
            });

            const uniqueTenants = {};
            response.data.requests.forEach(req => {
                if (req.tenant && !uniqueTenants[req.tenant._id]) {
                    uniqueTenants[req.tenant._id] = {
                        _id: req.tenant._id,
                        name: req.tenant.name || `User ${req.tenant._id.substring(0, 5)}`,
                        lastRequestMessage: req.message,
                        lastRequestDate: req.createdAt
                    };
                }
            });
            const sortedTenants = Object.values(uniqueTenants).sort((a,b) => new Date(b.lastRequestDate) - new Date(a.lastRequestDate));
            
            setTenantsWithRequests(sortedTenants);
            setLoadingConversations(false);
        } catch (err) {
            console.error("Error fetching tenants for chats:", err);
            toast.error("Failed to load tenant chats.");
            setError("Failed to load tenant chats.");
            setLoadingConversations(false);
        }
    }, [authLoading, isAuthenticated, backendToken, user, API_URL]); 

    useEffect(() => {
        fetchTenantsWithRequests(); 
    }, [fetchTenantsWithRequests]); 


    const openChatModal = (tenantId, tenantName) => {
        setShowChatFor({ recipientId: tenantId, recipientName: tenantName });
    };

    const closeChatModal = () => {
        setShowChatFor(null);
    };

    if (authLoading || loadingConversations) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
                <p className="text-lg text-gray-700">Loading landlord chat interface...</p>
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-8 text-red-600">{error}</div>;
    }

    if (!tenantsWithRequests.length) {
        return <div className="text-center p-8 text-gray-600">No tenants have sent you agreement requests yet to chat with.</div>;
    }

    return (
        <section className="bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4 md:px-8 lg:px-16 min-h-screen font-sans">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-3xl overflow-hidden p-8">
                <h1 className="text-4xl font-extrabold text-center text-purple-800 mb-8">Your Tenant Chats</h1>

                <div className="space-y-4">
                    {tenantsWithRequests.map((tenant) => (
                        <div
                            key={tenant._id}
                            className="bg-purple-50 p-6 rounded-xl shadow-md border border-purple-200 flex items-center justify-between cursor-pointer transition-all duration-200 hover:bg-purple-100 hover:shadow-lg"
                            onClick={() => openChatModal(tenant._id, tenant.name)}
                        >
                            <div>
                                <h3 className="text-xl font-semibold text-purple-800">
                                    Chat with: {tenant.name}
                                </h3>
                                <p className="text-gray-700 text-sm mt-1 truncate">
                                    Last Request: {tenant.lastRequestMessage || 'No message.'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Requested on: {new Date(tenant.lastRequestDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-purple-600 text-3xl">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                    <path fillRule="evenodd" d="M4.848 9.045a.75.75 0 0 1 .643.082L10.5 12l-5.009 2.873a.75.75 0 0 1-.643.082A.75.75 0 0 1 4.5 14.25V9.75a.75.75 0 0 1 .348-.705ZM12.75 6a.75.75 0 0 0-1.5 0v5.25c0 .093.026.183.076.26L14.7 15.36a.75.75 0 0 0 1.058.077.75.75 0 0 0 .077-1.058l-2.47-3.714V6ZM18.75 9a.75.75 0 0 0-1.5 0v5.25c0 .093.026.183.076.26L20.7 18.36a.75.75 0 0 0 1.058.077.75.75 0 0 0 .077-1.058l-2.47-3.714V9Z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
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
        </section>
    );
};

export default LandlordChatsPage;