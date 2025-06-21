import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth'; // CORRECTED PATH to src/hooks/useAuth.js
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';
import axiosbase from '../config/axios-config'; // Import axiosbase for the base URL

const ChatComponent = ({ recipientId }) => {
    const { user, isAuthenticated, backendToken, loading: authLoading } = useAuth(); 
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef(null); 
    
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // Use baseURL from axiosbase directly, or define if needed for non-axiosbase calls
    // In this component, we only need it for the socket connection.
    const SOCKET_URL = axiosbase.defaults.baseURL; 


    useEffect(() => {
        const currentUserId = user?.id;
        if (currentUserId && recipientId) {
            const sortedIds = [currentUserId, recipientId].sort();
            const generatedChatRoomId = `${sortedIds[0]}_${sortedIds[1]}`;
            setConversationId(generatedChatRoomId);
        } else {
            setConversationId(null);
            console.warn("ChatComponent: Current user ID or recipient ID is missing. Cannot form conversation ID.");
        }
    }, [user, recipientId]);

    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messagesEndRef]);

    useEffect(() => {
        if (authLoading || !isAuthenticated || !backendToken || !conversationId) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setMessages([]);
            return;
        }

        console.log(`ChatComponent: Attempting to connect socket to ${SOCKET_URL}`);
        const newSocket = io(SOCKET_URL, { // Use SOCKET_URL here
            query: { token: backendToken },
            transports: ['websocket'],
        });

        socketRef.current = newSocket;

        newSocket.on('connect', () => {
            console.log('Socket connected successfully!');
            newSocket.emit('joinRoom', { conversationId });
        });

        newSocket.on('authError', (message) => {
            console.error('Socket authentication error:', message);
            toast.error(`Chat error: ${message}`);
            newSocket.disconnect();
        });

        newSocket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
            toast.error('Failed to connect to chat. Please try again.');
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            if (reason === 'io server disconnect') {
                newSocket.connect();
            }
            toast.info('Disconnected from chat.');
        });

        newSocket.on('chatHistory', (history) => {
            setMessages(history);
            console.log(`Received chat history: ${history.length} messages.`);
            scrollToBottom();
        });

        newSocket.on('receiveMessage', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
            scrollToBottom();
        });

        newSocket.on('error', (message) => {
            console.error('Socket error from server:', message);
            toast.error(`Chat Error: ${message}`);
        });

        return () => {
            console.log('Disconnecting socket...');
            if (socketRef.current) {
                socketRef.current.off();
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setMessages([]);
        };
    }, [isAuthenticated, backendToken, conversationId, authLoading, SOCKET_URL, scrollToBottom]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketRef.current || !user?.id || !conversationId) {
            toast.error("Cannot send empty message or chat not ready.");
            return;
        }

        socketRef.current.emit('sendMessage', {
            conversationId,
            content: newMessage.trim(),
            senderId: user.id,
        });
        setNewMessage('');
    };

    const getSenderDisplayName = (messageSender) => {
        if (user && user.id === messageSender._id) {
            return user.username || user.name || 'You';
        } 
        return messageSender.name || messageSender.username || `User ${messageSender._id?.substring(0, 5)}...`;
    };

    if (authLoading) {
        return <div className="p-4 text-center">Loading authentication for chat...</div>;
    }

    if (!isAuthenticated) {
        return <div className="p-4 text-center text-red-500">Please log in to use chat.</div>;
    }
    
    if (!socketRef.current || !conversationId) {
        return <div className="p-4 text-center text-gray-500">Connecting to chat...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 border rounded-lg shadow-md">
            <div className="p-4 border-b bg-blue-600 text-white rounded-t-lg">
                <h2 className="text-xl font-semibold">
                    Chat with {recipientId ? `User ${recipientId.substring(0, 5)}...` : 'Someone'}
                </h2>
            </div>
            <div
                ref={scrollContainerRef}
                className="flex-1 p-4 overflow-y-auto custom-scrollbar"
            >
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={`flex mb-3 ${msg.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                                msg.sender._id === user.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                            <div className="font-semibold text-sm mb-1">
                                {getSenderDisplayName(msg.sender)}
                            </div>
                            <p className="text-sm break-words">{msg.content}</p>
                            {msg.timestamp && (
                                <span className="block text-right text-xs mt-1 opacity-75">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} /> 
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white rounded-b-lg">
                <div className="flex">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-r-lg hover:bg-blue-700 transition duration-200"
                        disabled={!socketRef.current || !newMessage.trim()}
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatComponent;