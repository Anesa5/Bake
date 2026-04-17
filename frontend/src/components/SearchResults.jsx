import React from 'react';
import { MapPin, Star, Clock, Award, Tag } from 'lucide-react';

const SearchResults = ({ results, onPageChange }) => {
    if (!results || !results.doctors || results.doctors.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No doctors found matching your criteria.</p>
                <p className="text-gray-400">Try adjusting your search terms or filters.</p>
            </div>
        );
    }

    const handlePageChange = (newPage) => {
        if (onPageChange) {
            onPageChange(newPage);
        }
    };

    return (
        <div className="space-y-4">
            {/* Results Summary */}
            <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">
                    Found {results.totalDoctors} doctors
                    {results.currentPage && results.totalPages &&
                        ` (Page ${results.currentPage} of ${results.totalPages})`
                    }
                </p>
            </div>

            {/* Doctor Cards */}
            {results.doctors.map((doctor) => (
                <div
                    key={doctor._id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                    <div className="flex flex-col md:flex-row justify-between">
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Dr. {doctor.name}
                            </h3>

                            <div className="mt-2 space-y-2">
                                {/* Category Badge */}
                                {doctor.category && (
                                    <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mb-2">
                                        <Tag size={14} className="inline mr-1" />
                                        {doctor.category.name}
                                    </div>
                                )}

                                <div className="flex items-center text-gray-600">
                                    <Award size={16} className="mr-2" />
                                    <span>{doctor.specialization}</span>
                                </div>

                                <div className="flex items-center text-gray-600">
                                    <MapPin size={16} className="mr-2" />
                                    <span>{doctor.clinicAddress || 'Address not specified'}</span>
                                </div>

                                {doctor.experience && (
                                    <div className="text-sm text-gray-500">
                                        {doctor.experience} years experience
                                    </div>
                                )}

                                {doctor.qualification && (
                                    <div className="text-sm text-gray-500">
                                        {doctor.qualification}
                                    </div>
                                )}

                                {doctor.phone && (
                                    <div className="text-sm text-gray-500">
                                        📞 {doctor.phone}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-center justify-center">
                            <button
                                onClick={() => window.location.href = `/doctor-profile/${doctor._id}`}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mb-2"
                            >
                                View Profile
                            </button>
                            <button
                                onClick={() => {
                                    const whatsappNumber = "03374768957";
                                    const message = `Hello! I would like to book an appointment with Dr. ${doctor.name} (${doctor.specialization}). Please let me know about available slots.`;
                                    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                                    window.open(whatsappURL, "_blank");
                                }}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                Book via WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Pagination */}
            {results.totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-6">
                    <button
                        disabled={results.currentPage === 1}
                        onClick={() => handlePageChange(results.currentPage - 1)}
                        className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2">
                        Page {results.currentPage} of {results.totalPages}
                    </span>
                    <button
                        disabled={results.currentPage === results.totalPages}
                        onClick={() => handlePageChange(results.currentPage + 1)}
                        className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default SearchResults;