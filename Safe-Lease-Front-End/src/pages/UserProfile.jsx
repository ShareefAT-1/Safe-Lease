// src/pages/UserProfile.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosbase from "../config/axios-config";

import {
  FaUserCircle,
  FaShieldAlt,
  FaHome,
  FaComments,
  FaCrown,
} from "react-icons/fa";

export default function UserProfile() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const roleStyles = {
    admin: "bg-yellow-600/30 border-yellow-500/40 text-yellow-300",
    landlord: "bg-green-600/20 border-green-500/40 text-green-300",
    tenant: "bg-purple-600/20 border-purple-500/40 text-purple-300",
  };

  const roleLabel = {
    admin: "Administrator",
    landlord: "Landlord",
    tenant: "Tenant",
  };

  const roleIcon = {
    admin: <FaCrown className="text-yellow-400 text-xl" />,
    landlord: <FaHome className="text-green-300 text-xl" />,
    tenant: <FaComments className="text-purple-300 text-xl" />,
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosbase.get(`/api/users/${id}`);
        setUser(res.data);
      } catch (err) {
        console.error("User load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-2xl">
        Loading profile…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-2xl">
        User not found.
      </div>
    );
  }

  const r = user.role;

  return (
    <section className="min-h-screen bg-[#0c1124] pt-20 pb-20 px-6 text-white">
      <div className="max-w-3xl mx-auto p-10 rounded-3xl border border-[#1a233a] bg-[#11172b] shadow-[0_0_40px_rgba(0,255,255,0.08)] relative overflow-hidden">

        {/* Glow gradient behind */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 blur-3xl"></div>

        {/* MAIN CONTENT */}
        <div className="relative z-10">

          {/* HEADER */}
          <div className="flex items-center gap-6">
            {user.profilePic ? (
              <img
                src={user.profilePic}
                alt="profile"
                className="w-20 h-20 rounded-full border-2 border-cyan-400 object-cover shadow-lg"
              />
            ) : (
              <FaUserCircle className="text-7xl text-cyan-400" />
            )}

            <div>
              <h1 className="text-3xl font-bold tracking-wide">
                {user.username || user.name}
              </h1>
              <p className="opacity-80 mt-1">
                {roleLabel[r] || "User"}
              </p>
            </div>
          </div>

          {/* ROLE BADGE */}
          <div
            className={`mt-6 px-5 py-3 rounded-xl border flex items-center gap-3 w-fit shadow-lg ${roleStyles[r]}`}
          >
            {roleIcon[r]}
            <span className="font-semibold">
              {roleLabel[r]}
            </span>
          </div>

          {/* DETAILS */}
          <div className="mt-10 space-y-4 text-lg opacity-90">
            <p>
              <span className="font-semibold text-cyan-300">Email:</span>{" "}
              {user.email}
            </p>

            {r === "landlord" && (
              <p className="flex items-center gap-2 text-green-300">
                <FaHome /> Verified Property Owner
              </p>
            )}

            {r === "tenant" && (
              <p className="flex items-center gap-2 text-purple-300">
                <FaComments /> Active Tenant
              </p>
            )}

            {r === "admin" && (
              <p className="flex items-center gap-2 text-yellow-300">
                <FaCrown /> Platform Administrator
              </p>
            )}
          </div>

          {/* VERIFIED BOX */}
          <div className="mt-8 p-5 bg-[#1b243b] rounded-xl border border-[#243158] shadow-inner">
            <div className="flex items-center gap-3 mb-2">
              <FaShieldAlt className="text-cyan-400 text-xl" />
              <span className="text-lg font-semibold">Verified SafeLease User</span>
            </div>
            <p className="text-slate-400">
              This profile has been authenticated and is trusted within the SafeLease network.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
