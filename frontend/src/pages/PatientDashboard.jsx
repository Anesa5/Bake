// PatientDashboard.jsx (Simple Version)
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="patient-dashboard">
            <h1>Patient Dashboard</h1>

            <div className="dashboard-menu">
                <button onClick={() => navigate('/book-appointment')}>
                    Book Appointment
                </button>

                <button onClick={() => navigate('/doctors')}>
                    Find Doctors
                </button>

                <button onClick={() => navigate('/profile')}>
                    My Profile
                </button>

                <button onClick={() => navigate('/medical-history')}>
                    Medical History
                </button>
            </div>
        </div>
    );
};

export default PatientDashboard;