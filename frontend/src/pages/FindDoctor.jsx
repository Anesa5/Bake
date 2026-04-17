// pages/FindDoctor.jsx or similar
import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';

const FindDoctor = () => {
    const [searchResults, setSearchResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearchResults = (results) => {
        setSearchResults(results);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-center mb-8">
                    Find a Doctor
                </h1>

                <SearchBar onSearchResults={handleSearchResults} />

                <div className="mt-8">
                    {loading ? (
                        <div className="text-center">Loading...</div>
                    ) : (
                        <SearchResults results={searchResults} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default FindDoctor;