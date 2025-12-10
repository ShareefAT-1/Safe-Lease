// frontend/src/components/Navbar.jsx

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import SearchBox from "./SearchBox";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth"; 

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md text-gray-700 z-50 sticky top-0 w-full">
      
      {/* Logo */}
      <NavLink to="/" className="text-2xl font-extrabold text-blue-700 hover:text-blue-800 transition duration-300">
        SafeLease
      </NavLink>

      <ul className="flex items-center space-x-6">

        {/* Home */}
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600 transition duration-300"
            }
          >
            Home
          </NavLink>
        </li>

        {/* About */}
        <li>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600 transition duration-300"
            }
          >
            About
          </NavLink>
        </li>

        {/* Properties */}
        <li>
          <NavLink
            to="/properties"
            className={({ isActive }) =>
              isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600 transition duration-300"
            }
          >
            Properties
          </NavLink>
        </li>

        {/* Create property visible only to landlords */}
        {isAuthenticated && user?.role === "landlord" && (
          <li>
            <NavLink
              to="/create-property"
              className={({ isActive }) =>
                isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600 transition duration-300"
              }
            >
              Create Property
            </NavLink>
          </li>
        )}

        {/* Search box */}
        <li>
          <SearchBox />
        </li>

        {/* If NOT authenticated → show Login & Register */}
        {!isAuthenticated ? (
          <>
            <li>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600"
                }
              >
                Login
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600"
                }
              >
                Register
              </NavLink>
            </li>
          </>
        ) : (
          <>
            {/* Logged-in user info */}
            {user && (
              <li className="flex items-center space-x-2 font-semibold text-blue-600">
                {user.profilePic && (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span>{user.username}</span>
              </li>
            )}

            {/* ⭐ MY PROFILE BUTTON (new universal button) */}
            <li>
              <NavLink
                to={`/profile/${user?.id}`}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 shadow"
              >
                My Profile
              </NavLink>
            </li>

            {/* Landlord routes */}
            {user?.role === "landlord" && (
              <>
                <li>
                  <NavLink
                    to="/landlord/requests"
                    className="hover:text-blue-600 transition duration-300"
                  >
                    Requests
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/landlord-chats"
                    className="hover:text-blue-600 transition duration-300"
                  >
                    My Chats
                  </NavLink>
                </li>
              </>
            )}

            {/* Tenant routes */}
            {user?.role === "tenant" && (
              <li>
                <NavLink
                  to="/tenant/my-requests"
                  className="hover:text-blue-600 transition duration-300"
                >
                  My Requests
                </NavLink>
              </li>
            )}

            {/* Logout */}
            <li>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 transition duration-300"
              >
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
