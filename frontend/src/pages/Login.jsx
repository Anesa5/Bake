// Login.jsx - CORRECT VERSION
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post(
                'http://localhost:5000/api/auth/login', // CORRECT ENDPOINT
                { email, password }
            );

            console.log('Login response:', response.data);

            if (response.data.token && response.data.doctor) {
                // Save to localStorage
                localStorage.setItem('doctorId', response.data.doctor._id);
                localStorage.setItem('doctorToken', response.data.token);
                localStorage.setItem('doctorName', response.data.doctor.name);

                // Redirect to dashboard
                navigate('/doctor-dashboard');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div style={{
            maxWidth: '400px',
            margin: '50px auto',
            padding: '30px',
            border: '1px solid #ddd',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>
                Doctor Login
            </h2>

            {error && (
                <div style={{
                    background: '#ffebee',
                    color: '#c62828',
                    padding: '10px',
                    borderRadius: '5px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 'bold',
                        color: '#34495e'
                    }}>
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px'
                        }}
                        placeholder="Enter your email"
                    />
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 'bold',
                        color: '#34495e'
                    }}>
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px'
                        }}
                        placeholder="Enter your password"
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#2980b9'}
                    onMouseOut={(e) => e.target.style.background = '#3498db'}
                >
                    Login
                </button>
            </form>

            <div style={{
                textAlign: 'center',
                marginTop: '20px',
                color: '#7f8c8d'
            }}>
                <p>Don't have an account?
                    <a
                        href="/register"
                        style={{
                            color: '#3498db',
                            marginLeft: '5px',
                            textDecoration: 'none'
                        }}
                    >
                        Register here
                    </a>
                </p>
            </div>

            {/* Test button - remove after testing */}
            <div style={{
                marginTop: '20px',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '5px',
                textAlign: 'center'
            }}>
                <p style={{ marginBottom: '10px', fontSize: '14px' }}>
                    <strong>Test Credentials:</strong>
                </p>
                <button
                    onClick={() => {
                        setEmail('john@example.com');
                        setPassword('123456');
                    }}
                    style={{
                        padding: '8px 15px',
                        background: '#2ecc71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Use Test Account
                </button>
            </div>
        </div>
    );
}