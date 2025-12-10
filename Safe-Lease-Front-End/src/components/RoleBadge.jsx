// src/components/RoleBadge.jsx
import React from "react";

/**
 * RoleBadge: small capsule showing user role with color + glow
 * Supports: tenant, landlord, admin, moderator (fallback)
 */
const RoleBadge = ({ role }) => {
  const r = (role || "").toLowerCase();
  let label = role || "user";
  let style = {
    background: "linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))",
    color: "#fff",
    boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.04)"
  };

  if (r === "tenant") {
    style = {
      ...style,
      background: "linear-gradient(90deg,#7c3aed22,#7c3aed11)",
      boxShadow: "0 6px 30px rgba(155,92,255,0.12)",
      color: "#EDE7FF"
    };
    label = "Tenant";
  } else if (r === "landlord") {
    style = {
      ...style,
      background: "linear-gradient(90deg,#06b6d422,#06b6d411)",
      boxShadow: "0 6px 30px rgba(6,182,212,0.12)",
      color: "#E6FFFF"
    };
    label = "Landlord";
  } else if (r === "admin") {
    style = {
      ...style,
      background: "linear-gradient(90deg,#ffdf5922,#ffdf5911)",
      boxShadow: "0 6px 30px rgba(255,223,89,0.15)",
      color: "#FFF7DE"
    };
    label = "Admin";
  }

  return (
    <span style={style} className="px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-2">
      {r === "admin" ? "⭐" : r === "landlord" ? "🏠" : "💬"} {label}
    </span>
  );
};

export default RoleBadge;
