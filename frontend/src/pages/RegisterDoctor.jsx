// RegisterDoctor.jsx - COMPLETE WORKING VERSION
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ServicesField from '../components/ServicesField';

export default function RegisterDoctor() {
    const navigate = useNavigate();

    // State for categories
    const [categories, setCategories] = useState([]);

    // State for form data
    const [formData, setFormData] = useState({
        fullName: '',           // ✅ FIXED: name → fullName
        email: '',
        password: '',
        phone: '',
        qualification: '',
        experience: '',
        clinicAddress: '',
        categoryName: '',        // ✅ FIXED: category → categoryName
        // Services field
        services: [],            // ✅ Empty array - no defaults
        newService: ''           // For input field
    });

    // State for file upload
    const [profileImage, setProfileImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch categories from API
    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Failed to load categories. Please refresh the page.');
        }
    };

    // Handle text input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError("");
    };

    // Add service function
    const addService = () => {
        if (formData.newService.trim()) {
            setFormData({
                ...formData,
                services: [...formData.services, formData.newService.trim()],
                newService: ''
            });
        }
    };

    // Remove service function
    const removeService = (index) => {
        const updatedServices = formData.services.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            services: updatedServices
        });
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setError('Please select a valid image file (JPG, PNG, GIF)');
                e.target.value = "";
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                e.target.value = "";
                return;
            }

            setProfileImage(file);
            setError("");

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Basic validation - ✅ FIXED field names
        const requiredFields = [
            'fullName', 'email', 'phone', 'password',
            'qualification', 'experience', 'clinicAddress', 'categoryName'
        ];

        for (let field of requiredFields) {
            if (!formData[field]?.trim()) {
                setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                setLoading(false);
                return;
            }
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        // Phone validation
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
            setError('Please enter a valid phone number (10-15 digits)');
            setLoading(false);
            return;
        }

        // Password validation
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            // Create FormData for file upload
            const formDataToSend = new FormData();

            // Append text fields - ✅ SIRF EK BAAR
            Object.keys(formData).forEach(key => {
                if (key === 'services') {
                    // Services ko JSON string bana kar bhejo
                    formDataToSend.append(key, JSON.stringify(formData[key]));
                    console.log('📦 Sending services:', JSON.stringify(formData[key]));
                } else if (key !== 'newService') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Append image file if selected
            if (profileImage) {
                formDataToSend.append('profileImage', profileImage);
            }

            // Debug - check karein services ja rahi hain
            console.log('🚀 FormData entries:');
            for (let pair of formDataToSend.entries()) {
                console.log(pair[0], pair[1]);
            }

            // Send registration request
            const res = await axios.post(
                "http://localhost:5000/api/auth/register-doctor",
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log('✅ Registration successful:', res.data);

            // Save doctor ID and token to localStorage
            if (res.data.doctor?._id) {
                localStorage.setItem('doctorId', res.data.doctor._id);
            }
            if (res.data.token) {
                localStorage.setItem('doctorToken', res.data.token);
            }

            alert(res.data.message || 'Doctor registered successfully!');

            // Redirect based on verification status
            if (res.data.doctor?.isVerified) {
                navigate('/doctor-dashboard');
            } else {
                alert('Your account is pending verification. You will be notified once verified.');
                navigate('/');
            }

        } catch (err) {
            console.error('❌ Registration error:', err);

            // Display appropriate error message
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.message === 'Network Error') {
                setError('Cannot connect to server. Please check your connection.');
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: '600px',
            margin: '40px auto',
            padding: '30px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{
                textAlign: 'center',
                marginBottom: '30px',
                color: '#2c3e50'
            }}>
                Doctor Registration
            </h2>

            {error && (
                <div style={{
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    padding: '12px',
                    borderRadius: '5px',
                    marginBottom: '20px',
                    border: '1px solid #ef9a9a'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Profile Picture Upload */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontWeight: 'bold',
                        color: '#34495e'
                    }}>
                        Profile Picture (Optional)
                    </label>

                    {preview && (
                        <div style={{
                            marginBottom: '15px',
                            textAlign: 'center'
                        }}>
                            <img
                                src={preview}
                                alt="Preview"
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    objectFit: 'cover',
                                    borderRadius: '50%',
                                    border: '3px solid #3498db',
                                    boxShadow: '0 4px 10px rgba(52, 152, 219, 0.3)'
                                }}
                            />
                        </div>
                    )}

                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif"
                        onChange={handleFileChange}
                        style={{
                            padding: '12px',
                            border: '2px dashed #bdc3c7',
                            borderRadius: '8px',
                            width: '100%',
                            backgroundColor: '#f8f9fa',
                            cursor: 'pointer'
                        }}
                    />
                    <small style={{
                        color: '#7f8c8d',
                        display: 'block',
                        marginTop: '8px',
                        fontSize: '14px'
                    }}>
                        Accepted formats: JPG, PNG, GIF (Max 5MB)
                    </small>
                </div>

                {/* Full Name */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#2c3e50'
                    }}>
                        Full Name *
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Dr. First Last"
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                        required
                    />
                </div>

                {/* Email */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#2c3e50'
                    }}>
                        Email Address *
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="doctor@example.com"
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                        required
                    />
                </div>

                {/* Phone */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#2c3e50'
                    }}>
                        Phone Number *
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="03XX-XXXXXXX"
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                        required
                    />
                </div>

                {/* Password */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#2c3e50'
                    }}>
                        Password *
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="At least 6 characters"
                        minLength="6"
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                        required
                    />
                </div>

                {/* Qualification */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#2c3e50'
                    }}>
                        Qualification *
                    </label>
                    <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        placeholder="MBBS, MD, FCPS, etc."
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                        required
                    />
                </div>

                {/* Experience */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#2c3e50'
                    }}>
                        Experience (Years) *
                    </label>
                    <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        placeholder="Number of years"
                        min="0"
                        max="50"
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                        required
                    />
                </div>

                {/* Clinic Address */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#2c3e50'
                    }}>
                        Clinic Address *
                    </label>
                    <textarea
                        name="clinicAddress"
                        value={formData.clinicAddress}
                        onChange={handleChange}
                        placeholder="Full clinic address with city"
                        rows="3"
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px',
                            boxSizing: 'border-box',
                            resize: 'vertical'
                        }}
                        required
                    />
                </div>

                {/* Category Selection */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#2c3e50'
                    }}>
                        Specialization *
                    </label>
                    <select
                        name="categoryName"
                        value={formData.categoryName}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px',
                            backgroundColor: '#fff',
                            boxSizing: 'border-box'
                        }}
                        required
                    >
                        <option value="">Select your specialization</option>
                        {categories.length > 0 ? (
                            categories.map(cat => (
                                <option key={cat._id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>Loading categories...</option>
                        )}
                    </select>
                </div>

                {/* Services Field Component */}
                <ServicesField
                    services={formData.services}
                    newService={formData.newService}
                    onAddService={addService}
                    onRemoveService={removeService}
                    onNewServiceChange={(value) => setFormData({ ...formData, newService: value })}
                />

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '15px',
                        backgroundColor: loading ? '#95a5a6' : '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.3s',
                        marginBottom: '15px'
                    }}
                    onMouseOver={(e) => {
                        if (!loading) e.target.style.backgroundColor = '#2980b9';
                    }}
                    onMouseOut={(e) => {
                        if (!loading) e.target.style.backgroundColor = '#3498db';
                    }}
                >
                    {loading ? (
                        <>
                            <span style={{
                                display: 'inline-block',
                                width: '20px',
                                height: '20px',
                                border: '3px solid rgba(255,255,255,0.3)',
                                borderTop: '3px solid white',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                marginRight: '10px'
                            }}></span>
                            Registering...
                        </>
                    ) : (
                        'Register Now'
                    )}
                </button>

                {/* Cancel Button */}
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    style={{
                        width: '100%',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        color: '#6c757d',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#e9ecef'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                >
                    Cancel
                </button>

                {/* Login Link */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid #eee'
                }}>
                    <p style={{ color: '#7f8c8d' }}>
                        Already have an account?{' '}
                        <a
                            href="/login"
                            style={{
                                color: '#3498db',
                                textDecoration: 'none',
                                fontWeight: '600'
                            }}
                        >
                            Login here
                        </a>
                    </p>
                </div>
            </form>

            {/* CSS for spinner */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}