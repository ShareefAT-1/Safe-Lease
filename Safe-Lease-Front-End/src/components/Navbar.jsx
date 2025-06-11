import React, { useEffect } from "react"; // Keep useEffect if needed for other things, but auth logic moves
import { NavLink, useNavigate } from "react-router-dom";
import SearchBox from "./SearchBox";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext"; // Import the useAuth hook

export default function Navbar() {
  // Use the auth context to get authentication state and user data
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // No need for local useState for isLoggedIn, username, profilePic or their useEffect
  // because AuthContext manages and provides these reactive states.
  // The console.log("gh") and console.log(isLoggedIn) inside the component will now reflect
  // the reactive state from the context.

  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white shadow">
      <div className="text-2xl font-bold text-blue-600">SafeLease</div>

      <ul className="flex items-center space-x-6 text-gray-700 font-medium">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "hover:text-blue-600 transition duration-300"
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
          <SearchBox />
        </li>

        {/* Conditional rendering based on isAuthenticated from context */}
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
            {/* Display profile pic and username if user object exists */}
            {user && (
              <li className="flex items-center space-x-2 font-semibold text-blue-600">
                {user.profilePic && (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover" // Ensure consistent sizing
                  />
                )}
                <span>{user.username}</span> {/* Use user.username from context */}
              </li>
            )}
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