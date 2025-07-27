// src/pages/TenantSignAgreementPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosbase from '../config/axios-config';
import { useAuth } from '../hooks/useAuth';
import { FaFileUpload, FaSignature, FaSpinner } from 'react-icons/fa';

const TenantSignAgreementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendToken } = useAuth(); // FIX: Removed unused 'user' variable

  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAgreement = async () => {
      if (!id || !backendToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await axiosbase.get(`/api/agreements/${id}`, {
          headers: { Authorization: `Bearer ${backendToken}` },
        });
        setAgreement(res.data.agreement);
      } catch (err) { // FIX: 'err' is now used in the console.error below
        console.error("Error fetching agreement details:", err);
        setError('Failed to fetch agreement details.');
        toast.error('Failed to fetch agreement details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAgreement();
  }, [id, backendToken]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSignatureFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signatureFile) {
      toast.error('Please upload your signature image to proceed.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('signature', signatureFile);

      await axiosbase.put(
        `/api/agreements/tenant-sign/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${backendToken}`,
          },
        }
      );

      toast.success('Agreement signed successfully! Your lease is now active.');
      navigate('/tenant/my-requests');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to sign the agreement.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading agreement...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!agreement) return <div className="p-8 text-center">Agreement not found.</div>;

  const { property, landlord, finalRentAmount, finalDepositAmount, finalStartDate, finalEndDate, finalLeaseTermMonths, agreementTerms, status, tenantSigned } = agreement;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg border">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Review & Sign Your Lease</h2>

        <div className="space-y-4 text-gray-700">
          <p><strong>Property:</strong> {property?.title || 'N/A'}</p>
          <p><strong>Landlord:</strong> {landlord?.name || 'N/A'}</p>
          <p><strong>Monthly Rent:</strong> ₹{finalRentAmount?.toLocaleString()}</p>
          <p><strong>Security Deposit:</strong> ₹{finalDepositAmount?.toLocaleString()}</p>
          <p><strong>Lease Term:</strong> {finalLeaseTermMonths} months</p>
          <p><strong>Start Date:</strong> {new Date(finalStartDate).toLocaleDateString('en-IN')}</p>
          <p><strong>End Date:</strong> {new Date(finalEndDate).toLocaleDateString('en-IN')}</p>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Agreement Terms:</h3>
            <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-md text-sm">{agreementTerms}</pre>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          {status === 'approved' && !tenantSigned && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-2">Upload Your Signature</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <FaFileUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Upload a file</span>
                        <input id="file-upload" name="signature" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    {signatureFile && <p className="text-sm text-gray-500 mt-2">{signatureFile.name}</p>}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
              >
                {submitting ? <FaSpinner className="animate-spin mr-2" /> : <FaSignature className="mr-2" />}
                {submitting ? 'Finalizing...' : 'Sign and Activate Lease'}
              </button>
            </form>
          )}

          {tenantSigned && (
            <div className="text-center p-4 bg-green-100 text-green-800 rounded-md">
              <p className="font-semibold">This agreement has been signed by you and is now active.</p>
            </div>
          )}

          {status !== 'approved' && (
            <div className="text-center p-4 bg-yellow-100 text-yellow-800 rounded-md">
              <p className="font-semibold">This agreement is not yet approved by the landlord. You cannot sign it at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantSignAgreementPage;
