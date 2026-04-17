// DoctorProfile.jsx - FINAL WORKING VERSION WITH SERVICES
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DoctorProfile.css';
import ReviewForm from './ReviewForm';
import ReviewsList from './ReviewsList';
import RatingStars from './RatingStars';

export default function DoctorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClinic, setSelectedClinic] = useState(0);
    const [selectedDay, setSelectedDay] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');
    const [reviews, setReviews] = useState([]); // ✅ Reviews state add kiya

    useEffect(() => {
        fetchDoctorProfile();
    }, [id]);

    // ✅ Function to calculate average rating from reviews
    const calculateAverageRating = (reviewsList) => {
        if (!reviewsList || reviewsList.length === 0) return 0;
        const sum = reviewsList.reduce((acc, review) => acc + (review.rating || 0), 0);
        return sum / reviewsList.length;
    };

    const fetchDoctorProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            // ✅ Dono calls ek saath karo - doctor profile aur reviews
            const [profileRes, reviewsRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/doctor-profile/${id}`),
                axios.get(`http://localhost:5000/api/reviews/doctor/${id}`)
            ]);

            console.log('📦 Profile Response:', profileRes.data);
            console.log('📦 Reviews Response:', reviewsRes.data);

            if (profileRes.data.success) {
                let doctorData = profileRes.data.data;

                // ✅ Reviews ko state mein save karo
                const reviewsData = reviewsRes.data.success ? reviewsRes.data.reviews || [] : [];
                setReviews(reviewsData);

                // ✅ Average rating calculate karo
                const avgRating = calculateAverageRating(reviewsData);
                const totalReviews = reviewsData.length;

                // ✅ Doctor object mein rating aur totalReviews update karo
                doctorData = {
                    ...doctorData,
                    rating: avgRating,
                    totalReviews: totalReviews,
                    reviews: reviewsData
                };

                console.log('👨‍⚕️ Updated Doctor Data:', doctorData);
                console.log('⭐ Calculated Rating:', avgRating);
                console.log('📊 Total Reviews:', totalReviews);

                setDoctor(doctorData);
            } else {
                setError(profileRes.data.message || 'Doctor not found');
            }
        } catch (error) {
            console.error('❌ Error fetching doctor profile:', error);
            setError(error.response?.data?.message || 'Failed to load doctor profile');
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = (doctorName, doctorTitle) => {
        const whatsappNumber = "03374768957";
        const message = `Hello! I would like to book an appointment with Dr. ${doctorName} (${doctorTitle}). Please let me know about available slots.`;
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, "_blank");
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading doctor profile...</p>
            </div>
        );
    }

    if (error || !doctor) {
        return (
            <div className="error-container">
                <div className="error-icon">🏥</div>
                <h2>{error || 'Doctor not found'}</h2>
                <p className="error-message">The doctor you're looking for doesn't exist or has been removed.</p>
                <button onClick={() => navigate('/')} className="back-home-btn">
                    ← Back to Home
                </button>
            </div>
        );
    }

    console.log('🔄 Rendering with services:', doctor.services);

    const yearsInPractice = doctor.experience ? parseInt(doctor.experience) : 0;
    const totalPatients = doctor.totalPatients || 0;
    const rating = doctor.rating || 0;
    const totalReviews = doctor.totalReviews || 0;
    const awardsCount = doctor.awards?.length || 0;
    const servicesCount = doctor.services?.length || 0;

    return (
        <div className="doctor-profile-container">
            {/* Header with Gradient */}
            <div className="profile-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    ← Back
                </button>

                <div className="header-content">
                    {/* Doctor Image with Badge */}
                    <div className="doctor-image-wrapper">
                        <div className="doctor-image">
                            {doctor.profileImage ? (
                                <img
                                    src={`http://localhost:5000${doctor.profileImage}`}
                                    alt={doctor.name}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentNode.innerHTML = '<div class="image-placeholder"><span class="placeholder-icon">👨‍⚕️</span></div>';
                                    }}
                                />
                            ) : (
                                <div className="image-placeholder">
                                    <span className="placeholder-icon">👨‍⚕️</span>
                                </div>
                            )}
                        </div>
                        {doctor.isVerified && (
                            <div className="verified-badge">
                                <span className="verified-icon">✓</span>
                                <span className="verified-text">Verified</span>
                            </div>
                        )}
                        {yearsInPractice > 0 && (
                            <div className="experience-badge">
                                <span className="experience-icon">⭐</span>
                                <span className="experience-text">{yearsInPractice}+ years</span>
                            </div>
                        )}
                    </div>

                    {/* Doctor Info */}
                    <div className="doctor-info">
                        <div className="name-section">
                            <h1>Dr. {doctor.name}</h1>
                            <div className="specialty-badges">
                                <span className="primary-specialty">
                                    {doctor.specialization || (doctor.category?.name) || 'Medical Specialist'}
                                </span>
                                {doctor.subSpecialties && doctor.subSpecialties.map((sub, idx) => (
                                    <span key={idx} className="sub-specialty">{sub}</span>
                                ))}
                            </div>
                        </div>

                        {doctor.qualification && (
                            <p className="qualification">{doctor.qualification}</p>
                        )}

                        <div className="doctor-metrics">
                            {totalPatients > 0 && (
                                <div className="metric-item">
                                    <span className="metric-icon">👥</span>
                                    <div className="metric-content">
                                        <span className="metric-value">{totalPatients.toLocaleString()}</span>
                                        <span className="metric-label">Patients</span>
                                    </div>
                                </div>
                            )}
                            {/* ✅ Dynamic Rating - Reviews se calculate ho raha hai */}
                            <div className="metric-item">
                                <span className="metric-icon">⭐</span>
                                <div className="metric-content">
                                    <span className="metric-value">{rating > 0 ? rating.toFixed(1) : '0'}</span>
                                    <span className="metric-label">Rating</span>
                                </div>
                            </div>
                            {/* ✅ Dynamic Reviews Count */}
                            <div className="metric-item">
                                <span className="metric-icon">📋</span>
                                <div className="metric-content">
                                    <span className="metric-value">{totalReviews > 0 ? totalReviews : '0'}</span>
                                    <span className="metric-label">Reviews</span>
                                </div>
                            </div>
                            {awardsCount > 0 && (
                                <div className="metric-item">
                                    <span className="metric-icon">🏆</span>
                                    <div className="metric-content">
                                        <span className="metric-value">{awardsCount}</span>
                                        <span className="metric-label">Awards</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="action-buttons">
                            <button onClick={() => handleBookAppointment(doctor.name, doctor.specialization)} className="book-btn">
                                <span className="btn-icon">📅</span>
                                Book Appointment
                            </button>
                            {doctor.freeConsultation && (
                                <button className="consult-btn">
                                    <span className="btn-icon">💬</span>
                                    Free Consultation
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="profile-tabs">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>

                {/* Services Tab - Shows only if services exist */}
                {servicesCount > 0 && (
                    <button
                        className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
                        onClick={() => setActiveTab('services')}
                    >
                        Services & Treatments ({servicesCount})
                    </button>
                )}

                {doctor.clinics && doctor.clinics.length > 0 && (
                    <button
                        className={`tab-btn ${activeTab === 'clinics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('clinics')}
                    >
                        Clinics & Availability
                    </button>
                )}
                {/* ✅ Reviews Tab - Sirf tab button show hoga, reviews sab case mein show hon ge */}
                <button
                    className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    Reviews {totalReviews > 0 ? `(${totalReviews})` : ''}
                </button>
            </div>

            {/* Main Content */}
            <div className="profile-content">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <>
                        {/* Left Column */}
                        <div className="left-column">
                            {/* About Section */}
                            {(doctor.bio || doctor.specialization) && (
                                <div className="info-card glass-effect">
                                    <h2>
                                        <span className="section-icon">📋</span>
                                        About Dr. {doctor.name}
                                    </h2>
                                    <div className="about-content">
                                        {doctor.bio && <p className="bio-text">{doctor.bio}</p>}

                                        {/* Specialization Details */}
                                        {(doctor.specialization || doctor.subSpecialties) && (
                                            <div className="specialization-details">
                                                <h3>Specialization Details</h3>
                                                <div className="specialization-grid">
                                                    {doctor.specialization && (
                                                        <div className="spec-item">
                                                            <span className="spec-icon">🔬</span>
                                                            <div>
                                                                <strong>Primary Focus</strong>
                                                                <p>{doctor.specialization}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {doctor.subSpecialties && doctor.subSpecialties.length > 0 && (
                                                        <div className="spec-item">
                                                            <span className="spec-icon">🏥</span>
                                                            <div>
                                                                <strong>Sub Specialties</strong>
                                                                <p>{doctor.subSpecialties.join(', ')}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Services Preview */}
                                        {servicesCount > 0 && (
                                            <div className="services-preview">
                                                <h3>Services Offered</h3>
                                                <div className="preview-services">
                                                    {doctor.services.slice(0, 4).map((service, index) => (
                                                        <span key={index} className="preview-service-tag">
                                                            {typeof service === 'string' ? service : service.name}
                                                        </span>
                                                    ))}
                                                    {servicesCount > 4 && (
                                                        <span className="preview-service-tag more">
                                                            +{servicesCount - 4} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Education */}
                            {doctor.education && doctor.education.length > 0 && (
                                <div className="info-card glass-effect">
                                    <h2>
                                        <span className="section-icon">🎓</span>
                                        Education & Training
                                    </h2>
                                    <div className="timeline">
                                        {doctor.education.map((edu, index) => (
                                            <div key={index} className="timeline-item">
                                                <div className="timeline-dot"></div>
                                                <div className="timeline-content">
                                                    <h3>{edu.degree}</h3>
                                                    <p className="institution">{edu.university}</p>
                                                    {edu.year && <p className="timeline-year">{edu.year}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Awards & Recognitions */}
                            {doctor.awards && doctor.awards.length > 0 && (
                                <div className="info-card glass-effect">
                                    <h2>
                                        <span className="section-icon">🏆</span>
                                        Awards & Recognitions
                                    </h2>
                                    <div className="awards-grid">
                                        {doctor.awards.map((award, index) => (
                                            <div key={index} className="award-card">
                                                <div className="award-icon">🏅</div>
                                                <div className="award-details">
                                                    <h4>{award.name}</h4>
                                                    <p>{award.year} • {award.organization || 'Medical Association'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ✅ Rating Section - Overview mein bhi show ho */}
                            <div className="info-card glass-effect">
                                <h2>
                                    <span className="section-icon">⭐</span>
                                    Rating & Reviews
                                </h2>
                                <div className="rating-summary">
                                    <div className="rating-circle">
                                        <span className="rating-number">{rating > 0 ? rating.toFixed(1) : '0'}</span>
                                        <span className="rating-outof">/5</span>
                                    </div>
                                    <div className="rating-stats">
                                        <RatingStars rating={rating} showCount={false} />
                                        <p>Based on {totalReviews} patient {totalReviews === 1 ? 'review' : 'reviews'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="right-column">
                            {/* Quick Info Card */}
                            {(doctor.phone || doctor.email || doctor.languages) && (
                                <div className="info-card glass-effect quick-info">
                                    <h2>
                                        <span className="section-icon">⚡</span>
                                        Quick Information
                                    </h2>
                                    <div className="quick-info-grid">
                                        {doctor.phone && (
                                            <div className="quick-info-item">
                                                <span className="q-icon">📞</span>
                                                <div>
                                                    <label>Phone</label>
                                                    <p>{doctor.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                        {doctor.email && (
                                            <div className="quick-info-item">
                                                <span className="q-icon">✉️</span>
                                                <div>
                                                    <label>Email</label>
                                                    <p>{doctor.email}</p>
                                                </div>
                                            </div>
                                        )}
                                        {doctor.languages && doctor.languages.length > 0 && (
                                            <div className="quick-info-item">
                                                <span className="q-icon">🗣️</span>
                                                <div>
                                                    <label>Languages</label>
                                                    <p>{doctor.languages.join(', ')}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Languages */}
                            {doctor.languages && doctor.languages.length > 0 && (
                                <div className="info-card glass-effect">
                                    <h2>
                                        <span className="section-icon">🗣️</span>
                                        Languages Spoken
                                    </h2>
                                    <div className="languages-cloud">
                                        {doctor.languages.map((language, index) => (
                                            <span key={index} className="language-bubble">
                                                {language}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Memberships */}
                            {doctor.memberships && doctor.memberships.length > 0 && (
                                <div className="info-card glass-effect">
                                    <h2>
                                        <span className="section-icon">🪪</span>
                                        Professional Memberships
                                    </h2>
                                    <div className="membership-list">
                                        {doctor.memberships.map((membership, index) => (
                                            <div key={index} className="membership-item">
                                                <span className="membership-icon">✓</span>
                                                <span>{membership}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Services Overview Card */}
                            {servicesCount > 0 && (
                                <div className="info-card glass-effect">
                                    <h2>
                                        <span className="section-icon">🔧</span>
                                        Services Overview
                                    </h2>
                                    <div className="services-stats">
                                        <div className="stat-item">
                                            <span className="stat-number">{servicesCount}</span>
                                            <span className="stat-label">Total Services</span>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('services')}
                                            className="view-all-services-btn"
                                        >
                                            View All Services →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Services Tab */}
                {activeTab === 'services' && servicesCount > 0 && (
                    <div className="services-full">
                        <div className="info-card glass-effect">
                            <h2>
                                <span className="section-icon">🔧</span>
                                Services & Treatments
                            </h2>
                            <div className="services-grid">
                                {doctor.services.map((service, index) => {
                                    const serviceName = typeof service === 'string' ? service : service.name;
                                    const serviceDesc = typeof service === 'object' ? service.description : '';
                                    const servicePrice = typeof service === 'object' ? service.price : '';
                                    const serviceDuration = typeof service === 'object' ? service.duration : '';

                                    return (
                                        <div key={index} className="service-card">
                                            <div className="service-icon">
                                                {typeof service === 'object' && service.icon ? service.icon : '🏥'}
                                            </div>
                                            <h3>{serviceName}</h3>
                                            {serviceDesc && <p>{serviceDesc}</p>}
                                            {serviceDuration && (
                                                <div className="service-duration">
                                                    ⏱️ {serviceDuration} mins
                                                </div>
                                            )}
                                            {servicePrice && (
                                                <span className="service-price">
                                                    Rs. {servicePrice}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Clinics Tab */}
                {activeTab === 'clinics' && doctor.clinics && doctor.clinics.length > 0 && (
                    <div className="clinics-full">
                        <div className="info-card glass-effect">
                            <h2>
                                <span className="section-icon">🏥</span>
                                Available Clinics
                            </h2>

                            <div className="clinic-tabs-modern">
                                {doctor.clinics.map((clinic, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedClinic(index)}
                                        className={`clinic-tab-modern ${selectedClinic === index ? 'active' : ''}`}
                                    >
                                        <span className="clinic-tab-icon">🏥</span>
                                        <span className="clinic-tab-name">{clinic.clinicName || `Clinic ${index + 1}`}</span>
                                        {clinic.isPrimary && <span className="primary-badge">Primary</span>}
                                    </button>
                                ))}
                            </div>

                            {doctor.clinics[selectedClinic] && (
                                <div className="clinic-details-modern">
                                    <div className="clinic-header">
                                        <h3>{doctor.clinics[selectedClinic].clinicName || 'Main Clinic'}</h3>
                                        {doctor.clinics[selectedClinic].isOpenNow && (
                                            <span className="clinic-status">● Open Now</span>
                                        )}
                                    </div>

                                    <div className="clinic-info-grid">
                                        {doctor.clinics[selectedClinic].address && (
                                            <div className="clinic-info-item">
                                                <span className="info-icon">📍</span>
                                                <div>
                                                    <label>Address</label>
                                                    <p>{doctor.clinics[selectedClinic].address}</p>
                                                    {doctor.clinics[selectedClinic].city && (
                                                        <p className="city-state">
                                                            {doctor.clinics[selectedClinic].city}
                                                            {doctor.clinics[selectedClinic].state && `, ${doctor.clinics[selectedClinic].state}`}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {doctor.clinics[selectedClinic].phone && (
                                            <div className="clinic-info-item">
                                                <span className="info-icon">📞</span>
                                                <div>
                                                    <label>Contact</label>
                                                    <p>{doctor.clinics[selectedClinic].phone}</p>
                                                </div>
                                            </div>
                                        )}

                                        {doctor.clinics[selectedClinic].fee && (
                                            <div className="clinic-info-item">
                                                <span className="info-icon">💰</span>
                                                <div>
                                                    <label>Consultation Fee</label>
                                                    <p className="fee-amount">Rs. {doctor.clinics[selectedClinic].fee}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {doctor.clinics[selectedClinic].timings &&
                                        doctor.clinics[selectedClinic].timings.length > 0 && (
                                            <div className="timings-modern">
                                                <h4>Working Hours</h4>
                                                <div className="timings-grid">
                                                    {doctor.clinics[selectedClinic].timings.map((timing, index) => (
                                                        <div
                                                            key={index}
                                                            onClick={() => setSelectedDay(index)}
                                                            className={`timing-card ${selectedDay === index ? 'selected' : ''}`}
                                                        >
                                                            <span className="timing-day">{timing.day}</span>
                                                            <span className="timing-hours">
                                                                {timing.startTime} - {timing.endTime}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Reviews Tab - Ab saare reviews yahan show hon ge */}
                {activeTab === 'reviews' && (
                    <div className="reviews-full">
                        <div className="reviews-header">
                            <div className="rating-summary">
                                {rating > 0 ? (
                                    <>
                                        <div className="rating-circle">
                                            <span className="rating-number">{rating.toFixed(1)}</span>
                                            <span className="rating-outof">/5</span>
                                        </div>
                                        <div className="rating-stats">
                                            <RatingStars rating={rating} showCount={false} />
                                            <p>Based on {totalReviews} patient {totalReviews === 1 ? 'review' : 'reviews'}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="rating-circle">
                                            <span className="rating-number">0</span>
                                            <span className="rating-outof">/5</span>
                                        </div>
                                        <div className="rating-stats">
                                            <p>No reviews yet</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Review Form - Pehle form dikhao */}
                        <ReviewForm doctorId={doctor._id} onSuccess={fetchDoctorProfile} />

                        {/* Reviews List - Reviews yahan show hon ge */}
                        <ReviewsList doctorId={doctor._id} />
                    </div>
                )}
            </div>

            {/* All CSS Styles - Bilkul same */}
            <style>{`
                .spinner {
                    width: 60px;
                    height: 60px;
                    border: 5px solid rgba(52, 152, 219, 0.2);
                    border-top: 5px solid #3498db;
                    border-right: 5px solid #3498db;
                    border-radius: 50%;
                    animation: spin 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
                    box-shadow: 0 0 20px rgba(52, 152, 219, 0.3);
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .loading-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .loading-text {
                    color: white;
                    margin-top: 20px;
                    font-size: 1.2rem;
                    font-weight: 500;
                    letter-spacing: 1px;
                }

                .error-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    text-align: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .error-icon {
                    font-size: 6rem;
                    margin-bottom: 20px;
                    background: rgba(255,255,255,0.2);
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 4px solid rgba(255,255,255,0.3);
                }

                .error-container h2 {
                    font-size: 2.5rem;
                    margin-bottom: 15px;
                    font-weight: 800;
                }

                .error-message {
                    font-size: 1.2rem;
                    opacity: 0.9;
                    margin-bottom: 30px;
                    max-width: 500px;
                }

                .back-home-btn {
                    padding: 15px 40px;
                    background: white;
                    color: #667eea;
                    border: none;
                    border-radius: 50px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }

                .back-home-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 40px rgba(0,0,0,0.3);
                }

                .doctor-profile-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    min-height: 100vh;
                }

                .profile-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 30px;
                    padding: 40px;
                    color: white;
                    margin-bottom: 30px;
                    position: relative;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }

                .back-btn {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    padding: 12px 25px;
                    border-radius: 50px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 1rem;
                    font-weight: 500;
                    backdrop-filter: blur(10px);
                    transition: all 0.3s;
                    z-index: 10;
                }

                .back-btn:hover {
                    background: rgba(255,255,255,0.3);
                    transform: translateX(-5px);
                }

                .header-content {
                    display: flex;
                    align-items: center;
                    gap: 50px;
                    flex-wrap: wrap;
                    position: relative;
                }

                .doctor-image-wrapper {
                    position: relative;
                    flex-shrink: 0;
                }

                .doctor-image {
                    width: 250px;
                    height: 250px;
                    border-radius: 30px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                    border: 5px solid rgba(255,255,255,0.3);
                    transition: all 0.3s;
                }

                .doctor-image:hover {
                    transform: scale(1.02);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.4);
                }

                .doctor-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .image-placeholder {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .placeholder-icon {
                    font-size: 5rem;
                    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
                }

                .verified-badge {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    padding: 8px 15px;
                    border-radius: 50px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
                    border: 2px solid white;
                }

                .verified-icon {
                    font-size: 1rem;
                }

                .verified-text {
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .experience-badge {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    background: linear-gradient(135deg, #FFD700, #FFA500);
                    padding: 8px 15px;
                    border-radius: 50px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
                    border: 2px solid white;
                    color: #333;
                }

                .doctor-info {
                    flex: 1;
                }

                .name-section {
                    margin-bottom: 15px;
                }

                .name-section h1 {
                    font-size: 3rem;
                    margin: 0 0 10px 0;
                    font-weight: 800;
                    letter-spacing: -1px;
                    text-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }

                .specialty-badges {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .primary-specialty {
                    background: rgba(255,255,255,0.2);
                    padding: 8px 20px;
                    border-radius: 50px;
                    font-size: 1rem;
                    font-weight: 600;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.3);
                }

                .sub-specialty {
                    background: rgba(255,255,255,0.1);
                    padding: 8px 20px;
                    border-radius: 50px;
                    font-size: 0.9rem;
                    border: 1px solid rgba(255,255,255,0.2);
                }

                .qualification {
                    font-size: 1.2rem;
                    opacity: 0.95;
                    margin-bottom: 25px;
                    padding-left: 10px;
                    border-left: 4px solid rgba(255,255,255,0.5);
                }

                .doctor-metrics {
                    display: flex;
                    gap: 30px;
                    flex-wrap: wrap;
                    margin-bottom: 30px;
                }

                .metric-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .metric-icon {
                    font-size: 2rem;
                }

                .metric-content {
                    display: flex;
                    flex-direction: column;
                }

                .metric-value {
                    font-size: 1.8rem;
                    font-weight: 800;
                    line-height: 1.2;
                }

                .metric-label {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }

                .action-buttons {
                    display: flex;
                    gap: 15px;
                    flex-wrap: wrap;
                }

                .book-btn, .consult-btn {
                    padding: 15px 35px;
                    border: none;
                    border-radius: 50px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.3s;
                }

                .book-btn {
                    background: white;
                    color: #667eea;
                }

                .consult-btn {
                    background: rgba(255,255,255,0.2);
                    color: white;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.3);
                }

                .book-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 20px 30px rgba(0,0,0,0.2);
                }

                .consult-btn:hover {
                    background: rgba(255,255,255,0.3);
                    transform: translateY(-3px);
                }

                .btn-icon {
                    font-size: 1.2rem;
                }

                .profile-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 30px;
                    background: white;
                    padding: 10px;
                    border-radius: 60px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }

                .tab-btn {
                    flex: 1;
                    padding: 15px 25px;
                    border: none;
                    border-radius: 50px;
                    background: transparent;
                    color: #666;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .tab-btn.active {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
                }

                .profile-content {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 30px;
                }

                @media (max-width: 992px) {
                    .profile-content {
                        grid-template-columns: 1fr;
                    }
                }

                .info-card {
                    background: white;
                    border-radius: 30px;
                    padding: 35px;
                    margin-bottom: 30px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }

                .glass-effect {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                }

                .info-card h2 {
                    color: #2c3e50;
                    margin-bottom: 25px;
                    font-size: 1.8rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .section-icon {
                    font-size: 2rem;
                }

                .about-content {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }

                .bio-text {
                    line-height: 1.8;
                    color: #34495e;
                    font-size: 1.1rem;
                }

                .specialization-details {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    padding: 25px;
                    border-radius: 20px;
                }

                .specialization-details h3 {
                    color: #2c3e50;
                    margin-bottom: 20px;
                    font-size: 1.4rem;
                }

                .specialization-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }

                .spec-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
                }

                .spec-icon {
                    font-size: 2rem;
                }

                .spec-item strong {
                    display: block;
                    color: #2c3e50;
                    margin-bottom: 5px;
                }

                .spec-item p {
                    margin: 0;
                    color: #667eea;
                    font-weight: 500;
                }

                /* Services Preview */
                .services-preview {
                    margin-top: 20px;
                }

                .services-preview h3 {
                    color: #2c3e50;
                    font-size: 1.3rem;
                    margin-bottom: 15px;
                }

                .preview-services {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .preview-service-tag {
                    padding: 8px 16px;
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    border-radius: 30px;
                    color: #667eea;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .preview-service-tag.more {
                    background: #667eea;
                    color: white;
                }

                .timeline {
                    position: relative;
                }

                .timeline::before {
                    content: '';
                    position: absolute;
                    left: 20px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
                }

                .timeline-item {
                    position: relative;
                    padding-left: 60px;
                    margin-bottom: 30px;
                }

                .timeline-dot {
                    position: absolute;
                    left: 12px;
                    top: 0;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: 3px solid white;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
                }

                .timeline-content {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 15px;
                }

                .timeline-content h3 {
                    margin: 0 0 5px 0;
                    color: #2c3e50;
                }

                .institution {
                    color: #667eea;
                    margin: 0 0 5px 0;
                    font-weight: 500;
                }

                .timeline-year {
                    color: #95a5a6;
                    font-size: 0.9rem;
                    margin: 0;
                }

                .awards-grid {
                    display: grid;
                    gap: 15px;
                }

                .award-card {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 15px;
                    transition: all 0.3s;
                }

                .award-card:hover {
                    transform: translateX(10px);
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                }

                .award-icon {
                    font-size: 2.5rem;
                }

                .award-details h4 {
                    margin: 0 0 5px 0;
                    color: #2c3e50;
                }

                .award-details p {
                    margin: 0;
                    color: #667eea;
                    font-size: 0.9rem;
                }

                .quick-info {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .quick-info h2 {
                    color: white;
                }

                .quick-info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }

                .quick-info-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .q-icon {
                    font-size: 2rem;
                }

                .quick-info-item label {
                    display: block;
                    font-size: 0.9rem;
                    opacity: 0.8;
                    margin-bottom: 3px;
                }

                .quick-info-item p {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                }

                .languages-cloud {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                }

                .language-bubble {
                    padding: 12px 25px;
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    border-radius: 50px;
                    color: #2c3e50;
                    font-weight: 600;
                }

                .membership-list {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .membership-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 12px;
                    background: #f8f9fa;
                    border-radius: 12px;
                }

                .membership-icon {
                    color: #4CAF50;
                    font-weight: bold;
                }

                /* Services Stats */
                .services-stats {
                    text-align: center;
                }

                .stat-item {
                    margin-bottom: 20px;
                }

                .stat-number {
                    display: block;
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #667eea;
                    line-height: 1;
                }

                .stat-label {
                    color: #7f8c8d;
                    font-size: 0.9rem;
                }

                .view-all-services-btn {
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .view-all-services-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
                }

                /* Services Grid */
                .services-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 25px;
                }

                .service-card {
                    padding: 25px;
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    border-radius: 20px;
                    text-align: center;
                    transition: all 0.3s;
                    border: 1px solid rgba(255,255,255,0.5);
                }

                .service-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(102, 126, 234, 0.15);
                }

                .service-icon {
                    font-size: 3rem;
                    margin-bottom: 15px;
                }

                .service-card h3 {
                    color: #2c3e50;
                    margin-bottom: 10px;
                    font-size: 1.3rem;
                }

                .service-card p {
                    color: #7f8c8d;
                    font-size: 0.95rem;
                    margin-bottom: 15px;
                    line-height: 1.6;
                }

                .service-duration {
                    color: #667eea;
                    font-size: 0.9rem;
                    margin-bottom: 10px;
                    font-weight: 500;
                }

                .service-price {
                    display: inline-block;
                    padding: 8px 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 30px;
                    font-weight: 600;
                    font-size: 1.1rem;
                }

                .clinic-tabs-modern {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 30px;
                    flex-wrap: wrap;
                }

                .clinic-tab-modern {
                    flex: 1;
                    min-width: 200px;
                    padding: 20px;
                    background: #f8f9fa;
                    border: none;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    position: relative;
                }

                .clinic-tab-modern.active {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    box-shadow: 0 15px 30px rgba(102, 126, 234, 0.3);
                }

                .clinic-tab-icon {
                    font-size: 2rem;
                }

                .clinic-tab-name {
                    font-weight: 600;
                }

                .primary-badge {
                    position: absolute;
                    top: -5px;
                    right: 10px;
                    background: #FFD700;
                    color: #333;
                    padding: 3px 10px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .clinic-details-modern {
                    padding: 30px;
                    background: #f8f9fa;
                    border-radius: 20px;
                }

                .clinic-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }

                .clinic-header h3 {
                    color: #2c3e50;
                    font-size: 1.5rem;
                }

                .clinic-status {
                    color: #4CAF50;
                    font-weight: 600;
                    background: rgba(76, 175, 80, 0.1);
                    padding: 5px 15px;
                    border-radius: 25px;
                }

                .clinic-info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .clinic-info-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 15px;
                }

                .info-icon {
                    font-size: 1.5rem;
                }

                .clinic-info-item label {
                    display: block;
                    color: #7f8c8d;
                    font-size: 0.9rem;
                    margin-bottom: 5px;
                }

                .clinic-info-item p {
                    margin: 0;
                    color: #2c3e50;
                    font-weight: 500;
                }

                .city-state {
                    font-size: 0.9rem;
                    color: #95a5a6 !important;
                }

                .fee-amount {
                    color: #27ae60 !important;
                    font-size: 1.2rem !important;
                    font-weight: 700 !important;
                }

                .timings-modern {
                    margin-top: 30px;
                }

                .timings-modern h4 {
                    color: #2c3e50;
                    margin-bottom: 20px;
                }

                .timings-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 15px;
                }

                .timing-card {
                    padding: 15px;
                    background: white;
                    border-radius: 15px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: 2px solid transparent;
                    position: relative;
                }

                .timing-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }

                .timing-card.selected {
                    border-color: #667eea;
                    background: rgba(102, 126, 234, 0.05);
                }

                .timing-day {
                    display: block;
                    font-weight: 600;
                    color: #2c3e50;
                    margin-bottom: 5px;
                }

                .timing-hours {
                    color: #667eea;
                    font-weight: 500;
                }

                .reviews-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    background: white;
                    padding: 30px;
                    border-radius: 20px;
                }

                .rating-summary {
                    display: flex;
                    align-items: center;
                    gap: 30px;
                }

                .rating-circle {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .rating-number {
                    font-size: 2.5rem;
                    font-weight: 800;
                    line-height: 1;
                }

                .rating-outof {
                    font-size: 1rem;
                    opacity: 0.9;
                }

                .rating-stats .stars {
                    color: #FFD700;
                    font-size: 1.5rem;
                    margin-bottom: 5px;
                }

                .rating-stats p {
                    color: #7f8c8d;
                    margin: 0;
                }

                .write-review-btn {
                    padding: 12px 25px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 50px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    transition: all 0.3s;
                }

                .write-review-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
                }

                .reviews-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .review-card {
                    background: white;
                    padding: 25px;
                    border-radius: 20px;
                }

                .reviewer-info {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 15px;
                    position: relative;
                }

                .reviewer-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }

                .reviewer-info h4 {
                    margin: 0 0 5px 0;
                    color: #2c3e50;
                }

                .review-rating {
                    color: #FFD700;
                }

                .review-date {
                    position: absolute;
                    right: 0;
                    top: 0;
                    color: #95a5a6;
                    font-size: 0.9rem;
                }

                .review-text {
                    color: #34495e;
                    line-height: 1.6;
                    margin-bottom: 15px;
                }

                .review-tags {
                    display: flex;
                    gap: 10px;
                }

                .review-tag {
                    padding: 5px 12px;
                    background: #f0f7ff;
                    color: #667eea;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    .header-content {
                        flex-direction: column;
                        text-align: center;
                        padding-top: 50px;
                    }

                    .doctor-metrics {
                        justify-content: center;
                    }

                    .action-buttons {
                        justify-content: center;
                    }

                    .profile-tabs {
                        flex-wrap: wrap;
                    }

                    .specialization-grid {
                        grid-template-columns: 1fr;
                    }

                    .clinic-info-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}