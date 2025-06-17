import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import SearchBox from "./SearchBox"; // Keep in mind this component's internal styling might still be dark
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

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
      {/* Navbar Background: Changed to white to match the lighter theme of your original Home */}
      {/* Shadow: Adjusted to md for a subtle lift on a light background */}
      {/* Default Text: Set to gray-700 for good contrast on white */}

      <div className="text-2xl font-bold text-blue-600">SafeLease</div> {/* Logo color kept as original blue-600 */}

      <ul className="flex items-center space-x-6">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold" // Active link color consistent with original Home's blues
                : "hover:text-blue-600 transition duration-300" // Hover link color consistent
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "hover:text-blue-600 transition duration-300"
            }
          >
            About
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/properties"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "hover:text-blue-600 transition duration-300"
            }
          >
            Properties
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/create-property"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "hover:text-blue-600 transition duration-300"
            }
          >
            Create Property
          </NavLink>
        </li>

        <li>
          <SearchBox /> {/* IMPORTANT: If your SearchBox component is still styled with a dark background (as per our last interaction), it will look out of place here. Its styling needs to be adjusted internally to also be light to match this Navbar. */}
        </li>

        {!isAuthenticated ? (
          <>
            <li>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "hover:text-blue-600 transition duration-300"
                }
              >
                Login
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "hover:text-blue-600 transition duration-300"
                }
              >
                Register
              </NavLink>
            </li>
          </>
        ) : (
          <>
            {user && (
              <li className="flex items-center space-x-2 font-semibold text-blue-600"> {/* Username color kept as original blue-600 */}
                {user.profilePic && (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover" // Removed the blue border added for the dark theme
                  />
                )}
                <span>{user.username}</span>
              </li>
            )}
            <li>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 transition duration-300" // Logout button colors kept as original
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