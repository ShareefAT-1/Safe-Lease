// Safe-Lease/frontend/src/components/ChatComponent.jsx
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-hot-toast'; // For notifications

const SOCKET_SERVER_URL = 'http://localhost:4000'; // Your backend Socket.IO URL

const ChatComponent = ({ conversationId, currentUserId }) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    // Effect for Socket.IO connection and event listeners
    useEffect(() => {
        const token = localStorage.getItem('token'); 
        if (!token) {
            toast.error("You must be logged in to chat.");
            return;
        }

        // Initialize Socket.IO client with JWT token
        const newSocket = io(SOCKET_SERVER_URL, {
            query: { token: token }, // Pass JWT token for authentication on connection
            // extraHeaders: { "ngrok-skip-browser-warning": "69420" } // Uncomment if using ngrok
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to chat server!');
            newSocket.emit('joinRoom', { conversationId }); // Join the specific chat room
        });

        newSocket.on('chatHistory', (history) => {
            setMessages(history); // Set initial chat history
        });

        newSocket.on('receiveMessage', (message) => {
            // Only add message if it belongs to the currently active conversation
            if (message.conversationId === conversationId) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }
        });

        newSocket.on('authError', (errorMessage) => {
            toast.error(`Chat authentication error: ${errorMessage}`);
            console.error('Chat authentication error:', errorMessage);
            newSocket.disconnect(); // Disconnect on auth error
        });

        newSocket.on('error', (errorMessage) => {
            toast.error(`Chat error: ${errorMessage}`);
            console.error('Chat error:', errorMessage);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from chat server');
            // toast.info('Disconnected from chat.'); // Optional: inform user
        });

        // Cleanup function: disconnect socket when component unmounts
        return () => {
            newSocket.disconnect();
        };
    }, [conversationId]); // Reconnect if conversationId changes

    // Effect to scroll to the bottom of the chat on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim() && socket && conversationId) {
            socket.emit('sendMessage', { conversationId, content: input.trim() });
            setInput(''); // Clear input field
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow-md border border-gray-200">
            <div className="p-4 bg-blue-600 text-white rounded-t-lg">
                <h3 className="text-lg font-semibold">Property Chat</h3> {/* Dynamic title can be added if property name is passed */}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                    <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
                )}
                {messages.map((msg, index) => (
                    <div
                        key={msg._id || index} // Use _id if available, fallback to index
                        className={`flex ${msg.sender._id === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`rounded-lg p-3 max-w-[70%] ${
                                msg.sender._id === currentUserId
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-300 text-gray-800'
                            }`}
                        >
                            <span className="font-semibold text-sm">
                                {msg.sender._id === currentUserId ? 'You' : msg.sender.username}
                            </span>
                            <p className="text-sm break-words mt-1">{msg.content}</p>
                            <span className="block text-xs text-right opacity-80 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t bg-white flex space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!socket || !currentUserId} // Disable if not connected or not logged in
                />
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out"
                    disabled={!socket || !currentUserId || input.trim() === ''} // Disable if no socket/user or empty input
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatComponent;