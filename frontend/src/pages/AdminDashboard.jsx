// AdminDashboard.jsx - Updated with Full Screen Doctor Profile Modal
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users, CheckCircle, Clock, AlertCircle,
    BarChart, Search, Filter, Download,
    Eye, Check, X, Edit, Trash2, UserPlus,
    Mail, Phone, MapPin, Briefcase, Calendar,
    MessageSquare, AlertTriangle, Send, XCircle,
    CheckCircle2, Info, Bell, MessageCircle,
    Award, BookOpen, Star, Globe, Shield,
    Activity, Heart, Stethoscope, FileText,
    ChevronLeft, ChevronRight, Printer, Share2,
    MoreVertical, Download as DownloadIcon,
    Video, MessageCircle as MessageIcon
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateAdmin, setShowCreateAdmin] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDoctorProfileModal, setShowDoctorProfileModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionStep, setRejectionStep] = useState(1);
    const [smsStatus, setSmsStatus] = useState(null);
    const [smsLogs, setSmsLogs] = useState([]);
    const [showSmsLogs, setShowSmsLogs] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'admin' });
    const [profileTab, setProfileTab] = useState('overview');

    useEffect(() => {
        fetchDashboardData();
        fetchSMSLogs();
    }, [activeTab]);

    // Search functionality
    useEffect(() => {
        if (allDoctors.length > 0) {
            const filtered = allDoctors.filter(doctor =>
                doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.phone?.includes(searchTerm)
            );
            setFilteredDoctors(filtered);
        }
    }, [searchTerm, allDoctors]);

    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => setNotification({ show: false, type: '', message }), 5000);
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                window.location.href = '/admin/login';
                return;
            }

            if (activeTab === 'dashboard') {
                const statsRes = await axios.get('http://localhost:5000/api/admin/doctors/stats/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(statsRes.data.data);

                const pendingRes = await axios.get('http://localhost:5000/api/admin/doctors/pending', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPendingDoctors(pendingRes.data.data);
            }

            if (activeTab === 'doctors' || activeTab === 'pending') {
                const doctorsRes = await axios.get('http://localhost:5000/api/admin/doctors', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAllDoctors(doctorsRes.data.data);
                setFilteredDoctors(doctorsRes.data.data);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/admin/login';
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchSMSLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/admin/sms-logs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSmsLogs(response.data.data);
        } catch (error) {
            console.error('Error fetching SMS logs:', error);
        }
    };

    // ======================
    // DOCTOR PROFILE MODAL FUNCTIONS
    // ======================
    const openDoctorProfile = (doctor) => {
        setSelectedDoctor(doctor);
        setShowDoctorProfileModal(true);
        setProfileTab('overview');
    };

    const closeDoctorProfile = () => {
        setShowDoctorProfileModal(false);
        setSelectedDoctor(null);
        setProfileTab('overview');
    };

    const verifyDoctorFromProfile = async (doctorId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/admin/doctors/${doctorId}/verify`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            showNotification('success', 'Doctor verified successfully!');
            closeDoctorProfile();
            fetchDashboardData();
        } catch (error) {
            console.error('Error verifying doctor:', error);
            showNotification('error', 'Failed to verify doctor');
        }
    };

    const openRejectModalFromProfile = (doctor) => {
        closeDoctorProfile();
        setSelectedDoctor(doctor);
        setShowRejectModal(true);
        setRejectionStep(1);
        setRejectionReason('');
        setSmsStatus(null);
    };

    // ======================
    // EXISTING FUNCTIONS (UNCHANGED)
    // ======================
    const openRejectModal = (doctor) => {
        setSelectedDoctor(doctor);
        setShowRejectModal(true);
        setRejectionStep(1);
        setRejectionReason('');
        setSmsStatus(null);
    };

    const closeRejectModal = () => {
        setShowRejectModal(false);
        setSelectedDoctor(null);
        setRejectionReason('');
        setRejectionStep(1);
        setSmsStatus(null);
    };

    const handleRejectDoctor = async () => {
        if (!rejectionReason.trim()) {
            showNotification('error', 'Please provide a rejection reason');
            return;
        }
        setRejectionStep(2);
    };

    const confirmRejection = async () => {
        setRejectionStep(3);
        setSmsStatus('sending');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:5000/api/admin/doctors/${selectedDoctor._id}/reject-with-sms`,
                {
                    rejectionReason,
                    sendSms: true,
                    doctorName: selectedDoctor.name,
                    doctorPhone: selectedDoctor.phone
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSmsStatus('success');
                showNotification('success', `Rejection SMS sent to Dr. ${selectedDoctor.name}`);
                fetchDashboardData();
                fetchSMSLogs();
                setTimeout(() => {
                    closeRejectModal();
                }, 2000);
            }
        } catch (error) {
            console.error('Error rejecting doctor:', error);
            setSmsStatus('error');
            showNotification('error', error.response?.data?.message || 'Failed to reject doctor');
        }
    };

    const verifyDoctor = async (doctorId) => {
        if (!window.confirm('Are you sure you want to verify this doctor?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/admin/doctors/${doctorId}/verify`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            showNotification('success', 'Doctor verified successfully!');
            fetchDashboardData();
        } catch (error) {
            console.error('Error verifying doctor:', error);
            showNotification('error', 'Failed to verify doctor');
        }
    };

    const handleViewDoctor = (doctor) => {
        openDoctorProfile(doctor);
    };

    const handleEditDoctor = (doctor) => {
        alert(`Edit doctor: ${doctor.name}`);
    };

    const handleDeleteDoctor = async (doctor) => {
        if (!window.confirm(`Are you sure you want to delete Dr. ${doctor.name}?`)) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:5000/api/admin/doctors/${doctor._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            showNotification('success', 'Doctor deleted successfully!');
            fetchDashboardData();
        } catch (error) {
            console.error('Error deleting doctor:', error);
            showNotification('error', 'Failed to delete doctor');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        window.location.href = '/admin/login';
    };

    const createNewAdmin = async () => {
        if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
            showNotification('error', 'Please fill in all fields');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/admin/auth/create-admin',
                newAdmin,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                showNotification('success', 'New admin created successfully!');
                setShowCreateAdmin(false);
                setNewAdmin({ name: '', email: '', password: '', role: 'admin' });
            }
        } catch (error) {
            showNotification('error', error.response?.data?.message || 'Failed to create admin');
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(allDoctors, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `doctors_${new Date().toISOString().split('T')[0]}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        showNotification('success', 'Data exported successfully!');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Notification Toast */}
            {notification.show && (
                <div className={`notification-toast ${notification.type}`}>
                    {notification.type === 'success' && <CheckCircle2 size={20} />}
                    {notification.type === 'error' && <AlertTriangle size={20} />}
                    {notification.type === 'info' && <Info size={20} />}
                    <span>{notification.message}</span>
                    <button onClick={() => setNotification({ ...notification, show: false })}>×</button>
                </div>
            )}

            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1 className="logo">MediFlow Admin</h1>
                        <nav className="main-nav">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                            >
                                <BarChart size={20} />
                                <span>Dashboard</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('doctors')}
                                className={`nav-btn ${activeTab === 'doctors' ? 'active' : ''}`}
                            >
                                <Users size={20} />
                                <span>All Doctors</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`nav-btn ${activeTab === 'pending' ? 'active' : ''}`}
                            >
                                <Clock size={20} />
                                <span>Pending</span>
                                {stats?.totals?.pending > 0 && (
                                    <span className="pending-badge">{stats.totals.pending}</span>
                                )}
                            </button>
                            <button
                                onClick={() => setShowSmsLogs(true)}
                                className="nav-btn"
                            >
                                <MessageCircle size={20} />
                                <span>SMS Logs</span>
                                {smsLogs.filter(log => log.status === 'failed').length > 0 && (
                                    <span className="pending-badge danger">
                                        {smsLogs.filter(log => log.status === 'failed').length}
                                    </span>
                                )}
                            </button>
                        </nav>
                    </div>
                    <div className="header-right">
                        <button
                            onClick={() => setShowCreateAdmin(true)}
                            className="btn-primary"
                        >
                            <UserPlus size={20} />
                            <span>Add Admin</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="btn-danger"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* SMS Logs Modal */}
            {showSmsLogs && (
                <div className="modal-overlay" onClick={() => setShowSmsLogs(false)}>
                    <div className="modal-content large" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">SMS Communication Logs</h2>

                        <div className="sms-logs-container">
                            {smsLogs.length === 0 ? (
                                <div className="empty-state">
                                    <MessageSquare size={48} />
                                    <h3>No SMS Logs</h3>
                                    <p>No SMS messages have been sent yet</p>
                                </div>
                            ) : (
                                <div className="sms-logs-list">
                                    {smsLogs.map((log, index) => (
                                        <div key={index} className={`sms-log-item ${log.status}`}>
                                            <div className="sms-log-header">
                                                <div className="sms-log-status">
                                                    {log.status === 'sent' ? (
                                                        <CheckCircle2 size={20} className="success" />
                                                    ) : log.status === 'failed' ? (
                                                        <XCircle size={20} className="danger" />
                                                    ) : (
                                                        <Clock size={20} className="warning" />
                                                    )}
                                                    <span className={`status-badge ${log.status}`}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                                <span className="sms-log-time">
                                                    {new Date(log.attemptedAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="sms-log-details">
                                                <div className="sms-log-doctor">
                                                    <Phone size={16} />
                                                    <span>{log.phoneNumber}</span>
                                                </div>
                                                <div className="sms-log-message">
                                                    <MessageSquare size={16} />
                                                    <span>{log.message}</span>
                                                </div>
                                                {log.error && (
                                                    <div className="sms-log-error">
                                                        <AlertTriangle size={16} />
                                                        <span>{log.error}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button
                                onClick={() => setShowSmsLogs(false)}
                                className="btn-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Admin Modal */}
            {showCreateAdmin && (
                <div className="modal-overlay" onClick={() => setShowCreateAdmin(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">Create New Admin</h2>

                        <div className="modal-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={newAdmin.name}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    placeholder="admin@example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    placeholder="Enter password"
                                />
                            </div>

                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    value={newAdmin.role}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Super Admin</option>
                                    <option value="moderator">Moderator</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                onClick={() => setShowCreateAdmin(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createNewAdmin}
                                className="btn-primary"
                            >
                                Create Admin
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FULL SCREEN DOCTOR PROFILE MODAL - ULTRA AESTHETIC */}
            {showDoctorProfileModal && selectedDoctor && (
                <div className="fullscreen-modal-overlay" onClick={closeDoctorProfile}>
                    <div className="fullscreen-modal-content" onClick={e => e.stopPropagation()}>

                        {/* Modal Header with Gradient */}
                        <div className="fullscreen-modal-header">
                            <div className="header-gradient-bg"></div>
                            <button className="modal-close-btn" onClick={closeDoctorProfile}>
                                <X size={24} />
                            </button>

                            <div className="header-content-wrapper">
                                <div className="doctor-profile-header">
                                    <div className="profile-avatar-wrapper">
                                        <div className="profile-avatar-glow"></div>
                                        <div className="profile-avatar">
                                            {selectedDoctor.profileImage ? (
                                                <img
                                                    src={`http://localhost:5000${selectedDoctor.profileImage}`}
                                                    alt={selectedDoctor.name}
                                                />
                                            ) : (
                                                <div className="avatar-placeholder large">
                                                    {selectedDoctor.name?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="avatar-status">
                                            {selectedDoctor.isVerified ? (
                                                <Shield size={20} className="verified-icon" />
                                            ) : (
                                                <Clock size={20} className="pending-icon" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="profile-title-section">
                                        <h1 className="profile-name">Dr. {selectedDoctor.name}</h1>
                                        <div className="profile-badges">
                                            <span className="specialty-badge">
                                                <Stethoscope size={16} />
                                                {selectedDoctor.specialization}
                                            </span>
                                            <span className="qualification-badge">
                                                <Award size={16} />
                                                {selectedDoctor.qualification}
                                            </span>
                                            <span className={`status-badge-large ${selectedDoctor.isVerified ? 'verified' : 'pending'}`}>
                                                {selectedDoctor.isVerified ? (
                                                    <>
                                                        <CheckCircle size={16} />
                                                        Verified
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock size={16} />
                                                        Pending Verification
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="quick-stats-grid">
                                    <div className="quick-stat-item">
                                        <div className="stat-icon">
                                            <Calendar size={20} />
                                        </div>
                                        <div className="stat-info">
                                            <span className="stat-label">Experience</span>
                                            <span className="stat-value">{selectedDoctor.experience} Years</span>
                                        </div>
                                    </div>
                                    <div className="quick-stat-item">
                                        <div className="stat-icon">
                                            <Users size={20} />
                                        </div>
                                        <div className="stat-info">
                                            <span className="stat-label">Patients</span>
                                            <span className="stat-value">{selectedDoctor.totalPatients || '0'}+</span>
                                        </div>
                                    </div>
                                    <div className="quick-stat-item">
                                        <div className="stat-icon">
                                            <Star size={20} />
                                        </div>
                                        <div className="stat-info">
                                            <span className="stat-label">Rating</span>
                                            <span className="stat-value">{selectedDoctor.rating || '4.8'}</span>
                                        </div>
                                    </div>
                                    <div className="quick-stat-item">
                                        <div className="stat-icon">
                                            <MessageCircle size={20} />
                                        </div>
                                        <div className="stat-info">
                                            <span className="stat-label">Reviews</span>
                                            <span className="stat-value">{selectedDoctor.totalReviews || '127'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Navigation Tabs */}
                        <div className="profile-tabs-container">
                            <button
                                className={`profile-tab ${profileTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setProfileTab('overview')}
                            >
                                <UserPlus size={18} />
                                Overview
                            </button>
                            <button
                                className={`profile-tab ${profileTab === 'services' ? 'active' : ''}`}
                                onClick={() => setProfileTab('services')}
                            >
                                <Activity size={18} />
                                Services
                            </button>
                            <button
                                className={`profile-tab ${profileTab === 'qualifications' ? 'active' : ''}`}
                                onClick={() => setProfileTab('qualifications')}
                            >
                                <Award size={18} />
                                Qualifications
                            </button>
                            <button
                                className={`profile-tab ${profileTab === 'contact' ? 'active' : ''}`}
                                onClick={() => setProfileTab('contact')}
                            >
                                <Phone size={18} />
                                Contact
                            </button>
                        </div>

                        {/* Profile Content */}
                        <div className="profile-content-wrapper">
                            {/* Overview Tab */}
                            {profileTab === 'overview' && (
                                <div className="profile-overview">
                                    {/* Bio Section */}
                                    <div className="profile-section">
                                        <h3 className="section-title">
                                            <FileText size={20} />
                                            Professional Bio
                                        </h3>
                                        <p className="bio-text">
                                            {selectedDoctor.bio ||
                                                `Dr. ${selectedDoctor.name} is a highly qualified ${selectedDoctor.specialization} specialist 
                                                with ${selectedDoctor.experience} years of clinical experience. Dedicated to providing 
                                                exceptional patient care and staying at the forefront of medical advancements.`}
                                        </p>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="info-grid">
                                        <div className="info-card">
                                            <h4 className="info-card-title">
                                                <MapPin size={18} />
                                                Clinic Location
                                            </h4>
                                            <p className="info-card-content">
                                                {selectedDoctor.clinicAddress || 'Address not provided'}
                                            </p>
                                        </div>

                                        <div className="info-card">
                                            <h4 className="info-card-title">
                                                <Clock size={18} />
                                                Registration Date
                                            </h4>
                                            <p className="info-card-content">
                                                {new Date(selectedDoctor.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>

                                        <div className="info-card">
                                            <h4 className="info-card-title">
                                                <Globe size={18} />
                                                Languages Spoken
                                            </h4>
                                            <p className="info-card-content">
                                                {selectedDoctor.languages?.length > 0
                                                    ? selectedDoctor.languages.join(', ')
                                                    : 'English, Urdu'}
                                            </p>
                                        </div>

                                        <div className="info-card">
                                            <h4 className="info-card-title">
                                                <Heart size={18} />
                                                Special Interests
                                            </h4>
                                            <p className="info-card-content">
                                                {selectedDoctor.interests || 'General Medicine'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Clinics Section */}
                                    {selectedDoctor.clinics && selectedDoctor.clinics.length > 0 && (
                                        <div className="profile-section">
                                            <h3 className="section-title">
                                                <MapPin size={20} />
                                                Clinic Locations
                                            </h3>
                                            <div className="clinics-list">
                                                {selectedDoctor.clinics.map((clinic, index) => (
                                                    <div key={index} className="clinic-item">
                                                        <div className="clinic-header">
                                                            <h4>{clinic.clinicName || 'Main Clinic'}</h4>
                                                            {clinic.isPrimary && (
                                                                <span className="primary-badge">Primary</span>
                                                            )}
                                                        </div>
                                                        <p className="clinic-address">{clinic.address}</p>
                                                        <div className="clinic-timings">
                                                            {clinic.timings?.map((timing, idx) => (
                                                                <span key={idx} className="timing-chip">
                                                                    {timing.day}: {timing.startTime} - {timing.endTime}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Services Tab */}
                            {profileTab === 'services' && (
                                <div className="profile-services">
                                    <h3 className="section-title">
                                        <Activity size={20} />
                                        Services & Treatments
                                    </h3>

                                    {selectedDoctor.services && selectedDoctor.services.length > 0 ? (
                                        <div className="services-grid">
                                            {selectedDoctor.services.map((service, index) => (
                                                <div key={index} className="service-card">
                                                    <div className="service-icon">
                                                        <Heart size={24} />
                                                    </div>
                                                    <div className="service-info">
                                                        <h4>{typeof service === 'string' ? service : service.name}</h4>
                                                        {typeof service === 'object' && service.description && (
                                                            <p>{service.description}</p>
                                                        )}
                                                        {typeof service === 'object' && service.price && (
                                                            <span className="service-price">₹{service.price}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="empty-state small">
                                            <Activity size={48} />
                                            <h4>No Services Listed</h4>
                                            <p>This doctor hasn't added any services yet.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Qualifications Tab */}
                            {profileTab === 'qualifications' && (
                                <div className="profile-qualifications">
                                    <h3 className="section-title">
                                        <Award size={20} />
                                        Education & Qualifications
                                    </h3>

                                    {selectedDoctor.education && selectedDoctor.education.length > 0 ? (
                                        <div className="qualifications-timeline">
                                            {selectedDoctor.education.map((edu, index) => (
                                                <div key={index} className="timeline-item">
                                                    <div className="timeline-dot"></div>
                                                    <div className="timeline-content">
                                                        <h4>{edu.degree}</h4>
                                                        <p className="institution">{edu.university}</p>
                                                        <span className="year">{edu.year}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="empty-state small">
                                            <BookOpen size={48} />
                                            <h4>No Education Details</h4>
                                            <p>Education information not provided.</p>
                                        </div>
                                    )}

                                    {/* Awards Section */}
                                    {selectedDoctor.awards && selectedDoctor.awards.length > 0 && (
                                        <>
                                            <h3 className="section-title" style={{ marginTop: '40px' }}>
                                                <Award size={20} />
                                                Awards & Recognition
                                            </h3>
                                            <div className="awards-list">
                                                {selectedDoctor.awards.map((award, index) => (
                                                    <div key={index} className="award-item">
                                                        <span className="award-icon">🏆</span>
                                                        <div>
                                                            <h4>{award.name}</h4>
                                                            <p>{award.year} • {award.organization}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Contact Tab */}
                            {profileTab === 'contact' && (
                                <div className="profile-contact">
                                    <h3 className="section-title">
                                        <Phone size={20} />
                                        Contact Information
                                    </h3>

                                    <div className="contact-cards">
                                        <div className="contact-card">
                                            <div className="contact-icon">
                                                <Mail size={24} />
                                            </div>
                                            <div className="contact-details">
                                                <span className="contact-label">Email Address</span>
                                                <span className="contact-value">{selectedDoctor.email}</span>
                                                <button className="contact-action">
                                                    Send Email
                                                </button>
                                            </div>
                                        </div>

                                        <div className="contact-card">
                                            <div className="contact-icon">
                                                <Phone size={24} />
                                            </div>
                                            <div className="contact-details">
                                                <span className="contact-label">Phone Number</span>
                                                <span className="contact-value">{selectedDoctor.phone}</span>
                                                <button className="contact-action">
                                                    Call Now
                                                </button>
                                            </div>
                                        </div>

                                        <div className="contact-card">
                                            <div className="contact-icon">
                                                <MapPin size={24} />
                                            </div>
                                            <div className="contact-details">
                                                <span className="contact-label">Clinic Address</span>
                                                <span className="contact-value">{selectedDoctor.clinicAddress || 'Not provided'}</span>
                                                <button className="contact-action">
                                                    Get Directions
                                                </button>
                                            </div>
                                        </div>

                                        <div className="contact-card">
                                            <div className="contact-icon">
                                                <MessageIcon size={24} />
                                            </div>
                                            <div className="contact-details">
                                                <span className="contact-label">Video Consultation</span>
                                                <span className="contact-value">Available</span>
                                                <button className="contact-action">
                                                    Schedule Call
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer with Actions */}
                        <div className="fullscreen-modal-footer">
                            <div className="footer-actions-left">
                                <button className="footer-action-btn">
                                    <Printer size={18} />
                                    Print
                                </button>
                                <button className="footer-action-btn">
                                    <DownloadIcon size={18} />
                                    Export
                                </button>
                                <button className="footer-action-btn">
                                    <Share2 size={18} />
                                    Share
                                </button>
                            </div>

                            <div className="footer-actions-right">
                                {!selectedDoctor.isVerified && (
                                    <>
                                        <button
                                            onClick={() => openRejectModalFromProfile(selectedDoctor)}
                                            className="btn-danger large"
                                        >
                                            <X size={18} />
                                            Reject with SMS
                                        </button>
                                        <button
                                            onClick={() => verifyDoctorFromProfile(selectedDoctor._id)}
                                            className="btn-success large"
                                        >
                                            <Check size={18} />
                                            Verify Doctor
                                        </button>
                                    </>
                                )}
                                {selectedDoctor.isVerified && (
                                    <div className="verified-message">
                                        <CheckCircle2 size={20} />
                                        <span>This doctor is verified</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedDoctor && (
                <div className="modal-overlay" onClick={closeRejectModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        {/* Step 1: Rejection Reason */}
                        {rejectionStep === 1 && (
                            <>
                                <div className="modal-header">
                                    <div className="modal-header-icon warning">
                                        <AlertTriangle size={32} />
                                    </div>
                                    <h2 className="modal-title">Reject Doctor Application</h2>
                                    <p className="modal-subtitle">
                                        You are about to reject Dr. {selectedDoctor.name}'s application
                                    </p>
                                </div>

                                <div className="doctor-preview-card">
                                    <div className="doctor-avatar large">
                                        {selectedDoctor.profileImage ? (
                                            <img
                                                src={`http://localhost:5000${selectedDoctor.profileImage}`}
                                                alt={selectedDoctor.name}
                                            />
                                        ) : (
                                            <div className="avatar-placeholder large">
                                                {selectedDoctor.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="doctor-info">
                                        <h3>Dr. {selectedDoctor.name}</h3>
                                        <p>{selectedDoctor.specialization}</p>
                                        <p className="contact-info">
                                            <Phone size={14} />
                                            {selectedDoctor.phone}
                                        </p>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="required">Rejection Reason</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Please provide a detailed reason for rejection..."
                                        rows="5"
                                        className="rejection-textarea"
                                    />
                                    <small className="form-hint">
                                        This reason will be sent via SMS to the doctor
                                    </small>
                                </div>

                                <div className="sms-preview-info">
                                    <MessageSquare size={16} />
                                    <span>An SMS will be sent to {selectedDoctor.phone}</span>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        onClick={closeRejectModal}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRejectDoctor}
                                        className="btn-danger"
                                        disabled={!rejectionReason.trim()}
                                    >
                                        <X size={18} />
                                        Continue to Preview
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 2: Preview SMS */}
                        {rejectionStep === 2 && (
                            <>
                                <div className="modal-header">
                                    <div className="modal-header-icon info">
                                        <MessageSquare size={32} />
                                    </div>
                                    <h2 className="modal-title">Preview SMS</h2>
                                    <p className="modal-subtitle">
                                        Review the SMS that will be sent to Dr. {selectedDoctor.name}
                                    </p>
                                </div>

                                <div className="sms-preview">
                                    <div className="sms-header">
                                        <Bell size={16} />
                                        <span>To: {selectedDoctor.phone}</span>
                                    </div>
                                    <div className="sms-body">
                                        <p>Dear Dr. {selectedDoctor.name},</p>
                                        <p>We regret to inform you that your doctor registration has been rejected.</p>
                                        <p><strong>Reason:</strong> {rejectionReason}</p>
                                        <p>For any clarification, please contact our support team at support@mediflow.com</p>
                                        <p>Best regards,<br />MediFlow Admin Team</p>
                                    </div>
                                    <div className="sms-footer">
                                        <Send size={14} />
                                        <span>This SMS will be sent immediately after confirmation</span>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        onClick={() => setRejectionStep(1)}
                                        className="btn-secondary"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={confirmRejection}
                                        className="btn-danger"
                                    >
                                        <Send size={18} />
                                        Send SMS & Reject
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 3: Sending Status */}
                        {rejectionStep === 3 && (
                            <div className="sending-status">
                                {smsStatus === 'sending' && (
                                    <>
                                        <div className="spinner large"></div>
                                        <h3>Sending SMS...</h3>
                                        <p>Please wait while we notify Dr. {selectedDoctor.name}</p>
                                    </>
                                )}

                                {smsStatus === 'success' && (
                                    <>
                                        <div className="success-icon">
                                            <CheckCircle2 size={64} />
                                        </div>
                                        <h3>SMS Sent Successfully!</h3>
                                        <p>Dr. {selectedDoctor.name} has been notified via SMS</p>
                                        <div className="sms-sent-details">
                                            <p><strong>Reason:</strong> {rejectionReason}</p>
                                            <p><strong>Phone:</strong> {selectedDoctor.phone}</p>
                                        </div>
                                    </>
                                )}

                                {smsStatus === 'error' && (
                                    <>
                                        <div className="error-icon">
                                            <XCircle size={64} />
                                        </div>
                                        <h3>SMS Failed to Send</h3>
                                        <p>There was an error sending the SMS</p>
                                        <button
                                            onClick={() => setRejectionStep(2)}
                                            className="btn-primary"
                                        >
                                            Try Again
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="main-content">
                <div className="content-wrapper">
                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && stats && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-info">
                                        <span className="stat-label">Total Doctors</span>
                                        <span className="stat-value">{stats.totals.all}</span>
                                    </div>
                                    <div className="stat-icon blue">
                                        <Users size={32} />
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-info">
                                        <span className="stat-label">Verified</span>
                                        <span className="stat-value">{stats.totals.verified}</span>
                                    </div>
                                    <div className="stat-icon green">
                                        <CheckCircle size={32} />
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-info">
                                        <span className="stat-label">Pending</span>
                                        <span className="stat-value">{stats.totals.pending}</span>
                                    </div>
                                    <div className="stat-icon yellow">
                                        <Clock size={32} />
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-info">
                                        <span className="stat-label">Today's Registrations</span>
                                        <span className="stat-value">{stats.totals.today}</span>
                                    </div>
                                    <div className="stat-icon purple">
                                        <AlertCircle size={32} />
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-grid">
                                {/* Pending Doctors Section */}
                                <div className="dashboard-card">
                                    <div className="card-header">
                                        <h3>Pending Verifications</h3>
                                    </div>
                                    <div className="card-body">
                                        {pendingDoctors.length === 0 ? (
                                            <p className="empty-state">No pending doctors</p>
                                        ) : (
                                            <div className="pending-list">
                                                {pendingDoctors.slice(0, 5).map(doctor => (
                                                    <div key={doctor._id} className="pending-item">
                                                        <div className="doctor-info">
                                                            <div className="doctor-avatar">
                                                                {doctor.profileImage ? (
                                                                    <img
                                                                        src={`http://localhost:5000${doctor.profileImage}`}
                                                                        alt={doctor.name}
                                                                    />
                                                                ) : (
                                                                    <div className="avatar-placeholder">
                                                                        {doctor.name?.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4>Dr. {doctor.name}</h4>
                                                                <p>{doctor.specialization}</p>
                                                                <small>
                                                                    <Calendar size={12} />
                                                                    {new Date(doctor.createdAt).toLocaleDateString()}
                                                                </small>
                                                            </div>
                                                        </div>
                                                        <div className="action-buttons">
                                                            <button
                                                                onClick={() => verifyDoctor(doctor._id)}
                                                                className="action-btn verify"
                                                                title="Verify"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => openRejectModal(doctor)}
                                                                className="action-btn reject"
                                                                title="Reject with SMS"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => openDoctorProfile(doctor)}
                                                                className="action-btn view"
                                                                title="View Profile"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {pendingDoctors.length > 5 && (
                                                    <button
                                                        onClick={() => setActiveTab('pending')}
                                                        className="view-all-link"
                                                    >
                                                        View all {pendingDoctors.length} pending doctors →
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Specialties Section */}
                                <div className="dashboard-card">
                                    <div className="card-header">
                                        <h3>Doctors by Specialty</h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="specialties-list">
                                            {stats.byCategory.map((item, index) => (
                                                <div key={index} className="specialty-item">
                                                    <span className="specialty-name">{item.name}</span>
                                                    <div className="progress-container">
                                                        <span className="specialty-count">{item.count}</span>
                                                        <div className="progress-bar">
                                                            <div
                                                                className="progress-fill"
                                                                style={{
                                                                    width: `${(item.count / Math.max(...stats.byCategory.map(c => c.count))) * 100}%`
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* All Doctors Tab */}
                    {activeTab === 'doctors' && (
                        <div className="doctors-table-container">
                            <div className="table-header">
                                <h2>All Doctors</h2>
                                <div className="table-actions">
                                    <div className="search-box">
                                        <Search size={20} className="search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Search doctors..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {searchTerm && (
                                            <button
                                                className="clear-search"
                                                onClick={() => setSearchTerm('')}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                    <button onClick={() => alert('Filter feature coming soon!')} className="btn-outline">
                                        <Filter size={20} />
                                        Filter
                                    </button>
                                    <button onClick={handleExport} className="btn-primary">
                                        <Download size={20} />
                                        Export
                                    </button>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="doctors-table">
                                    <thead>
                                        <tr>
                                            <th>Doctor</th>
                                            <th>Specialization</th>
                                            <th>Contact</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDoctors.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="no-results">
                                                    {searchTerm ? 'No doctors match your search' : 'No doctors found'}
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredDoctors.map(doctor => (
                                                <tr key={doctor._id}>
                                                    <td>
                                                        <div className="doctor-cell">
                                                            <div className="doctor-avatar">
                                                                {doctor.profileImage ? (
                                                                    <img
                                                                        src={`http://localhost:5000${doctor.profileImage}`}
                                                                        alt={doctor.name}
                                                                    />
                                                                ) : (
                                                                    <div className="avatar-placeholder">
                                                                        {doctor.name?.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="doctor-name">Dr. {doctor.name}</div>
                                                                <div className="doctor-qualification">{doctor.qualification}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="specialization-cell">
                                                            <div>{doctor.specialization}</div>
                                                            {doctor.category?.name && (
                                                                <small>{doctor.category.name}</small>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="contact-cell">
                                                            <div className="contact-item">
                                                                <Mail size={14} />
                                                                {doctor.email}
                                                            </div>
                                                            <div className="contact-item">
                                                                <Phone size={14} />
                                                                {doctor.phone}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${doctor.isVerified ? 'verified' : 'pending'}`}>
                                                            {doctor.isVerified ? 'Verified' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="table-actions-cell">
                                                            <button
                                                                onClick={() => openDoctorProfile(doctor)}
                                                                className="icon-btn view"
                                                                title="View Profile"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditDoctor(doctor)}
                                                                className="icon-btn edit"
                                                                title="Edit"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            {!doctor.isVerified && (
                                                                <button
                                                                    onClick={() => openRejectModal(doctor)}
                                                                    className="icon-btn reject"
                                                                    title="Reject with SMS"
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteDoctor(doctor)}
                                                                className="icon-btn delete"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pending Tab */}
                    {activeTab === 'pending' && (
                        <div className="pending-grid-container">
                            <div className="section-header">
                                <h2>Pending Doctor Verifications</h2>
                                <p className="section-subtitle">
                                    {pendingDoctors.length} doctor{pendingDoctors.length !== 1 ? 's' : ''} awaiting verification
                                </p>
                            </div>

                            {pendingDoctors.length === 0 ? (
                                <div className="empty-state-container">
                                    <CheckCircle size={64} className="empty-icon" />
                                    <h3>No Pending Verifications</h3>
                                    <p>All doctors have been processed</p>
                                </div>
                            ) : (
                                <div className="pending-grid">
                                    {pendingDoctors.map(doctor => (
                                        <div key={doctor._id} className="pending-card">
                                            <div className="pending-card-header">
                                                <div className="pending-avatar">
                                                    {doctor.profileImage ? (
                                                        <img
                                                            src={`http://localhost:5000${doctor.profileImage}`}
                                                            alt={doctor.name}
                                                        />
                                                    ) : (
                                                        <div className="avatar-placeholder large">
                                                            {doctor.name?.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3>Dr. {doctor.name}</h3>
                                                    <p className="specialization">{doctor.specialization}</p>
                                                    <p className="qualification">{doctor.qualification}</p>
                                                </div>
                                            </div>

                                            <div className="pending-card-body">
                                                <div className="info-row">
                                                    <Mail size={16} />
                                                    <span>{doctor.email}</span>
                                                </div>
                                                <div className="info-row">
                                                    <Phone size={16} />
                                                    <span>{doctor.phone}</span>
                                                </div>
                                                <div className="info-row">
                                                    <MapPin size={16} />
                                                    <span>{doctor.clinicAddress || 'Address not provided'}</span>
                                                </div>
                                                <div className="info-row">
                                                    <Briefcase size={16} />
                                                    <span>{doctor.experience} years experience</span>
                                                </div>
                                                <div className="info-row">
                                                    <Calendar size={16} />
                                                    <span>Registered: {new Date(doctor.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            <div className="pending-card-actions">
                                                <button
                                                    onClick={() => verifyDoctor(doctor._id)}
                                                    className="btn-verify"
                                                >
                                                    <Check size={18} />
                                                    Verify
                                                </button>
                                                <button
                                                    onClick={() => openRejectModal(doctor)}
                                                    className="btn-reject"
                                                >
                                                    <X size={18} />
                                                    Reject & SMS
                                                </button>
                                                <button
                                                    onClick={() => openDoctorProfile(doctor)}
                                                    className="btn-view"
                                                    title="View Profile"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;