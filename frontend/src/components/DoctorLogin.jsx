// DoctorLogin.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const DoctorLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
            const response = await axios.post('http://localhost:5000/api/doctor/login', formData);

            if (response.data.success) {
                // Save token
                localStorage.setItem('doctorToken', response.data.token);
                localStorage.setItem('doctorData', JSON.stringify(response.data.doctor));

                // Redirect to dashboard
                navigate('/doctor/dashboard');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Doctor Login</h2>
                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="login-btn">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Don't have an account? <Link to="/doctor/register">Register here</Link></p>
                    <p><Link to="/doctor/forgot-password">Forgot Password?</Link></p>
                </div>
            </div>

            <style jsx>{`
                .login-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .login-card {
                    background: white;
                    padding: 40px;
                    border-radius: 15px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    width: 100%;
                    max-width: 400px;
                }

                .login-card h2 {
                    text-align: center;
                    color: #2c3e50;
                    margin-bottom: 30px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: #34495e;
                    font-weight: 600;
                }

                .form-group input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 1rem;
                }

                .login-btn {
                    width: 100%;
                    padding: 14px;
                    background: #3498db;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 1rem;
                    cursor: pointer;
                    margin-top: 10px;
                }

                .login-btn:disabled {
                    background: #bdc3c7;
                    cursor: not-allowed;
                }

                .error-message {
                    background: #fee;
                    color: #c33;
                    padding: 10px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .login-footer {
                    margin-top: 25px;
                    text-align: center;
                    color: #7f8c8d;
                }

                .login-footer a {
                    color: #3498db;
                    text-decoration: none;
                }

                .login-footer a:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
};

export default DoctorLogin;