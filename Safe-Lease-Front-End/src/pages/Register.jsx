import { useState } from "react";
import axiosbase from "../config/axios-config";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom"; 
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    phone: "",
    profilePic: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, role, phone } = formData;
    if (!name || !email || !password || !role || !phone) {
      toast.error("Please fill in all required fields!");
      return;
    }

    if (phone.length < 5) {
        toast.error("Please enter a valid phone number.");
        return;
    }

    try {
      const res = await axiosbase.post("/api/auth/register", formData);
      const { token, user } = res.data;

      login(token, user); 

      toast.success("Registration Successful!");
      navigate("/"); 
      
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message || error);
      const msg = error.response?.data?.message || "Registration Failed!";
      toast.error(msg);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900">
      <div className="bg-gray-900 bg-opacity-60 backdrop-blur-md p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold text-center text-gray-300 mb-4">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your name"
              className="w-full mt-1 p-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-lg shadow-blue-600/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="w-full mt-1 p-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-lg shadow-blue-600/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Password"
              className="w-full mt-1 p-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-lg shadow-blue-600/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-lg shadow-blue-600/20"
            >
              <option value="">Select your role</option>
              <option value="landlord">Landlord</option>
              <option value="tenant">Tenant</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
              className="w-full mt-1 p-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-lg shadow-blue-600/20"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md shadow-blue-500/40 hover:shadow-blue-500/80"
          >
            Register
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;