// DoctorDashboard.jsx - REACT COMPONENT
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        qualification: '',
        experience: '',
        specialization: '',
        bio: ''
    });
    const [clinics, setClinics] = useState([]);
    const [newClinic, setNewClinic] = useState({
        clinicName: '',
        address: '',
        consultationFees: 0,
        contactPhone: '',
        city: '',
        state: ''
    });
    const [clinicTimings, setClinicTimings] = useState([]);
    const [services, setServices] = useState([]);
    const [newService, setNewService] = useState('');
    const [education, setEducation] = useState([]);
    const [newEducation, setNewEducation] = useState({ degree: '', university: '', year: '' });
    const [languages, setLanguages] = useState([]);
    const [newLanguage, setNewLanguage] = useState('');

    // Get token from localStorage
    const token = localStorage.getItem('doctorToken');

    useEffect(() => {
        if (!token) {
            navigate('/doctor/login');
            return;
        }
        fetchDoctorProfile();
    }, [token, navigate]);

    const fetchDoctorProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/doctor-dashboard/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setDoctor(response.data.data);
                setFormData({
                    name: response.data.data.name || '',
                    phone: response.data.data.phone || '',
                    qualification: response.data.data.qualification || '',
                    experience: response.data.data.experience || '',
                    specialization: response.data.data.specialization || '',
                    bio: response.data.data.bio || ''
                });
                setClinics(response.data.data.clinics || []);
                setServices(response.data.data.services || []);
                setEducation(response.data.data.education || []);
                setLanguages(response.data.data.languages || []);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('doctorToken');
                navigate('/doctor/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                'http://localhost:5000/api/doctor-dashboard/profile/basic',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Profile updated successfully!');
                setDoctor(response.data.data);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            const response = await axios.post(
                'http://localhost:5000/api/doctor-dashboard/profile/picture',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                alert('Profile picture updated!');
                setDoctor({ ...doctor, profileImage: response.data.data.profileImage });
            }
        } catch (error) {
            console.error('Error uploading picture:', error);
            alert('Failed to upload picture');
        }
    };

    const handleAddClinic = async () => {
        try {
            const clinicData = {
                ...newClinic,
                timings: clinicTimings,
                daysAvailable: clinicTimings.map(t => t.day)
            };

            const response = await axios.post(
                'http://localhost:5000/api/doctor-dashboard/clinics',
                clinicData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Clinic added successfully!');
                setClinics(response.data.data);
                setNewClinic({
                    clinicName: '',
                    address: '',
                    consultationFees: 0,
                    contactPhone: '',
                    city: '',
                    state: ''
                });
                setClinicTimings([]);
            }
        } catch (error) {
            console.error('Error adding clinic:', error);
            alert('Failed to add clinic');
        }
    };

    const handleAddTiming = () => {
        setClinicTimings([...clinicTimings, { day: '', startTime: '', endTime: '' }]);
    };

    const handleTimingChange = (index, field, value) => {
        const updatedTimings = [...clinicTimings];
        updatedTimings[index][field] = value;
        setClinicTimings(updatedTimings);
    };

    const handleAddService = () => {
        if (newService.trim()) {
            setServices([...services, newService.trim()]);
            setNewService('');
        }
    };

    const handleRemoveService = (index) => {
        const updatedServices = services.filter((_, i) => i !== index);
        setServices(updatedServices);
    };

    const handleSaveServices = async () => {
        try {
            const response = await axios.post(
                'http://localhost:5000/api/doctor-dashboard/services',
                { services },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Services saved successfully!');
            }
        } catch (error) {
            console.error('Error saving services:', error);
            alert('Failed to save services');
        }
    };

    const handleAddEducation = () => {
        if (newEducation.degree && newEducation.university && newEducation.year) {
            setEducation([...education, { ...newEducation }]);
            setNewEducation({ degree: '', university: '', year: '' });
        }
    };

    const handleSaveEducation = async () => {
        try {
            const response = await axios.post(
                'http://localhost:5000/api/doctor-dashboard/education',
                { education },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Education saved successfully!');
            }
        } catch (error) {
            console.error('Error saving education:', error);
            alert('Failed to save education');
        }
    };

    const handleAddLanguage = () => {
        if (newLanguage.trim()) {
            setLanguages([...languages, newLanguage.trim()]);
            setNewLanguage('');
        }
    };

    const handleSaveLanguages = async () => {
        try {
            const response = await axios.post(
                'http://localhost:5000/api/doctor-dashboard/languages',
                { languages },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Languages saved successfully!');
            }
        } catch (error) {
            console.error('Error saving languages:', error);
            alert('Failed to save languages');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('doctorToken');
        navigate('/doctor/login');
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="doctor-dashboard">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="profile-summary">
                    <div className="profile-pic">
                        {doctor.profileImage ? (
                            <img src={`http://localhost:5000${doctor.profileImage}`} alt={doctor.name} />
                        ) : (
                            <div className="avatar">👨‍⚕️</div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureUpload}
                            className="upload-input"
                        />
                    </div>
                    <h3>Dr. {doctor.name}</h3>
                    <p>{doctor.specialization}</p>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>

                <nav className="dashboard-nav">
                    <button
                        className={activeTab === 'profile' ? 'active' : ''}
                        onClick={() => setActiveTab('profile')}
                    >
                        📝 Profile
                    </button>
                    <button
                        className={activeTab === 'clinics' ? 'active' : ''}
                        onClick={() => setActiveTab('clinics')}
                    >
                        🏥 Clinics
                    </button>
                    <button
                        className={activeTab === 'services' ? 'active' : ''}
                        onClick={() => setActiveTab('services')}
                    >
                        🔧 Services
                    </button>
                    <button
                        className={activeTab === 'education' ? 'active' : ''}
                        onClick={() => setActiveTab('education')}
                    >
                        🎓 Education
                    </button>
                    <button
                        className={activeTab === 'languages' ? 'active' : ''}
                        onClick={() => setActiveTab('languages')}
                    >
                        🌐 Languages
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="tab-content">
                        <h2>Edit Profile</h2>
                        <form onSubmit={handleProfileUpdate} className="profile-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Qualification</label>
                                <input
                                    type="text"
                                    name="qualification"
                                    value={formData.qualification}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Experience</label>
                                <input
                                    type="text"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 10 years"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Specialization</label>
                                <input
                                    type="text"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows="4"
                                    placeholder="Tell patients about yourself..."
                                />
                            </div>
                            <button type="submit" className="save-btn">Save Changes</button>
                        </form>
                    </div>
                )}

                {/* Clinics Tab */}
                {activeTab === 'clinics' && (
                    <div className="tab-content">
                        <h2>Manage Clinics</h2>

                        {/* Add New Clinic Form */}
                        <div className="add-clinic-form">
                            <h3>Add New Clinic</h3>
                            <div className="form-grid">
                                <input
                                    type="text"
                                    placeholder="Clinic Name"
                                    value={newClinic.clinicName}
                                    onChange={(e) => setNewClinic({ ...newClinic, clinicName: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Address"
                                    value={newClinic.address}
                                    onChange={(e) => setNewClinic({ ...newClinic, address: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Consultation Fees"
                                    value={newClinic.consultationFees}
                                    onChange={(e) => setNewClinic({ ...newClinic, consultationFees: e.target.value })}
                                />
                                <input
                                    type="tel"
                                    placeholder="Contact Phone"
                                    value={newClinic.contactPhone}
                                    onChange={(e) => setNewClinic({ ...newClinic, contactPhone: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={newClinic.city}
                                    onChange={(e) => setNewClinic({ ...newClinic, city: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={newClinic.state}
                                    onChange={(e) => setNewClinic({ ...newClinic, state: e.target.value })}
                                />
                            </div>

                            {/* Timings Section */}
                            <div className="timings-section">
                                <h4>Clinic Timings</h4>
                                {clinicTimings.map((timing, index) => (
                                    <div key={index} className="timing-row">
                                        <select
                                            value={timing.day}
                                            onChange={(e) => handleTimingChange(index, 'day', e.target.value)}
                                        >
                                            <option value="">Select Day</option>
                                            <option value="Monday">Monday</option>
                                            <option value="Tuesday">Tuesday</option>
                                            <option value="Wednesday">Wednesday</option>
                                            <option value="Thursday">Thursday</option>
                                            <option value="Friday">Friday</option>
                                            <option value="Saturday">Saturday</option>
                                            <option value="Sunday">Sunday</option>
                                        </select>
                                        <input
                                            type="time"
                                            value={timing.startTime}
                                            onChange={(e) => handleTimingChange(index, 'startTime', e.target.value)}
                                        />
                                        <span>to</span>
                                        <input
                                            type="time"
                                            value={timing.endTime}
                                            onChange={(e) => handleTimingChange(index, 'endTime', e.target.value)}
                                        />
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddTiming} className="add-timing-btn">
                                    + Add Timing
                                </button>
                            </div>

                            <button onClick={handleAddClinic} className="add-clinic-btn">
                                Add Clinic
                            </button>
                        </div>

                        {/* Existing Clinics */}
                        <div className="existing-clinics">
                            <h3>Your Clinics</h3>
                            {clinics.length === 0 ? (
                                <p>No clinics added yet.</p>
                            ) : (
                                clinics.map((clinic, index) => (
                                    <div key={index} className="clinic-card">
                                        <h4>{clinic.clinicName}</h4>
                                        <p>📍 {clinic.address}</p>
                                        <p>📞 {clinic.contactPhone}</p>
                                        <p>💰 Fee: ₹{clinic.consultationFees}</p>
                                        <div className="timings">
                                            {clinic.timings && clinic.timings.map((timing, idx) => (
                                                <span key={idx} className="timing-tag">
                                                    {timing.day}: {timing.startTime} - {timing.endTime}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                    <div className="tab-content">
                        <h2>Manage Services</h2>
                        <div className="services-manager">
                            <div className="add-service">
                                <input
                                    type="text"
                                    placeholder="Add a service (e.g., General Consultation)"
                                    value={newService}
                                    onChange={(e) => setNewService(e.target.value)}
                                />
                                <button onClick={handleAddService}>Add</button>
                            </div>
                            <div className="services-list">
                                {services.map((service, index) => (
                                    <div key={index} className="service-item">
                                        <span>{service}</span>
                                        <button onClick={() => handleRemoveService(index)}>Remove</button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleSaveServices} className="save-btn">
                                Save Services
                            </button>
                        </div>
                    </div>
                )}

                {/* Education Tab */}
                {activeTab === 'education' && (
                    <div className="tab-content">
                        <h2>Education & Qualifications</h2>
                        <div className="education-manager">
                            <div className="add-education">
                                <input
                                    type="text"
                                    placeholder="Degree (e.g., MBBS)"
                                    value={newEducation.degree}
                                    onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="University"
                                    value={newEducation.university}
                                    onChange={(e) => setNewEducation({ ...newEducation, university: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Year"
                                    value={newEducation.year}
                                    onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                                />
                                <button onClick={handleAddEducation}>Add</button>
                            </div>
                            <div className="education-list">
                                {education.map((edu, index) => (
                                    <div key={index} className="education-item">
                                        <h4>{edu.degree}</h4>
                                        <p>{edu.university} - {edu.year}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleSaveEducation} className="save-btn">
                                Save Education
                            </button>
                        </div>
                    </div>
                )}

                {/* Languages Tab */}
                {activeTab === 'languages' && (
                    <div className="tab-content">
                        <h2>Languages Spoken</h2>
                        <div className="languages-manager">
                            <div className="add-language">
                                <input
                                    type="text"
                                    placeholder="Add a language"
                                    value={newLanguage}
                                    onChange={(e) => setNewLanguage(e.target.value)}
                                />
                                <button onClick={handleAddLanguage}>Add</button>
                            </div>
                            <div className="languages-list">
                                {languages.map((language, index) => (
                                    <div key={index} className="language-tag">
                                        {language}
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleSaveLanguages} className="save-btn">
                                Save Languages
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .doctor-dashboard {
                    display: flex;
                    min-height: 100vh;
                    background: #f5f7fa;
                }

                .sidebar {
                    width: 280px;
                    background: white;
                    border-right: 1px solid #e1e5eb;
                    padding: 20px;
                }

                .profile-summary {
                    text-align: center;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #e1e5eb;
                    margin-bottom: 20px;
                }

                .profile-pic {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin: 0 auto 15px;
                }

                .profile-pic img, .avatar {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid #3498db;
                }

                .avatar {
                    background: #3498db;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3rem;
                    color: white;
                }

                .upload-input {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    opacity: 0;
                    width: 40px;
                    height: 40px;
                    cursor: pointer;
                }

                .profile-pic::after {
                    content: '📷';
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    background: #3498db;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .logout-btn {
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                }

                .dashboard-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .dashboard-nav button {
                    padding: 12px 20px;
                    background: none;
                    border: none;
                    text-align: left;
                    cursor: pointer;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: all 0.3s;
                }

                .dashboard-nav button:hover {
                    background: #e8f4fc;
                }

                .dashboard-nav button.active {
                    background: #3498db;
                    color: white;
                }

                .main-content {
                    flex: 1;
                    padding: 30px;
                    overflow-y: auto;
                }

                .tab-content {
                    background: white;
                    border-radius: 10px;
                    padding: 30px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .tab-content h2 {
                    margin-bottom: 25px;
                    color: #2c3e50;
                }

                .profile-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    max-width: 600px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group label {
                    font-weight: 600;
                    color: #34495e;
                }

                .form-group input,
                .form-group textarea {
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 1rem;
                }

                .save-btn {
                    background: #27ae60;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1rem;
                    align-self: flex-start;
                }

                .add-clinic-form {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .form-grid input {
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }

                .timings-section {
                    margin: 20px 0;
                }

                .timing-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }

                .timing-row select,
                .timing-row input {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }

                .add-timing-btn {
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                }

                .add-clinic-btn {
                    background: #27ae60;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 5px;
                    cursor: pointer;
                }

                .clinic-card {
                    background: white;
                    border: 1px solid #e1e5eb;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 15px;
                }

                .clinic-card h4 {
                    margin: 0 0 10px 0;
                    color: #2c3e50;
                }

                .clinic-card p {
                    margin: 5px 0;
                    color: #7f8c8d;
                }

                .timings {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 10px;
                }

                .timing-tag {
                    background: #e8f4fc;
                    color: #3498db;
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 0.9rem;
                }

                .services-manager,
                .education-manager,
                .languages-manager {
                    max-width: 600px;
                }

                .add-service,
                .add-education,
                .add-language {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }

                .add-service input,
                .add-language input {
                    flex: 1;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }

                .add-education {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 10px;
                }

                .services-list,
                .education-list {
                    margin-bottom: 20px;
                }

                .service-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 15px;
                    background: #f8f9fa;
                    border-radius: 5px;
                    margin-bottom: 10px;
                }

                .service-item button {
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                }

                .education-item {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 10px;
                }

                .education-item h4 {
                    margin: 0 0 5px 0;
                    color: #2c3e50;
                }

                .education-item p {
                    margin: 0;
                    color: #7f8c8d;
                }

                .languages-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 20px;
                }

                .language-tag {
                    background: #3498db;
                    color: white;
                    padding: 8px 15px;
                    border-radius: 20px;
                }

                .loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                }

                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 5px solid #f3f3f3;
                    border-top: 5px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default DoctorDashboard;
