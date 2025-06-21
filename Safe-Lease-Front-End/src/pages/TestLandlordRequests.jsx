import React from 'react'; 
import LandlordRequests from '../components/Agreement/LandlordRequests'; 
import { useAuth } from '../hooks/useAuth'; // Corrected path

const TestLandlordRequests = () => { 
    const { isAuthenticated, user, loading: authLoading } = useAuth(); 

    if (authLoading) {
        return <p className="p-4 text-center">Loading authentication...</p>;
    }

    if (!isAuthenticated || user?.role !== 'landlord') { 
        return (
            <div className="p-4 text-center text-red-500">
                <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                <p>Please log in as a landlord to view requests.</p>
            </div>
        );
    }

   return ( 
     <div className="p-4 bg-gray-100 min-h-screen"> 
       <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Test Landlord Requests</h1> 
       <LandlordRequests /> 
     </div> 
   ); 
 }; 

 export default TestLandlordRequests;