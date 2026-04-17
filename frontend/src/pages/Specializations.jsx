// pages/Specializations.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { specializationAPI } from '../services/api';

console.log('1. Specializations component loaded');

const Specializations = () => {
    const [specializations, setSpecializations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSpecializations();
    }, []);

    const fetchSpecializations = async () => {
        try {
            console.log('2. fetchSpecializations called');
            const response = await specializationAPI.getAllSpecializations();
            console.log('3. API Response received:', response); // <-- ADD THIS LINE
            setSpecializations(response.data);
        } catch (error) {
            setError('Failed to load specializations');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper function for icons
    const getSpecializationIcon = (name) => {
        const icons = {
            'Dermatologist': '🔬',
            'Gynecologist': '👩‍⚕️',
            'Urologist': '💊',
            'Gastroenterologist': '🩺',
            'Dentist': '🦷',
            'Obesity Specialist': '⚖️',
            'ENT Specialist': '👂',
            'Orthopedic Surgeon': '🦴',
            'Neurologist': '🧠',
            'Child Specialist': '👶',
            'Eye Specialist': '👁️',
            'General Physician': '👨‍⚕️'
        };
        return icons[name] || '👨‍⚕️';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading specializations...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={fetchSpecializations}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="specializations-page">
            <div className="page-header">
                <h1>Medical Specializations</h1>
                <p>Find doctors by their area of expertise</p>
            </div>

            <div className="specializations-grid">
                {specializations.map((spec) => (
                    <Link
                        to={`/specializations/${spec.name}`}
                        key={spec._id || spec.name}
                        className="specialization-card"
                    >
                        <div className="specialization-icon">
                            {getSpecializationIcon(spec.name)}
                        </div>
                        <h3>{spec.name}</h3>
                        <p>{spec.description}</p>
                        <p>{spec.totalDoctors || 0} Doctors Available</p>
                        <p className="rating">
                            ⭐ {spec.averageRating ? parseFloat(spec.averageRating).toFixed(1) : 'No ratings yet'}
                        </p>
                        <button className="view-doctors-btn">View Doctors →</button>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Specializations;