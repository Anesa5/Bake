import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function CategoryDoctors() {
    const { categoryName } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showDoctorModal, setShowDoctorModal] = useState(false);

    useEffect(() => {
        if (categoryName) {
            fetchCategoryDoctors(categoryName);
        }
    }, [categoryName]);

    const fetchCategoryDoctors = async (name) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:5000/api/home/category/${encodeURIComponent(name)}`
            );

            if (response.data.success) {
                setCategory(response.data.category);
                setDoctors(response.data.doctors);
            }
        } catch (error) {
            console.error('Error fetching category doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = (doctorName, doctorTitle) => {
        const whatsappNumber = "03374768957";
        const message = `Hello! I would like to book an appointment with ${doctorName} (${doctorTitle}). Please let me know about available slots.`;
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, "_blank");
    };

    const handleDoctorClick = (doctor) => {
        setSelectedDoctor(doctor);
        setShowDoctorModal(true);
    };

    const closeDoctorModal = () => {
        setShowDoctorModal(false);
        setSelectedDoctor(null);
    };

    if (loading) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <div style={{
                    display: 'inline-block',
                    width: '50px',
                    height: '50px',
                    border: '5px solid #f3f3f3',
                    borderTop: '5px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <h3 style={{ marginTop: '20px', color: '#2c3e50' }}>
                    Loading {categoryName} specialists...
                </h3>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            minHeight: '80vh'
        }}>
            {/* Back Button */}
            <Link to="/" style={{
                display: 'inline-block',
                marginBottom: '20px',
                color: '#3498db',
                textDecoration: 'none',
                fontSize: '1rem'
            }}>
                ← Back to Home
            </Link>

            {/* Category Header */}
            {category && (
                <div style={{
                    background: category.color,
                    color: 'white',
                    padding: '40px',
                    borderRadius: '15px',
                    textAlign: 'center',
                    marginBottom: '40px'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
                        {category.icon}
                    </div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        margin: '0 0 10px 0'
                    }}>
                        {category.name} Specialists
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        margin: '0 0 20px 0',
                        opacity: 0.9
                    }}>
                        {category.description}
                    </p>
                    <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        padding: '8px 25px',
                        borderRadius: '25px',
                        fontSize: '1.1rem',
                        display: 'inline-block'
                    }}>
                        {doctors.length} Verified Doctor{doctors.length !== 1 ? 's' : ''} Available
                    </div>
                </div>
            )}

            {/* Doctors List */}
            {doctors.length === 0 ? (
                <div style={{
                    background: '#f8f9fa',
                    padding: '50px 30px',
                    borderRadius: '15px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👨‍⚕️</div>
                    <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>
                        No doctors available in {categoryName}
                    </h3>
                    <p style={{ color: '#7f8c8d', marginBottom: '25px' }}>
                        There are currently no verified doctors in this specialty.
                    </p>
                    <Link to="/" style={{
                        display: 'inline-block',
                        padding: '12px 30px',
                        background: '#3498db',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontSize: '16px'
                    }}>
                        Browse All Specialties
                    </Link>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '25px'
                }}>
                    {doctors.map(doctor => (
                        <div
                            key={doctor._id}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleDoctorClick(doctor)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
                            }}
                        >
                            <div style={{
                                background: category?.color || '#3498db',
                                padding: '25px',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {doctor.profileImage ? (
                                    <img
                                        src={`http://localhost:5000${doctor.profileImage}`}
                                        alt={doctor.name}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            marginRight: '20px',
                                            border: '3px solid rgba(255,255,255,0.3)'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2.5rem',
                                        marginRight: '20px',
                                        border: '3px solid rgba(255,255,255,0.3)'
                                    }}>
                                        👨‍⚕️
                                    </div>
                                )}
                                <div>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>
                                        {doctor.name}
                                    </h3>
                                    <p style={{ margin: '0', opacity: 0.9, fontSize: '1rem' }}>
                                        {doctor.qualification}
                                    </p>
                                </div>
                            </div>

                            <div style={{ padding: '25px' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '15px'
                                    }}>
                                        <div>
                                            <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                                                📞 Contact
                                            </div>
                                            <div style={{ color: '#2c3e50', fontSize: '1.1rem' }}>
                                                {doctor.phone}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                                                ⭐ Experience
                                            </div>
                                            <div style={{ color: '#2c3e50', fontSize: '1.1rem' }}>
                                                {doctor.experience}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '5px' }}>
                                            🏥 Clinic Address
                                        </div>
                                        <div style={{ color: '#2c3e50', lineHeight: '1.5' }}>
                                            {doctor.clinicAddress}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click when clicking button
                                        handleBookAppointment(doctor.name, doctor.specialization);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: category?.color || '#3498db',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'opacity 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                                >
                                    📅 Book Appointment
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Doctor Profile Modal */}
            {showDoctorModal && selectedDoctor && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px',
                        overflowY: 'auto'
                    }}
                    onClick={closeDoctorModal}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            maxWidth: '900px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            position: 'relative',
                            animation: 'modalSlideIn 0.3s ease'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeDoctorModal}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'rgba(0,0,0,0.1)',
                                border: 'none',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                fontSize: '24px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#666',
                                zIndex: 10,
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(0,0,0,0.2)';
                                e.target.style.color = '#333';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(0,0,0,0.1)';
                                e.target.style.color = '#666';
                            }}
                        >
                            ×
                        </button>

                        {/* Doctor Profile Header */}
                        <div style={{
                            background: `linear-gradient(135deg, ${category?.color || '#3498db'}, ${category?.color || '#3498db'}dd)`,
                            padding: '40px 30px',
                            color: 'white',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '150px',
                                height: '150px',
                                borderRadius: '50%',
                                margin: '0 auto 20px',
                                overflow: 'hidden',
                                border: '5px solid rgba(255,255,255,0.3)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                            }}>
                                {selectedDoctor.profileImage ? (
                                    <img
                                        src={`http://localhost:5000${selectedDoctor.profileImage}`}
                                        alt={selectedDoctor.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        background: 'rgba(255,255,255,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '4rem'
                                    }}>
                                        👨‍⚕️
                                    </div>
                                )}
                            </div>
                            <h2 style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>
                                Dr. {selectedDoctor.name}
                            </h2>
                            <p style={{ fontSize: '1.2rem', opacity: 0.9, margin: '0 0 5px 0' }}>
                                {selectedDoctor.specialization}
                            </p>
                            <p style={{ fontSize: '1rem', opacity: 0.8, margin: '0' }}>
                                {selectedDoctor.qualification}
                            </p>
                        </div>

                        {/* Doctor Profile Body */}
                        <div style={{ padding: '30px' }}>
                            {/* About Section */}
                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    color: '#2c3e50',
                                    margin: '0 0 15px 0',
                                    paddingBottom: '10px',
                                    borderBottom: `2px solid ${category?.color || '#3498db'}30`
                                }}>
                                    About Dr. {selectedDoctor.name}
                                </h3>
                                <p style={{
                                    color: '#34495e',
                                    lineHeight: '1.8',
                                    fontSize: '1.1rem',
                                    margin: '0'
                                }}>
                                    {selectedDoctor.bio || `Dr. ${selectedDoctor.name} is a highly qualified ${selectedDoctor.specialization} specialist with extensive experience in treating various medical conditions. Dedicated to providing the highest quality healthcare with compassion and expertise.`}
                                </p>
                            </div>

                            {/* Quick Info Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '20px',
                                marginBottom: '30px'
                            }}>
                                <div style={{
                                    background: '#f8f9fa',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📞</div>
                                    <div style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '5px' }}>
                                        Phone
                                    </div>
                                    <div style={{ color: '#2c3e50', fontSize: '1.2rem', fontWeight: '600' }}>
                                        {selectedDoctor.phone}
                                    </div>
                                </div>

                                <div style={{
                                    background: '#f8f9fa',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📧</div>
                                    <div style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '5px' }}>
                                        Email
                                    </div>
                                    <div style={{ color: '#2c3e50', fontSize: '1.2rem', fontWeight: '600' }}>
                                        {selectedDoctor.email || 'Not provided'}
                                    </div>
                                </div>

                                <div style={{
                                    background: '#f8f9fa',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⭐</div>
                                    <div style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '5px' }}>
                                        Experience
                                    </div>
                                    <div style={{ color: '#2c3e50', fontSize: '1.2rem', fontWeight: '600' }}>
                                        {selectedDoctor.experience}
                                    </div>
                                </div>

                                <div style={{
                                    background: '#f8f9fa',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🏥</div>
                                    <div style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '5px' }}>
                                        Patients Treated
                                    </div>
                                    <div style={{ color: '#2c3e50', fontSize: '1.2rem', fontWeight: '600' }}>
                                        5000+
                                    </div>
                                </div>
                            </div>

                            {/* Education & Qualifications */}
                            {selectedDoctor.education && selectedDoctor.education.length > 0 && (
                                <div style={{ marginBottom: '30px' }}>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        color: '#2c3e50',
                                        margin: '0 0 15px 0',
                                        paddingBottom: '10px',
                                        borderBottom: `2px solid ${category?.color || '#3498db'}30`
                                    }}>
                                        Education & Qualifications
                                    </h3>
                                    <div style={{
                                        display: 'grid',
                                        gap: '15px'
                                    }}>
                                        {selectedDoctor.education.map((edu, index) => (
                                            <div key={index} style={{
                                                background: '#f8f9fa',
                                                padding: '15px',
                                                borderRadius: '10px',
                                                borderLeft: `4px solid ${category?.color || '#3498db'}`
                                            }}>
                                                <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
                                                    {edu.degree}
                                                </h4>
                                                <p style={{ margin: '0', color: '#7f8c8d' }}>
                                                    {edu.university} • {edu.year}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Services */}
                            {selectedDoctor.services && selectedDoctor.services.length > 0 && (
                                <div style={{ marginBottom: '30px' }}>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        color: '#2c3e50',
                                        margin: '0 0 15px 0',
                                        paddingBottom: '10px',
                                        borderBottom: `2px solid ${category?.color || '#3498db'}30`
                                    }}>
                                        Services & Specializations
                                    </h3>
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '10px'
                                    }}>
                                        {selectedDoctor.services.map((service, index) => (
                                            <span key={index} style={{
                                                background: `${category?.color || '#3498db'}10`,
                                                color: category?.color || '#3498db',
                                                padding: '8px 16px',
                                                borderRadius: '25px',
                                                fontSize: '0.9rem',
                                                fontWeight: '500'
                                            }}>
                                                {service}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Languages Spoken */}
                            {selectedDoctor.languages && selectedDoctor.languages.length > 0 && (
                                <div style={{ marginBottom: '30px' }}>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        color: '#2c3e50',
                                        margin: '0 0 15px 0',
                                        paddingBottom: '10px',
                                        borderBottom: `2px solid ${category?.color || '#3498db'}30`
                                    }}>
                                        Languages Spoken
                                    </h3>
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '10px'
                                    }}>
                                        {selectedDoctor.languages.map((language, index) => (
                                            <span key={index} style={{
                                                background: '#f8f9fa',
                                                color: '#2c3e50',
                                                padding: '8px 16px',
                                                borderRadius: '25px',
                                                fontSize: '0.9rem',
                                                border: '1px solid #e1e5eb'
                                            }}>
                                                {language}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Clinic Location */}
                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    color: '#2c3e50',
                                    margin: '0 0 15px 0',
                                    paddingBottom: '10px',
                                    borderBottom: `2px solid ${category?.color || '#3498db'}30`
                                }}>
                                    Clinic Location
                                </h3>
                                <div style={{
                                    background: '#f8f9fa',
                                    padding: '20px',
                                    borderRadius: '12px'
                                }}>
                                    <div style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: '#2c3e50' }}>Address:</strong>
                                        <p style={{ color: '#34495e', margin: '5px 0 0 0' }}>
                                            {selectedDoctor.clinicAddress || 'Address not specified'}
                                        </p>
                                    </div>
                                    {selectedDoctor.clinicTimings && selectedDoctor.clinicTimings.length > 0 && (
                                        <div>
                                            <strong style={{ color: '#2c3e50' }}>Working Hours:</strong>
                                            <div style={{ marginTop: '10px' }}>
                                                {selectedDoctor.clinicTimings.map((timing, index) => (
                                                    <div key={index} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        padding: '8px 0',
                                                        borderBottom: index < selectedDoctor.clinicTimings.length - 1 ? '1px dashed #e1e5eb' : 'none'
                                                    }}>
                                                        <span style={{ color: '#7f8c8d' }}>{timing.day}</span>
                                                        <span style={{ color: '#2c3e50', fontWeight: '500' }}>
                                                            {timing.startTime} - {timing.endTime}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{
                                display: 'flex',
                                gap: '15px',
                                marginTop: '30px'
                            }}>
                                <button
                                    onClick={() => {
                                        closeDoctorModal();
                                        handleBookAppointment(selectedDoctor.name, selectedDoctor.specialization);
                                    }}
                                    style={{
                                        flex: 2,
                                        padding: '15px',
                                        background: category?.color || '#3498db',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    📅 Book Appointment
                                </button>
                                <button
                                    onClick={closeDoctorModal}
                                    style={{
                                        flex: 1,
                                        padding: '15px',
                                        background: 'white',
                                        color: '#666',
                                        border: '2px solid #e1e5eb',
                                        borderRadius: '10px',
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = '#f8f9fa';
                                        e.target.style.borderColor = '#ccc';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'white';
                                        e.target.style.borderColor = '#e1e5eb';
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}