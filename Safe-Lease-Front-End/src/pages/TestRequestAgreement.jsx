import React from 'react'; 
import RequestAgreement from '../components/Agreement/RequestAgreement'; 
import { useAuth } from '../hooks/useAuth'; // Corrected path

const realPropertyId = '666e0a8112d8a571f544622b'; 
const realLandlordId = '666e0a8112d8a571f544622a'; 


const TestRequestAgreement = () => { 
   const { isAuthenticated, user, loading: authLoading } = useAuth(); 

   if (authLoading) {
    return <p className="p-4 text-center">Loading authentication...</p>;
   }

   if (!isAuthenticated || user?.role !== 'tenant') { 
     return (
        <div className="p-4 text-center text-red-500">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p>Please log in as a tenant to test agreement requests.</p>
        </div>
     ); 
   } 

   return ( 
     <div className="p-4 bg-gray-100 min-h-screen flex items-center justify-center"> 
       <div className="w-full max-w-md">
         <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Test Request Agreement</h1> 
         <RequestAgreement 
           propertyId={realPropertyId} 
           landlordId={realLandlordId} 
         /> 
       </div>
     </div> 
   ); 
 }; 

 export default TestRequestAgreement;