/*import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI } from '../services/api';


const specializations = [
    'Dermatologist',
    'Gynecologist',
    'Urologist',
    'Gastroenterologist',
    'Dentist',
    'Obesity Specialist',
    'ENT Specialist',
    'Orthopedic Surgeon',
    'Neurologist',
    'Child Specialist',
    'Eye Specialist',
    'General Physician'
];

const DoctorRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        specialization: '',
        qualification: '',
        experience: '',
        location: '',
        consultationFee: '',
        bio: '',
        availableHours: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10}$/;
        const feeRegex = /^[0-9]+$/;

        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.specialization) errors.specialization = 'Specialization is required';
        if (!formData.qualification.trim()) errors.qualification = 'Qualification is required';
        if (!formData.experience) {
            errors.experience = 'Experience is required';
        } else if (isNaN(formData.experience) || formData.experience < 0 || formData.experience > 50) {
            errors.experience = 'Please enter a valid experience (0-50 years)';
        }
        if (!formData.location.trim()) errors.location = 'Location is required';
        if (!formData.consultationFee) {
            errors.consultationFee = 'Consultation fee is required';
        } else if (!feeRegex.test(formData.consultationFee) || parseInt(formData.consultationFee) <= 0) {
            errors.consultationFee = 'Please enter a valid fee';
        }
        if (!formData.bio.trim()) errors.bio = 'Bio is required';
        if (!formData.availableHours.trim()) errors.availableHours = 'Available hours are required';
        if (!formData.phone) {
            errors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone)) {
            errors.phone = 'Please enter a valid 10-digit phone number';
        }

        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear validation error for this field when user starts typing
        if (validationErrors[name]) {
            setValidationErrors({
                ...validationErrors,
                [name]: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setLoading(true);
        setError('');
        setValidationErrors({});

        try {
            console.log('Submitting doctor data to database...');

            // Prepare data for API (remove confirmPassword as it's not needed for backend)
            const { confirmPassword, ...doctorData } = formData;

            // Convert string values to appropriate types
            const submissionData = {
                ...doctorData,
                experience: parseInt(doctorData.experience),
                consultationFee: parseFloat(doctorData.consultationFee)
            };

            console.log('Data to submit:', submissionData);

            // Call API to register doctor
            const response = await doctorAPI.registerDoctor(submissionData);

            console.log('Registration successful:', response);

            setSuccess(true);

            // Reset form
            setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                specialization: '',
                qualification: '',
                experience: '',
                location: '',
                consultationFee: '',
                bio: '',
                availableHours: '',
                phone: ''
            });

            // Redirect to login page after 3 seconds
            setTimeout(() => {
                navigate('/doctor/login');
            }, 3000);

        } catch (error) {
            console.error('Registration error:', error);

            // Handle different types of errors
            if (error.response) {
                // Server responded with error status
                if (error.response.status === 409) {
                    setError('Email already exists. Please use a different email.');
                } else if (error.response.status === 400) {
                    setError('Invalid data. Please check your inputs.');
                } else {
                    setError(`Registration failed: ${error.response.data?.message || 'Server error'}`);
                }
            } else if (error.request) {
                // Request was made but no response received
                setError('Network error. Please check your connection.');
            } else {
                // Something else happened
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSpecializationChange = (e) => {
        setFormData({
            ...formData,
            specialization: e.target.value
        });
        if (validationErrors.specialization) {
            setValidationErrors({
                ...validationErrors,
                specialization: ''
            });
        }
    };

    return (
        <div className="doctor-registration-container">
            <div className="registration-card">
                <h2>Doctor Registration</h2>

                {success && (
                    <div className="success-message">
                        <p>✅ Registration successful! You will be redirected to login page shortly.</p>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <p>❌ {error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="registration-form">
                    {/* Personal Information 
                    <div className="form-section">
                        <h3>Personal Information</h3>
                        <div className="form-group">
                            <label htmlFor="name">Full Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={validationErrors.name ? 'error' : ''}
                                placeholder="Enter your full name"
                            />
                            {validationErrors.name && <span className="error-text">{validationErrors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={validationErrors.email ? 'error' : ''}
                                placeholder="Enter your email"
                            />
                            {validationErrors.email && <span className="error-text">{validationErrors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number *</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={validationErrors.phone ? 'error' : ''}
                                placeholder="Enter 10-digit phone number"
                                maxLength="10"
                            />
                            {validationErrors.phone && <span className="error-text">{validationErrors.phone}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">Password *</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={validationErrors.password ? 'error' : ''}
                                    placeholder="Enter password (min 6 characters)"
                                />
                                {validationErrors.password && <span className="error-text">{validationErrors.password}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password *</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={validationErrors.confirmPassword ? 'error' : ''}
                                    placeholder="Confirm password"
                                />
                                {validationErrors.confirmPassword && <span className="error-text">{validationErrors.confirmPassword}</span>}
                            </div>
                        </div>
                    </div>

                    
                    <div className="form-section">
                        <h3>Professional Information</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="specialization">Specialization *</label>
                                <select
                                    id="specialization"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleSpecializationChange}
                                    className={validationErrors.specialization ? 'error' : ''}
                                >
                                    <option value="">Select Specialization</option>
                                    {specializations.map((spec) => (
                                        <option key={spec} value={spec}>
                                            {spec}
                                        </option>
                                    ))}
                                </select>
                                {validationErrors.specialization && <span className="error-text">{validationErrors.specialization}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="qualification">Qualification *</label>
                                <input
                                    type="text"
                                    id="qualification"
                                    name="qualification"
                                    value={formData.qualification}
                                    onChange={handleChange}
                                    className={validationErrors.qualification ? 'error' : ''}
                                    placeholder="e.g., MBBS, MD, MS"
                                />
                                {validationErrors.qualification && <span className="error-text">{validationErrors.qualification}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="experience">Experience (Years) *</label>
                                <input
                                    type="number"
                                    id="experience"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    className={validationErrors.experience ? 'error' : ''}
                                    placeholder="Years of experience"
                                    min="0"
                                    max="50"
                                />
                                {validationErrors.experience && <span className="error-text">{validationErrors.experience}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="consultationFee">Consultation Fee (₹) *</label>
                                <input
                                    type="number"
                                    id="consultationFee"
                                    name="consultationFee"
                                    value={formData.consultationFee}
                                    onChange={handleChange}
                                    className={validationErrors.consultationFee ? 'error' : ''}
                                    placeholder="Fee in rupees"
                                    min="0"
                                />
                                {validationErrors.consultationFee && <span className="error-text">{validationErrors.consultationFee}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">Location/Clinic Address *</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className={validationErrors.location ? 'error' : ''}
                                placeholder="Enter your clinic address"
                            />
                            {validationErrors.location && <span className="error-text">{validationErrors.location}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="availableHours">Available Hours *</label>
                            <input
                                type="text"
                                id="availableHours"
                                name="availableHours"
                                value={formData.availableHours}
                                onChange={handleChange}
                                className={validationErrors.availableHours ? 'error' : ''}
                                placeholder="e.g., Mon-Fri: 9AM-5PM, Sat: 9AM-1PM"
                            />
                            {validationErrors.availableHours && <span className="error-text">{validationErrors.availableHours}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="bio">Bio/Professional Summary *</label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                className={validationErrors.bio ? 'error' : ''}
                                placeholder="Describe your expertise, achievements, etc."
                                rows="4"
                            />
                            {validationErrors.bio && <span className="error-text">{validationErrors.bio}</span>}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Registering...
                                </>
                            ) : (
                                'Register'
                            )}
                        </button>

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate('/')}
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="login-link">
                        <p>
                            Already have an account?{' '}
                            <button
                                type="button"
                                className="link-btn"
                                onClick={() => navigate('/doctor/login')}
                            >
                                Login here
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DoctorRegistration;*/