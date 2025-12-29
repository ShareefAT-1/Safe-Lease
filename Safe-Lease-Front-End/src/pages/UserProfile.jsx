import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosbase from "../config/axios-config";
import { FaUserCircle, FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";
import RoleBadge from "../components/RoleBadge";
import EditProfileModal from "../components/EditProfileModal";
import { useAuth } from "../hooks/useAuth";
import { getImageUrl } from "../utils/getImageUrl";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me, isAuthenticated } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingOpen, setEditingOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosbase.get(`/api/users/${id}`);
        setUser(res.data);
      } catch (err) {
        console.error("Error loading user profile:", err);
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleUpdateLocal = (updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
    toast.success("Profile updated");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1224] text-white">
      Loading profile...
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1224] text-white">
      User not found.
    </div>
  );

  const isMyProfile = isAuthenticated && me?.id === user?._id;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1224] text-white">
        User not found.
      </div>
    );
  }


  return (
    <section className="min-h-screen bg-[#0d1224] pt-16 pb-24 px-6">
      <div className="max-w-4xl mx-auto relative">
        {/* Glass Card */}
        <div className="bg-gradient-to-tr from-white/4 to-white/2 border border-white/6 backdrop-blur-md rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <div className="flex gap-6 items-center">
            {/* Avatar ring + image */}
            <div className="relative">
              <div className="w-36 h-36 rounded-full p-1"
                style={{
                  boxShadow: "0 0 24px rgba(62,231,255,0.12), 0 0 48px rgba(155,92,255,0.06)",
                  background: "linear-gradient(135deg, rgba(62,231,255,0.06), rgba(155,92,255,0.04))"
                }}>
                {user.profilePic ? (
                  // avatar
                  <img
                    src={getImageUrl(user.profilePic)}
                    alt={user.name || user.username}
                    className="w-full h-full rounded-full object-cover border-2 border-white/10"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x300/111827/FFFFFF?text=No+Img"; }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-b from-[#081225] to-[#081018] text-cyan-300">
                    <FaUserCircle className="text-6xl opacity-80" />
                  </div>
                )}
              </div>

              {/* glow ring */}
              <div className="absolute -inset-1 rounded-full pointer-events-none"
                style={{
                  boxShadow: user.role === "admin" ? "0 0 30px rgba(255,223,89,0.28)" : user.role === "landlord" ? "0 0 30px rgba(62,231,255,0.18)" : "0 0 30px rgba(155,92,255,0.18)"
                }} />
            </div>

            {/* Name & meta */}
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-extrabold text-white">{user.name || user.username}</h1>

                <div className="ml-2">
                  <RoleBadge role={user.role} />
                </div>

                {isMyProfile && (
                  <button
                    onClick={() => setEditingOpen(true)}
                    className="ml-auto inline-flex items-center gap-2 bg-white/6 px-3 py-2 rounded-lg hover:bg-white/8 transition"
                  >
                    <FaEdit />
                    <span className="text-sm">Edit profile</span>
                  </button>
                )}
              </div>

              <p className="text-slate-300 mt-2">{user.bio || "No bio yet. Add a little story!"}</p>

              <div className="mt-4 flex gap-3">
                <div className="text-sm text-slate-400">
                  <div><strong className="text-white mr-2">Email:</strong> {user.email}</div>
                </div>
                <div className="text-sm text-slate-400">
                  <div><strong className="text-white mr-2">Since:</strong> {new Date(user.createdAt || user._createdAt || Date.now()).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    if (isMyProfile) {
                      navigate("/my-properties");
                    } else {
                      navigate(`/landlord/${user._id}/properties`);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition"
                >
                  View Listings
                </button>





                <button
                  onClick={() => {
                    if (me?.role === "landlord") {
                      navigate(`/landlord-chats?with=${user._id}`);
                    } else {
                      navigate(`/tenant-chats?with=${user._id}`);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-white/6 hover:bg-white/8 transition"
                >
                  Open Chat Inbox
                </button>

              </div>

            </div>
          </div>

          {/* extra card */}
          <div className="mt-8 p-6 rounded-2xl bg-[#071028]/60 border border-white/6">
            <h3 className="text-lg font-semibold text-cyan-200">Account details</h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-[#0d1728] rounded-lg">
                <div className="text-xs text-slate-400 uppercase">Role</div>
                <div className="text-white font-semibold mt-1">{user.role}</div>
              </div>
              <div className="p-3 bg-[#0d1728] rounded-lg">
                <div className="text-xs text-slate-400 uppercase">Verified</div>
                <div className="text-white font-semibold mt-1">{user.verified ? "Yes" : "No"}</div>
              </div>
              <div className="p-3 bg-[#0d1728] rounded-lg">
                <div className="text-xs text-slate-400 uppercase">Properties</div>
                <div className="text-white font-semibold mt-1">{user.propertyCount ?? "—"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditingOpen(false)}
          onSaved={handleUpdateLocal}
        />
      )}
    </section>
  );
};

export default UserProfile;
