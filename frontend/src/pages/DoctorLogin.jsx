// pages/DoctorLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const DoctorLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authAPI.login({
                ...formData,
                userType: 'doctor'
            });

            // Store token and user info
            localStorage.setItem('doctorToken', response.token);
            localStorage.setItem('doctorId', response.user.id);
            localStorage.setItem('doctorName', response.user.name);

            // Redirect to doctor dashboard
            navigate('/doctor-dashboard');
        } catch (error) {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Doctor Login</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <div className="auth-links">
                        <p>
                            Don't have an account?{' '}
                            <Link to="/doctor/register">Register as Doctor</Link>
                        </p>
                        <p>
                            Are you a patient?{' '}
                            <Link to="/login">Patient Login</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DoctorLogin;