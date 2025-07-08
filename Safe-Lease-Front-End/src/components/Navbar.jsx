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
      <div className="text-2xl font-bold text-blue-600">SafeLease</div>

      <ul className="flex items-center space-x-6">
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

        {isAuthenticated && user?.role === 'landlord' && (
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
        )}

        <li>
          <SearchBox />
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

            {user?.role === 'landlord' && (
              <>
                <li>
                  <NavLink to="/landlord/requests" className="hover:text-blue-600 transition duration-300">
                    Requests
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/landlord-chats" className="hover:text-blue-600 transition duration-300">
                    My Chats
                  </NavLink>
                </li>
              </>
            )}
            {user?.role === 'tenant' && (
              <li>
                <NavLink to="/test/request-agreement" className="hover:text-blue-600 transition duration-300">
                  Request Form
                </NavLink>
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