// frontend/src/pages/SingleAgreementView.jsx (or components/Agreement/SingleAgreementView.jsx)
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosbase from '../config/axios-config'; // Make sure this path is correct
import { toast } from 'react-hot-toast'; // --- ADD THIS IMPORT ---
import { FaCalendarAlt, FaDollarSign, FaFileContract, FaInfoCircle, FaUser, FaHome, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Added some icons for better UI

export default function SingleAgreementView() {
  const { id } = useParams(); // This 'id' will be the agreement's _id
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgreementDetails = async () => {
      try {
        if (!id) {
          setError("No agreement ID provided. Cannot load details.");
          setLoading(false);
          return;
        }
        setLoading(true);
        // *** IMPORTANT: Fetch from your agreements API endpoint ***
        const res = await axiosbase.get(`/api/agreements/${id}`); 
        setAgreement(res.data); // Adjust if your backend wraps it in { agreement: ... }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching agreement:", err);
        const errorMessage = err.response?.data?.message || "Oops! Couldn't load agreement details.";
        setError(errorMessage);
        toast.error(errorMessage); // This will now work
        setLoading(false);
      }
    };

    fetchAgreementDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
        <p className="text-lg text-gray-700">Loading agreement details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg shadow-md">
        <FaTimesCircle className="text-5xl mb-4 mx-auto" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Agreement</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="text-center p-8 text-gray-600 bg-gray-50 rounded-lg shadow-md">
        <FaInfoCircle className="text-5xl mb-4 mx-auto" />
        <h2 className="text-2xl font-bold mb-2">Agreement Not Found</h2>
        <p>The agreement you are looking for does not exist.</p>
      </div>
    );
  }

  // Helper to safely get property name/title
  const getPropertyName = (prop) => prop?.title || prop?.propertyName || 'N/A';
  const getUsername = (userObj) => userObj?.username || userObj?.name || 'N/A';

  return (
    <section className="bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4 md:px-8 lg:px-16 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-3xl overflow-hidden p-8 animate-fade-in-up">
        <h1 className="text-4xl font-extrabold text-center text-purple-800 mb-8">Agreement Details</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Property Details */}
          <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center"><FaHome className="mr-3 text-3xl" /> Property</h2>
            <p className="text-lg text-gray-700 mb-2">
              <span className="font-semibold">Name:</span> 
              <Link to={`/property/${agreement.property?._id}`} className="text-blue-600 hover:underline ml-2">
                {getPropertyName(agreement.property)}
              </Link>
            </p>
            <p className="text-lg text-gray-700 mb-2"><span className="font-semibold">Location:</span> {agreement.property?.location || agreement.property?.address?.city || 'N/A'}</p>
            {/* Add more property details if populated */}
          </div>

          {/* Tenant Details */}
          <div className="bg-green-50 p-6 rounded-xl shadow-inner border border-green-200">
            <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center"><FaUser className="mr-3 text-3xl" /> Tenant</h2>
            <p className="text-lg text-gray-700 mb-2"><span className="font-semibold">Name:</span> {getUsername(agreement.tenant)}</p>
            <p className="text-lg text-gray-700 mb-2"><span className="font-semibold">Email:</span> {agreement.tenant?.email || 'N/A'}</p>
          </div>

          {/* Landlord Details */}
          <div className="bg-purple-50 p-6 rounded-xl shadow-inner border border-purple-200">
            <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center"><FaUser className="mr-3 text-3xl" /> Landlord</h2>
            <p className="text-lg text-gray-700 mb-2"><span className="font-semibold">Name:</span> {getUsername(agreement.landlord)}</p>
            <p className="text-lg text-gray-700 mb-2"><span className="font-semibold">Email:</span> {agreement.landlord?.email || 'N/A'}</p>
          </div>

          {/* Agreement Terms */}
          <div className="bg-yellow-50 p-6 rounded-xl shadow-inner border border-yellow-200">
            <h2 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center"><FaFileContract className="mr-3 text-3xl" /> Terms</h2>
            <p className="text-lg text-gray-700 mb-2"><span className="font-semibold">Status:</span> <span className={`font-bold ${agreement.status === 'approved' ? 'text-green-600' : agreement.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}</span></p>
            <p className="text-lg text-gray-700 mb-2"><span className="font-semibold">Rent Amount:</span> <FaDollarSign className="inline-block mr-1" />{agreement.rentAmount?.toLocaleString() || agreement.requestedTerms?.rent?.toLocaleString() || 'N/A'}</p>
            <p className="text-lg text-gray-700 mb-2"><span className="font-semibold">Start Date:</span> <FaCalendarAlt className="inline-block mr-1" />{new Date(agreement.startDate || agreement.requestedTerms?.moveInDate).toLocaleDateString()}</p>
            <p className="text-lg text-gray-700 mb-2"><span className="font-semibold">End Date:</span> <FaCalendarAlt className="inline-block mr-1" />{new Date(agreement.endDate || agreement.requestedTerms?.endDate).toLocaleDateString()}</p>
            <p className="text-lg text-gray-700 mb-2"><span className="font-semibold">Lease Term:</span> {agreement.finalLeaseTermMonths || agreement.requestedTerms?.leaseTerm || 'N/A'} months</p>
            <p className="text-lg text-gray-700 mb-2"><span className="font-semibold">Agreement Terms:</span> {agreement.agreementTerms || 'N/A'}</p>
            <p className="text-lg text-gray-700 mb-2"><span className="font-semibold">Message:</span> {agreement.requestMessage || agreement.message || 'N/A'}</p>
            <p className="text-lg text-gray-700 mb-2"><span className="font-semibold">Landlord Signed:</span> {agreement.landlordSigned ? <FaCheckCircle className="inline-block text-green-500" /> : <FaTimesCircle className="inline-block text-red-500" />}</p>
            <p className="text-lg text-gray-700 mb-2"><span className="font-semibold">Tenant Signed:</span> {agreement.tenantSigned ? <FaCheckCircle className="inline-block text-green-500" /> : <FaTimesCircle className="inline-block text-red-500" />}</p>
            {agreement.pdfPath && (
              <p className="text-lg text-gray-700 mb-2">
                <span className="font-semibold">PDF:</span> 
                <a href={agreement.pdfPath} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline ml-2">
                  View PDF
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
