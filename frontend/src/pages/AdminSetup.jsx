// AdminSetup.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminSetup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'admin' // Default role as per your model
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors({
                ...validationErrors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
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

        return errors;
    };

    const handleSetup = async (e) => {
        e.preventDefault();

        // Validate form
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setError('Please fix the errors below');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        setValidationErrors({});

        try {
            // Prepare data for backend (exclude confirmPassword)
            const { confirmPassword, ...adminData } = formData;

            console.log('Sending admin setup data:', adminData);

            const response = await axios.post(
                'http://localhost:5000/api/admin/auth/setup',
                adminData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000 // 10 second timeout
                }
            );

            console.log('Setup response:', response.data);

            if (response.data.success) {
                setSuccess(response.data.message || 'Admin account created successfully!');

                // Store token and admin data if returned
                if (response.data.token) {
                    localStorage.setItem('adminToken', response.data.token);
                }
                if (response.data.admin) {
                    localStorage.setItem('adminData', JSON.stringify(response.data.admin));
                }

                // Redirect after success
                setTimeout(() => {
                    if (response.data.token) {
                        navigate('/admin/dashboard');
                    } else {
                        navigate('/admin/login');
                    }
                }, 2000);
            } else {
                setError(response.data.message || 'Setup failed');
            }
        } catch (err) {
            console.error('Setup error:', err);

            // Detailed error handling
            if (err.response) {
                // Server responded with error status
                console.error('Response error:', err.response.data);

                // Handle validation errors from server
                if (err.response.status === 400) {
                    if (err.response.data.errors) {
                        // Handle field validation errors
                        const serverErrors = {};
                        err.response.data.errors.forEach(error => {
                            serverErrors[error.path] = error.msg;
                        });
                        setValidationErrors(serverErrors);
                        setError('Please fix the validation errors');
                    } else {
                        setError(err.response.data.message ||
                            err.response.data.error ||
                            'Bad request. Please check your input.');
                    }
                } else if (err.response.status === 409) {
                    setError('Admin already exists. Please login instead.');
                } else {
                    setError(`Error: ${err.response.status} - ${err.response.data.message || 'Something went wrong'}`);
                }
            } else if (err.request) {
                // Request was made but no response
                console.error('No response:', err.request);
                setError('No response from server. Please check if the backend is running on http://localhost:5000');
            } else if (err.code === 'ECONNABORTED') {
                setError('Request timeout. Server is taking too long to respond.');
            } else {
                // Other errors
                setError(`Setup failed: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Admin Account</h1>
                    <p className="text-gray-600 text-sm">
                        Create the first administrator account for the system
                    </p>
                </div>

                {error && !Object.keys(validationErrors).length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-700">{success}</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSetup}>
                    {/* Name Field */}
                    <div className="mb-5">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                            Full Name *
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${validationErrors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter your full name"
                            autoComplete="name"
                            required
                            autoFocus
                            disabled={loading}
                        />
                        {validationErrors.name && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="mb-5">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                            Email Address *
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${validationErrors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="admin@example.com"
                            autoComplete="email"
                            required
                            disabled={loading}
                        />
                        {validationErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                        )}
                    </div>

                    {/* Role Field (optional) */}
                    <div className="mb-5">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="role">
                            Role
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            disabled={loading}
                        >
                            <option value="admin">Admin</option>
                            <option value="superadmin">Super Admin</option>
                            <option value="moderator">Moderator</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            Select the admin role (default: Admin)
                        </p>
                    </div>

                    {/* Password Field */}
                    <div className="mb-5">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                            Password *
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${validationErrors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Create a strong password"
                            autoComplete="new-password"
                            required
                            minLength="6"
                            disabled={loading}
                        />
                        {validationErrors.password ? (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                        ) : (
                            <p className="mt-1 text-xs text-gray-500">
                                Must be at least 6 characters long
                            </p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="confirmPassword">
                            Confirm Password *
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Re-enter your password"
                            autoComplete="new-password"
                            required
                            disabled={loading}
                        />
                        {validationErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Account...
                            </span>
                        ) : 'Create Admin Account'}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <p className="text-gray-600 text-sm">
                        Already have an account?
                    </p>
                    <button
                        onClick={() => navigate('/admin/login')}
                        className="mt-2 text-blue-600 font-medium hover:text-blue-800 hover:underline focus:outline-none"
                        disabled={loading}
                    >
                        Login here
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSetup;