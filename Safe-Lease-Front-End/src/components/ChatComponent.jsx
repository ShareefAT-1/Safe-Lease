// src/components/ChatComponent.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";
import io from "socket.io-client";
import axiosbase from "../config/axios-config";

const ChatComponent = ({ recipientId, embedMode = true }) => {
  const { user, isAuthenticated, backendToken, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const socketRef = useRef(null);
  const [conversationId, setConversationId] = useState(null);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Ensure proper socket URL format
  const SOCKET_URL = (axiosbase?.defaults?.baseURL || "").replace(/\/$/, "");

  // Build conversation ID based on sorted IDs
  useEffect(() => {
    if (user?.id && recipientId) {
      const sorted = [user.id, recipientId].sort();
      setConversationId(`${sorted[0]}_${sorted[1]}`);
    } else {
      setConversationId(null);
    }
  }, [user, recipientId]);

  // Smooth scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Socket connection handler
  useEffect(() => {
    if (!isAuthenticated || authLoading || !backendToken || !conversationId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setMessages([]);
      return;
    }

    try {
      const socket = io(SOCKET_URL, {
        transports: ["websocket"],
        query: { token: backendToken },
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("joinRoom", { conversationId });
      });

      socket.on("authError", (msg) => {
        toast.error(msg);
        socket.disconnect();
      });

      socket.on("connect_error", () => {
        toast.error("Chat connection failed");
      });

      socket.on("chatHistory", (history = []) => {
        setMessages(history);
        setTimeout(scrollToBottom, 50);
      });

      socket.on("receiveMessage", (message) => {
        setMessages((prev) => [...prev, message]);
        setTimeout(scrollToBottom, 50);
      });

      socket.on("error", () => toast.error("Chat error occurred"));
    } catch (err) {
      console.error("[chat init error]", err);
      toast.error("Chat failed to initialize");
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setMessages([]);
    };
  }, [isAuthenticated, backendToken, conversationId, authLoading, SOCKET_URL, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // SEND MESSAGE — NO LOCAL MESSAGE INSERTION
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    if (!socketRef.current || !conversationId || !user?.id) {
      toast.error("Chat not ready.");
      return;
    }

    socketRef.current.emit("sendMessage", {
      conversationId,
      content: newMessage.trim(),
      senderId: user.id,
    });

    setNewMessage(""); // No optimistic UI — server will echo back
  };

  // Format sender name
  const getSenderDisplayName = (sender) => {
    if (!sender) return "Unknown";
    if (user && user.id === sender._id) return user.username || "You";
    return sender.name || sender.username || `User ${String(sender._id).slice(0, 6)}`;
  };

  // Guards
  if (authLoading) return <div className="p-4 text-center text-white">Loading chat...</div>;
  if (!isAuthenticated) return <div className="p-4 text-center text-red-400">Log in to chat.</div>;
  if (!conversationId) return <div className="p-4 text-center text-gray-400">Preparing chat…</div>;
  if (!socketRef.current) return <div className="p-4 text-center text-gray-400">Connecting…</div>;

  return (
    <div className={`flex flex-col h-full ${embedMode ? "" : "min-h-[400px]"}`}>
      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-6">No messages yet — say hi 👋</div>
        )}

        {messages.map((msg) => {
          const mine = msg.sender?._id === user.id;

          return (
            <div key={msg._id || Math.random()} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] p-3 rounded-lg shadow 
                  ${mine ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}`}
              >
                <div className="text-xs font-semibold mb-1">
                  {getSenderDisplayName(msg.sender)}
                </div>

                <div className="text-sm break-words">{msg.content}</div>

                {msg.timestamp && (
                  <div className="text-right text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      <form onSubmit={handleSendMessage} className="p-3 border-t bg-transparent">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-5 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
