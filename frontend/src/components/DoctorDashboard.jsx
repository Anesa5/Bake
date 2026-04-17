// components/DoctorDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI, specializationAPI } from '../services/api';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [message, setMessage] = useState('');

    const fetchDoctorData = useCallback(async () => {
        try {
            const doctorId = localStorage.getItem('doctorId');
            if (!doctorId) {
                navigate('/doctor/login');
                return;
            }

            const response = await doctorAPI.getDoctorById(doctorId);
            setDoctor(response.data);
        } catch (error) {
            console.error('Error fetching doctor data:', error);
            navigate('/doctor/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchDoctorData();
    }, [fetchDoctorData]);

    const handlePublish = async () => {
        if (!doctor) return;

        if (window.confirm('Are you sure you want to publish your profile? This will make it visible to patients.')) {
            setPublishing(true);
            setMessage('');

            try {
                await specializationAPI.publishDoctor(doctor._id);
                setDoctor(prev => ({ ...prev, status: 'published' }));
                setMessage('✅ Profile published successfully! Patients can now find you.');
            } catch (error) {
                setMessage('❌ Failed to publish profile. Please try again.');
                console.error('Publish error:', error);
            } finally {
                setPublishing(false);
            }
        }
    };

    const handleUnpublish = async () => {
        if (!doctor) return;

        if (window.confirm('Are you sure you want to unpublish your profile? Patients will no longer be able to see it.')) {
            setPublishing(true);
            setMessage('');

            try {
                await specializationAPI.unpublishDoctor(doctor._id);
                setDoctor(prev => ({ ...prev, status: 'unpublished' }));
                setMessage('✅ Profile unpublished successfully.');
            } catch (error) {
                setMessage('❌ Failed to unpublish profile. Please try again.');
                console.error('Unpublish error:', error);
            } finally {
                setPublishing(false);
            }
        }
    };

    const handleEditProfile = () => {
        navigate('/doctor/register?edit=true');
    };

    const handleLogout = () => {
        localStorage.removeItem('doctorToken');
        localStorage.removeItem('doctorId');
        localStorage.removeItem('doctorName');
        navigate('/doctor/login');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="error-container">
                <p>No doctor data found. Please log in again.</p>
                <button onClick={() => navigate('/doctor/login')}>Go to Login</button>
            </div>
        );
    }
    

    return (
        <div className="doctor-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Welcome, Dr. {doctor.name}</h1>
                    <p className="specialization-badge">{doctor.specialization}</p>
                </div>
                <div className="header-actions">
                    <div className="status-badge">
                        Status: <span className={`status ${doctor.status}`}>
                            {doctor.status.toUpperCase()}
                        </span>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </div>

            {message && (
                <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            <div className="dashboard-content">
                <div className="profile-section">
                    <h2>Your Profile</h2>
                    <div className="profile-card">
                        <div className="profile-info">
                            <div className="info-group">
                                <label>Qualification:</label>
                                <span>{doctor.qualification}</span>
                            </div>
                            <div className="info-group">
                                <label>Experience:</label>
                                <span>{doctor.experience} years</span>
                            </div>
                            <div className="info-group">
                                <label>Location:</label>
                                <span>{doctor.location}</span>
                            </div>
                            <div className="info-group">
                                <label>Consultation Fee:</label>
                                <span>₹{doctor.consultationFee}</span>
                            </div>
                            <div className="info-group">
                                <label>Available Hours:</label>
                                <span>{doctor.availableHours}</span>
                            </div>
                            <div className="info-group">
                                <label>Phone:</label>
                                <span>{doctor.phone}</span>
                            </div>
                            <div className="info-group full-width">
                                <label>Bio:</label>
                                <p className="bio-text">{doctor.bio}</p>
                            </div>
                        </div>

                        <div className="profile-actions">
                            {doctor.status === 'draft' || doctor.status === 'unpublished' ? (
                                <button
                                    onClick={handlePublish}
                                    className="publish-btn"
                                    disabled={publishing}
                                >
                                    {publishing ? 'Publishing...' : '📢 Publish Profile'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleUnpublish}
                                    className="unpublish-btn"
                                    disabled={publishing}
                                >
                                    {publishing ? 'Unpublishing...' : '🚫 Unpublish Profile'}
                                </button>
                            )}

                            <button onClick={handleEditProfile} className="edit-btn">
                                ✏️ Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                <div className="stats-section">
                    <h2>Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">0</div>
                            <div className="stat-label">Appointments</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">0</div>
                            <div className="stat-label">Patients</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{doctor.rating || 0}/5</div>
                            <div className="stat-label">Rating</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{doctor.totalReviews || 0}</div>
                            <div className="stat-label">Reviews</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;