import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import SearchBox from "./SearchBox";
import toast from "react-hot-toast";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = localStorage.getItem("user_isloggedin");
    const userNameFromStorage = localStorage.getItem("username");
    const profilePicFromStorage = localStorage.getItem("profilePic");

    if (loggedIn === "true") {
      setIsLoggedIn(true);
      setUsername(userNameFromStorage || "User");
      setProfilePic(profilePicFromStorage || null);
    } else {
      setIsLoggedIn(false);
      setUsername("");
      setProfilePic(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_isloggedin");
    localStorage.removeItem("username");
    localStorage.removeItem("profilePic");

    setIsLoggedIn(false);
    setUsername("");
    setProfilePic(null);

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

        {!isLoggedIn ? (
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
            <li className="flex items-center space-x-2 font-semibold text-blue-600">
              {profilePic && (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <span>{username}</span>
            </li>
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
