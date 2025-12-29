import React, { useState } from 'react';
import axios from 'axios';

const PropertyForm = () => {
    const [propertyData, setPropertyData] = useState({
        title: '',
        description: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        price: '',
        propertyType: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        available: true,
        listingType: '',
    });

    const [images, setImages] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPropertyData({ ...propertyData, [name]: value });
    };

    const handleImageChange = (e) => {
        setImages(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", propertyData.title);
        formData.append("description", propertyData.description);
        formData.append("address", propertyData.address);
        formData.append("city", propertyData.city);
        formData.append("state", propertyData.state);
        formData.append("zipCode", propertyData.zipCode);
        formData.append("price", propertyData.price);
        formData.append("propertyType", propertyData.propertyType);
        formData.append("bedrooms", propertyData.bedrooms);
        formData.append("bathrooms", propertyData.bathrooms);
        formData.append("area", propertyData.area);
        formData.append("available", propertyData.available);
        formData.append("listingType", propertyData.listingType);

        if (images.length > 0) {
            images.forEach((img) => {
                formData.append("images", img);
            });
        }


        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            axios.post("http://localhost:4000/api/properties", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });


            setMessage("Property created successfully");
            setLoading(false);
        } catch (err) {
            setLoading(false);
            setMessage("Error creating property");
            console.error(err);
        }
    };
    ;

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Create a New Property</h2>
            {message && (
                <p className={`text-center text-sm font-semibold ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {message}
                </p>
            )}
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                        type="text"
                        name="title"
                        value={propertyData.title}
                        onChange={handleChange}
                        placeholder="Title"
                        required
                        className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="text"
                        name="description"
                        value={propertyData.description}
                        onChange={handleChange}
                        placeholder="Description"
                        required
                        className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                        type="text"
                        name="address"
                        value={propertyData.address}
                        onChange={handleChange}
                        placeholder="Address"
                        required
                        className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="text"
                        name="city"
                        value={propertyData.city}
                        onChange={handleChange}
                        placeholder="City"
                        required
                        className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                        type="text"
                        name="state"
                        value={propertyData.state}
                        onChange={handleChange}
                        placeholder="State"
                        required
                        className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="text"
                        name="zipCode"
                        value={propertyData.zipCode}
                        onChange={handleChange}
                        placeholder="Zip Code"
                        required
                        className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                        type="number"
                        name="price"
                        value={propertyData.price}
                        onChange={handleChange}
                        placeholder="Price"
                        required
                        className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <select
                        name="propertyType"
                        value={propertyData.propertyType}
                        onChange={handleChange}
                        required
                        className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">Select Property Type</option>
                        <option value="Apartment">Apartment</option>
                        <option value="House">House</option>
                        <option value="Studio">Studio</option>
                        <option value="Condo">Condo</option>
                        <option value="Villa">Villa</option>
                        <option value="Penthouse">Penthouse</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                        type="number"
                        name="bedrooms"
                        value={propertyData.bedrooms}
                        onChange={handleChange}
                        placeholder="Bedrooms"
                        required
                        className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="number"
                        name="bathrooms"
                        value={propertyData.bathrooms}
                        onChange={handleChange}
                        placeholder="Bathrooms"
                        required
                        className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <input
                    type="number"
                    name="area"
                    value={propertyData.area}
                    onChange={handleChange}
                    placeholder="Area (in sq. ft)"
                    required
                    className="w-full p-4 mb-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="flex items-center mb-6">
                    <input
                        type="checkbox"
                        name="available"
                        checked={propertyData.available}
                        onChange={() =>
                            setPropertyData({ ...propertyData, available: !propertyData.available })
                        }
                        className="mr-2 rounded border-gray-300 focus:ring-green-500"
                    />
                    <span>Available</span>
                </div>
                <select
                    name="listingType"
                    value={propertyData.listingType}
                    onChange={handleChange}
                    required
                    className="w-full p-4 mb-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option value="">Select Listing Type</option>
                    <option value="Sale">Sale</option>
                    <option value="Lease">Lease</option>
                </select>
                <input
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    accept=".jpg,.jpeg,.png"
                    className="w-full p-4 mb-6 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 transition duration-300"
                >
                    {loading ? 'Uploading...' : 'Create Property'}
                </button>
            </form>
        </div>
    );
};

export default PropertyForm;