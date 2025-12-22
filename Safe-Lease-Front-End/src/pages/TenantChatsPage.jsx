import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";
import ChatComponent from "../components/ChatComponent";
import axiosbase from "../config/axios-config";

const TenantChatsPage = () => {
  const { user, isAuthenticated, backendToken, loading: authLoading } = useAuth();

  const [landlordsWithRequests, setLandlordsWithRequests] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [error, setError] = useState(null);
  const [showChatFor, setShowChatFor] = useState(null);

  const API_URL = axiosbase.defaults.baseURL;

  const fetchLandlordChats = useCallback(async () => {
    if (authLoading || !isAuthenticated || !backendToken || user?.role !== "tenant") {
      setLoadingConversations(false);
      setError("You must be logged in as a tenant to view chats.");
      return;
    }

    try {
      const res = await axios.get(
        `${API_URL}/api/agreements/tenant-requests`,
        {
          headers: {
            Authorization: `Bearer ${backendToken}`,
          },
        }
      );

      const uniqueLandlords = {};

      res.data.requests.forEach((req) => {
        if (req.landlord && !uniqueLandlords[req.landlord._id]) {
          uniqueLandlords[req.landlord._id] = {
            _id: req.landlord._id,
            name: req.landlord.name || "Landlord",
            lastMessage: req.requestMessage,
            lastDate: req.createdAt,
          };
        }
      });

      const sorted = Object.values(uniqueLandlords).sort(
        (a, b) => new Date(b.lastDate) - new Date(a.lastDate)
      );

      setLandlordsWithRequests(sorted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load landlord chats");
      setError("Failed to load landlord chats");
    } finally {
      setLoadingConversations(false);
    }
  }, [authLoading, isAuthenticated, backendToken, user, API_URL]);

  useEffect(() => {
    fetchLandlordChats();
  }, [fetchLandlordChats]);

  if (authLoading || loadingConversations) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1224] text-white">
        Loading tenant chats...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1224] text-red-400">
        {error}
      </div>
    );
  }

  if (!landlordsWithRequests.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1224] text-slate-400">
        No landlords to chat with yet.
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#0d1224] pt-20 pb-24 px-6">
      <div className="max-w-4xl mx-auto bg-[#0c1322] border border-white/6 rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-extrabold text-white mb-6 text-center">
          Your Chats
        </h1>

        <div className="space-y-4">
          {landlordsWithRequests.map((landlord) => (
            <div
              key={landlord._id}
              onClick={() =>
                setShowChatFor({
                  recipientId: landlord._id,
                  recipientName: landlord.name,
                })
              }
              className="bg-[#0d1728] border border-white/6 p-5 rounded-xl cursor-pointer hover:border-cyan-400/40 transition flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {landlord.name}
                </h3>
                <p className="text-sm text-slate-400 truncate">
                  {landlord.lastMessage || "No message"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(landlord.lastDate).toLocaleDateString()}
                </p>
              </div>

              <div className="text-cyan-400 text-2xl">💬</div>
            </div>
          ))}
        </div>
      </div>

      {showChatFor && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0c1322] w-full max-w-2xl h-[75vh] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0d1728]">
              <h3 className="text-white font-semibold">
                Chat with {showChatFor.recipientName}
              </h3>
              <button
                onClick={() => setShowChatFor(null)}
                className="text-white text-xl hover:text-red-400"
              >
                ✕
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

export default TenantChatsPage;
