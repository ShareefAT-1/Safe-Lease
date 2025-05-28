import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosbase from "../config/axios-config";
import { toast } from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields!");
      return;
    }

    try {
      const response = await axiosbase.post("/auth/login", formData);
      const { token, user } = response.data;

      localStorage.setItem("user_access_token", token);
      localStorage.setItem("user_id", user._id);
      localStorage.setItem("user_isloggedin", "true");
      localStorage.setItem("username", user.name);
      localStorage.setItem("profilePic", user.profilePic || ""); 

      toast.success("Login Successful!");
      navigate("/");

      setFormData({ email: "", password: "" });
    } catch (error) {
      const msg = error.response?.data?.message || "Login Failed!";
      toast.error(msg);
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900">
      <div className="bg-gray-900 bg-opacity-60 backdrop-blur-md p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold text-center text-gray-300 mb-4">Login to Your Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-lg shadow-purple-600/20"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-lg shadow-purple-600/20"
              placeholder="Password"
            />
          </div>
          <div className="flex justify-between items-center">
            <a href="/forgot-password" className="text-purple-400 font-medium hover:underline">Forgot Password?</a>
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300 shadow-md shadow-purple-500/40 hover:shadow-purple-500/80"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-400 mt-4 text-sm">
          Don't have an account?
          <a href="/register" className="text-purple-400 font-medium hover:underline ml-3">Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
