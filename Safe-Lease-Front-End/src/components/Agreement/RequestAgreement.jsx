import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import axiosbase from '../../config/axios-config';

const RequestAgreement = ({ propertyId, landlordId }) => {
  const [message, setMessage] = useState('');
  const [agreementTerms, setAgreementTerms] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaseTermMonths, setLeaseTermMonths] = useState('');

  const API_URL = axiosbase.defaults.baseURL;

  const handleRequest = async () => {
    if (!agreementTerms || !rentAmount || !depositAmount || !startDate || !endDate || !leaseTermMonths) {
      toast.error('Please fill in all required agreement details.');
      return;
    }
    if (isNaN(parseFloat(rentAmount)) || isNaN(parseFloat(depositAmount)) || isNaN(parseInt(leaseTermMonths))) {
      toast.error('Rent, deposit, and lease term must be valid numbers.');
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
        toast.error('End Date must be after Start Date.');
        return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
          toast.error("You must be logged in to send a request.");
          return;
      }

      const res = await axios.post(`${API_URL}/agreements/request`, {
        property: propertyId,
        landlord: landlordId,
        rentAmount: Number(rentAmount),
        depositAmount: Number(depositAmount),
        startDate: startDate,
        endDate: endDate,
        leaseTermMonths: Number(leaseTermMonths),
        agreementTerms: agreementTerms,
        message: message,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(res.data.message);

      setMessage('');
      setAgreementTerms('');
      setRentAmount('');
      setDepositAmount('');
      setStartDate('');
      setEndDate('');
      setLeaseTermMonths('');

    } catch (err) {
      console.error('Request Agreement failed:', err.response?.data || err.message || err);
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <div className="p-4 border rounded space-y-3 bg-white shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">Send New Lease Request</h2>

      <textarea
        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        rows={3}
        value={agreementTerms}
        onChange={(e) => setAgreementTerms(e.target.value)}
        placeholder="Specific Agreement Terms (e.g., 'No pets allowed', 'Tenant responsible for utilities')"
        required
      />

      <input
        type="number"
        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        value={rentAmount}
        onChange={(e) => setRentAmount(e.target.value)}
        placeholder="Monthly Rent Amount (required)"
        required
      />

      <input
        type="number"
        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        value={depositAmount}
        onChange={(e) => setDepositAmount(e.target.value)}
        placeholder="Security Deposit Amount (required)"
        required
      />

      <input
        type="number"
        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        value={leaseTermMonths}
        onChange={(e) => setLeaseTermMonths(e.target.value)}
        placeholder="Lease Term in Months (e.g., 12, 6)"
        required
      />

      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mt-2">Start Date:</label>
      <input
        type="date"
        id="startDate"
        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        required
      />

      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mt-2">End Date:</label>
      <input
        type="date"
        id="endDate"
        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        required
      />

      <textarea
        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        rows={2}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Optional message to landlord..."
      />

      <button
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
        onClick={handleRequest}
      >
        Send Lease Request
      </button>
    </div>
  );
}

export default RequestAgreement;