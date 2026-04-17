// AdminLogin.jsx - Fixed version with token debugging
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Function to decode JWT token
    const decodeToken = (token) => {
        try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                return payload;
            }
        } catch (err) {
            console.error('Error decoding token:', err);
        }
        return null;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('=== LOGIN START ===');
            console.log('Email:', email);

            const response = await axios.post(
                'http://localhost:5000/api/admin/auth/login',
                { email, password },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('=== LOGIN RESPONSE ===');
            console.log('Full response:', response.data);
            console.log('Success:', response.data.success);

            if (response.data.success) {
                // Decode and check token
                const token = response.data.token;
                const decoded = decodeToken(token);

                console.log('=== TOKEN ANALYSIS ===');
                console.log('Token:', token.substring(0, 50) + '...');
                console.log('Decoded payload:', decoded);
                console.log('Token role:', decoded?.role);
                console.log('Token id:', decoded?.id);
                console.log('Token expires:', decoded?.exp ? new Date(decoded.exp * 1000) : 'N/A');

                // Store token and admin data
                localStorage.setItem('token', token);
                localStorage.setItem('admin', JSON.stringify(response.data.admin));

                console.log('=== REDIRECTING ===');
                console.log('Token saved to localStorage');
                console.log('Admin data saved:', response.data.admin);

                // Redirect to admin dashboard
                navigate('/admin/dashboard');
            } else {
                console.log('Login failed - success is false');
                setError(response.data.message || 'Login failed');
            }
        } catch (err) {
            console.error('=== LOGIN ERROR ===');
            console.error('Error object:', err);
            console.error('Error message:', err.message);
            console.error('Error response:', err.response);
            console.error('Error status:', err.response?.status);

            if (err.response) {
                setError(err.response.data?.message || `Login failed (${err.response.status})`);
            } else if (err.request) {
                console.error('No response received');
                setError('No response from server. Please check if backend is running on port 5000.');
            } else {
                setError('Login failed: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Login</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <strong>Error: </strong>{error}

                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="admin@example.com"
                            autoComplete="email"
                            required
                            autoFocus
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter password"
                            autoComplete="current-password"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-900 disabled:bg-gray-700 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </>
                        ) : 'Login'}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200">


                    <div className="mt-4 text-center">
                        <button
                            onClick={() => {
                                console.log('=== DEBUG INFO ===');
                                console.log('LocalStorage token:', localStorage.getItem('token'));
                                console.log('LocalStorage admin:', localStorage.getItem('admin'));
                                const token = localStorage.getItem('token');
                                if (token) {
                                    const decoded = decodeToken(token);
                                    console.log('Current token decoded:', decoded);
                                }
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;