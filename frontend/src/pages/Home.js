// pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import axios from "axios";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [categoriesWithDoctors, setCategoriesWithDoctors] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Dummy doctors data for search
  const allDoctors = [
    // Cardiology
    { _id: '101', name: 'Dr. John Smith', qualification: 'MD, FACC', specialization: 'Cardiology', experience: '15 years', phone: '03001234567', city: 'Karachi', fee: 2000, category: 'Cardiology' },
    { _id: '102', name: 'Dr. Sarah Johnson', qualification: 'MD, Cardiology', specialization: 'Cardiology', experience: '10 years', phone: '03001234568', city: 'Lahore', fee: 1800, category: 'Cardiology' },
    { _id: '103', name: 'Dr. Michael Chen', qualification: 'MD, Cardiology', specialization: 'Cardiology', experience: '12 years', phone: '03001234569', city: 'Islamabad', fee: 2200, category: 'Cardiology' },
    { _id: '104', name: 'Dr. Emily Brown', qualification: 'MD, FACC', specialization: 'Cardiology', experience: '8 years', phone: '03001234570', city: 'Karachi', fee: 1500, category: 'Cardiology' },

    // Dermatology
    { _id: '201', name: 'Dr. Michael Brown', qualification: 'MD, Dermatology', specialization: 'Dermatology', experience: '12 years', phone: '03001234571', city: 'Karachi', fee: 2500, category: 'Dermatology' },
    { _id: '202', name: 'Dr. Lisa Anderson', qualification: 'MD, Dermatology', specialization: 'Dermatology', experience: '9 years', phone: '03001234572', city: 'Lahore', fee: 2000, category: 'Dermatology' },

    // Neurology
    { _id: '301', name: 'Dr. Robert Wilson', qualification: 'MD, Neurology', specialization: 'Neurology', experience: '20 years', phone: '03001234573', city: 'Karachi', fee: 3500, category: 'Neurology' },
    { _id: '302', name: 'Dr. Patricia Taylor', qualification: 'MD, Neurology', specialization: 'Neurology', experience: '15 years', phone: '03001234574', city: 'Lahore', fee: 3000, category: 'Neurology' },

    // Pediatrics
    { _id: '401', name: 'Dr. Sarah Williams', qualification: 'MD, Pediatrics', specialization: 'Pediatrics', experience: '12 years', phone: '03001234577', city: 'Karachi', fee: 1800, category: 'Pediatrics' },
    { _id: '402', name: 'Dr. David Lee', qualification: 'MD, Pediatrics', specialization: 'Pediatrics', experience: '8 years', phone: '03001234578', city: 'Lahore', fee: 1500, category: 'Pediatrics' },

    // Orthopedics
    { _id: '501', name: 'Dr. Thomas Anderson', qualification: 'MD, Orthopedics', specialization: 'Orthopedics', experience: '18 years', phone: '03001234579', city: 'Karachi', fee: 3200, category: 'Orthopedics' },
    { _id: '502', name: 'Dr. Maria Garcia', qualification: 'MD, Orthopedics', specialization: 'Orthopedics', experience: '14 years', phone: '03001234580', city: 'Lahore', fee: 2800, category: 'Orthopedics' },
  ];

  useEffect(() => {
    fetchCategoriesWithDoctors();
  }, []);

  const fetchCategoriesWithDoctors = async () => {
    try {
      // Try API first
      const categoriesRes = await axios.get('http://localhost:5000/api/home/categories');
      const doctorsRes = await axios.get('http://localhost:5000/api/home/doctors-by-category');

      if (categoriesRes.data.success && doctorsRes.data.success) {
        const combined = categoriesRes.data.categories.map(category => {
          const categoryDoctors = doctorsRes.data.data.find(
            item => item.category.name === category.name
          )?.doctors || [];

          return {
            ...category,
            doctors: categoryDoctors
          };
        });

        setCategoriesWithDoctors(combined);
        setFilteredCategories(combined);
      }
    } catch (error) {
      console.error('Error fetching data, using dummy data:', error);
      // Use dummy data if API fails
      const dummyCategories = [
        {
          _id: '1',
          name: 'Cardiology',
          description: 'Heart specialists',
          color: '#e74c3c',
          icon: '❤️',
          doctors: allDoctors.filter(d => d.category === 'Cardiology')
        },
        {
          _id: '2',
          name: 'Dermatology',
          description: 'Skin specialists',
          color: '#3498db',
          icon: '🧴',
          doctors: allDoctors.filter(d => d.category === 'Dermatology')
        },
        {
          _id: '3',
          name: 'Neurology',
          description: 'Brain specialists',
          color: '#2ecc71',
          icon: '🧠',
          doctors: allDoctors.filter(d => d.category === 'Neurology')
        },
        {
          _id: '4',
          name: 'Pediatrics',
          description: 'Child specialists',
          color: '#f39c12',
          icon: '👶',
          doctors: allDoctors.filter(d => d.category === 'Pediatrics')
        },
        {
          _id: '5',
          name: 'Orthopedics',
          description: 'Bone specialists',
          color: '#9b59b6',
          icon: '🦴',
          doctors: allDoctors.filter(d => d.category === 'Orthopedics')
        }
      ];
      setCategoriesWithDoctors(dummyCategories);
      setFilteredCategories(dummyCategories);
    } finally {
      setPageLoading(false);
    }
  };

  // Real-time category search
  const handleCategorySearch = (query) => {
    setSearchQuery(query);
    setShowSearchResults(false); // Hide doctor results when typing in search

    if (!query.trim()) {
      setFilteredCategories(categoriesWithDoctors);
      return;
    }

    const searchLower = query.toLowerCase();

    const exactMatches = categoriesWithDoctors.filter(category =>
      category.name.toLowerCase() === searchLower
    );

    const partialMatches = categoriesWithDoctors.filter(category =>
      category.name.toLowerCase().includes(searchLower) &&
      category.name.toLowerCase() !== searchLower
    );

    setFilteredCategories([...exactMatches, ...partialMatches]);
  };

  // Doctor search - ye function call hoga jab "Search Doctors" button click karein
  const handleDoctorSearch = (searchParams) => {
    setLoading(true);

    try {
      const query = searchParams.query?.toLowerCase() || '';
      const specialty = searchParams.specialty?.toLowerCase() || '';
      const city = searchParams.city?.toLowerCase() || '';
      const category = searchParams.category?.toLowerCase() || '';

      // Filter doctors based on search criteria
      let results = [...allDoctors];

      if (query) {
        results = results.filter(doctor =>
          doctor.name.toLowerCase().includes(query) ||
          doctor.specialization.toLowerCase().includes(query) ||
          doctor.category.toLowerCase().includes(query)
        );
      }

      if (specialty) {
        results = results.filter(doctor =>
          doctor.specialization.toLowerCase().includes(specialty)
        );
      }

      if (city) {
        results = results.filter(doctor =>
          doctor.city.toLowerCase().includes(city)
        );
      }

      if (category) {
        results = results.filter(doctor =>
          doctor.category.toLowerCase().includes(category)
        );
      }

      setSearchResults(results);
      setShowSearchResults(true);
      setShowAllDoctors(false);

      // Scroll to results
      setTimeout(() => {
        document.getElementById('search-results-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);

    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSearchResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllDoctors = (category) => {
    setSelectedCategory(category);
    setShowAllDoctors(true);
    setShowSearchResults(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCategories = () => {
    setShowAllDoctors(false);
    setShowSearchResults(false);
    setSelectedCategory(null);
    setSearchResults([]);
  };

  const handleBookAppointment = (doctorName, doctorTitle) => {
    const whatsappNumber = "03374768957";
    const message = `Hello! I would like to book an appointment with ${doctorName} (${doctorTitle}). Please let me know about available slots.`;
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
  };

  if (pageLoading) {
    return (
      <div className="loading-container">
        <div className="medical-loader">
          <div className="heart-beat"></div>
          <div className="pulse"></div>
        </div>
        <h3 className="loading-text">Loading your healthcare experience...</h3>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Floating Background Elements */}
      <div className="floating-elements">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
        <div className="cross cross-1">+</div>
        <div className="cross cross-2">+</div>
      </div>

      {/* HERO SECTION WITH SEARCH BAR */}
      <div className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">🏥 Trusted by 50,000+ Patients</span>
          <h1 className="hero-title">
            Find the Best <span className="gradient-text">Medical Specialists</span>
          </h1>
          <p className="hero-subtitle">
            Book appointments with certified doctors. Choose from our wide range of medical specialties.
          </p>

          {/* Search Bar Component */}
          <div className="search-wrapper">
            <SearchBar
              onSearch={handleDoctorSearch}
              onCategorySearch={handleCategorySearch}
              loading={loading}
            />
          </div>

          {loading && (
            <div className="searching-indicator">
              <div className="searching-spinner"></div>
              <span>Searching for doctors...</span>
            </div>
          )}

          {/* Search Results Count for Categories */}
          {searchQuery && !showSearchResults && !showAllDoctors && (
            <div className="search-results-info">
              Found <span className="highlight">{filteredCategories.length}</span> specialty
              {filteredCategories.length !== 1 ? 'ies' : ''} matching "{searchQuery}"
            </div>
          )}

          {/* Trust Indicators */}
          <div className="trust-indicators">
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              <span>100% Verified Doctors</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              <span>Instant Appointment</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH RESULTS SECTION - Jab doctor search karein to ye show ho */}
      {showSearchResults && (
        <div id="search-results-section" className="search-results-section">
          <div className="results-header">
            <div>
              <h2>Search Results</h2>
              <p className="results-count">
                Found {searchResults.length} doctor{searchResults.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button onClick={handleBackToCategories} className="back-btn">
              ← Back to Categories
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="no-results-found">
              <div className="no-results-icon">🔍</div>
              <h3>No doctors found</h3>
              <p>We couldn't find any doctors matching your search criteria.</p>
              <p className="suggestion-text">Try searching for:</p>
              <div className="suggestion-chips">
                <button onClick={() => handleDoctorSearch({ query: 'Cardiology' })} className="suggestion-chip">
                  Cardiology
                </button>
                <button onClick={() => handleDoctorSearch({ query: 'Karachi' })} className="suggestion-chip">
                  Karachi
                </button>
                <button onClick={() => handleDoctorSearch({ query: 'Dr. John' })} className="suggestion-chip">
                  Dr. John
                </button>
              </div>
            </div>
          ) : (
            <div className="all-doctors-grid">
              {searchResults.map((doctor, index) => (
                <div key={doctor._id} className="all-doctor-card" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="all-doctor-card-header" style={{ background: `linear-gradient(135deg, #4361ee, #3a0ca3)` }}>
                    <div className="all-doctor-avatar">
                      <div className="all-avatar-placeholder">
                        {doctor.name?.charAt(0)}
                      </div>
                    </div>
                    <h3>{doctor.name}</h3>
                    <p className="doctor-specialization">{doctor.specialization}</p>
                  </div>

                  <div className="all-doctor-card-body">
                    <div className="doctor-detail-item">
                      <span className="detail-label">Qualification</span>
                      <span className="detail-value">{doctor.qualification}</span>
                    </div>
                    <div className="doctor-detail-item">
                      <span className="detail-label">Experience</span>
                      <span className="detail-value">{doctor.experience}</span>
                    </div>
                    <div className="doctor-detail-item">
                      <span className="detail-label">Location</span>
                      <span className="detail-value">{doctor.city}</span>
                    </div>
                    <div className="doctor-detail-item">
                      <span className="detail-label">Contact</span>
                      <span className="detail-value">{doctor.phone}</span>
                    </div>
                    <div className="doctor-detail-item fee">
                      <span className="detail-label">Consultation Fee</span>
                      <span className="detail-value">Rs. {doctor.fee}</span>
                    </div>
                  </div>

                  <div className="all-doctor-card-actions">
                    <Link to={`/doctor-profile/${doctor._id}`} className="view-profile-full">
                      View Profile
                    </Link>
                    <button
                      className="book-appointment-full"
                      onClick={() => handleBookAppointment(doctor.name, doctor.specialization)}
                    >
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ALL DOCTORS VIEW - Jab category view all click karein */}
      {showAllDoctors && selectedCategory && !showSearchResults && (
        <div className="all-doctors-section">
          <div className="all-doctors-header">
            <div>
              <div className="header-icon">{selectedCategory.icon || '🏥'}</div>
              <h2>{selectedCategory.name} Doctors</h2>
              <p className="doctors-count-badge">
                {selectedCategory.doctors.length} Doctor{selectedCategory.doctors.length !== 1 ? 's' : ''} Available
              </p>
            </div>
            <button onClick={handleBackToCategories} className="back-btn">
              ← Back to Categories
            </button>
          </div>

          <div className="all-doctors-grid">
            {selectedCategory.doctors.map((doctor, index) => (
              <div key={doctor._id} className="all-doctor-card" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="all-doctor-card-header" style={{ background: `linear-gradient(135deg, ${selectedCategory.color || '#4361ee'} 0%, ${selectedCategory.color || '#3a0ca3'} 100%)` }}>
                  <div className="all-doctor-avatar">
                    {doctor.profileImage ? (
                      <img src={`http://localhost:5000${doctor.profileImage}`} alt={doctor.name} />
                    ) : (
                      <div className="all-avatar-placeholder">
                        {doctor.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3>{doctor.name}</h3>
                  <p className="doctor-specialization">{doctor.specialization || selectedCategory.name}</p>
                </div>

                <div className="all-doctor-card-body">
                  <div className="doctor-detail-item">
                    <span className="detail-label">Qualification</span>
                    <span className="detail-value">{doctor.qualification || 'Medical Specialist'}</span>
                  </div>
                  <div className="doctor-detail-item">
                    <span className="detail-label">Experience</span>
                    <span className="detail-value">{doctor.experience || '5+ years'}</span>
                  </div>
                  <div className="doctor-detail-item">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{doctor.city || 'Major City'}</span>
                  </div>
                  <div className="doctor-detail-item">
                    <span className="detail-label">Contact</span>
                    <span className="detail-value">{doctor.phone || '0300-1234567'}</span>
                  </div>
                  {doctor.fee && (
                    <div className="doctor-detail-item fee">
                      <span className="detail-label">Consultation Fee</span>
                      <span className="detail-value">Rs. {doctor.fee}</span>
                    </div>
                  )}
                </div>

                <div className="all-doctor-card-actions">
                  <Link to={`/doctor-profile/${doctor._id}`} className="view-profile-full">
                    View Profile
                  </Link>
                  <button
                    className="book-appointment-full"
                    onClick={() => handleBookAppointment(doctor.name, doctor.specialization)}
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORIES SECTION - Default view */}
      {!showAllDoctors && !showSearchResults && (
        <div className="categories-section">
          <div className="section-header">
            <span className="section-subtitle">Find Care</span>
            <h2>Browse Doctors by Specialty</h2>
            <p className="section-description">
              Choose from our wide range of medical specialties and find the right doctor for you
            </p>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="no-categories-found">
              <div className="no-results-icon">🔍</div>
              <h3>No specialties found</h3>
              <p>We couldn't find any medical specialty matching "{searchQuery}"</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilteredCategories(categoriesWithDoctors);
                }}
                className="clear-search-btn"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="categories-grid">
              {filteredCategories.map((category, index) => (
                <div
                  key={category._id}
                  className="category-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* CARD HEADER */}
                  <div className="card-header" style={{ background: `linear-gradient(135deg, ${category.color || '#4361ee'} 0%, ${category.color || '#3a0ca3'} 100%)` }}>
                    <div className="header-overlay"></div>
                    <div className="category-icon">{category.icon || '🏥'}</div>
                    <h3>{category.name}</h3>
                    <p>{category.description || 'Expert medical care'}</p>
                    <div className="doctors-count">
                      <span className="count-number">{category.doctors.length}</span>
                      <span>Doctor{category.doctors.length !== 1 ? 's' : ''} Available</span>
                    </div>
                  </div>

                  {/* CARD BODY */}
                  <div className="card-body">
                    <div className="category-description">
                      <p>Specialists in {category.name} providing comprehensive medical care for various conditions.</p>
                    </div>

                    {/* VIEW ALL DOCTORS BUTTON */}
                    {category.doctors.length > 0 ? (
                      <button
                        onClick={() => handleViewAllDoctors(category)}
                        className="view-all-btn"
                        style={{
                          background: `linear-gradient(135deg, ${category.color}20, ${category.color}05)`,
                          color: category.color,
                          borderColor: category.color
                        }}
                      >
                        <span>View All {category.doctors.length} {category.name} Doctors</span>
                        <span className="arrow">→</span>
                      </button>
                    ) : (
                      <div className="no-doctors-available">
                        <p>No doctors available in this specialty yet</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .homepage {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #e9edf5 100%);
          position: relative;
          overflow-x: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Floating Elements */
        .floating-elements {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(67, 97, 238, 0.1), rgba(58, 12, 163, 0.1));
          animation: float 20s infinite;
        }

        .circle-1 {
          width: 500px;
          height: 500px;
          top: -250px;
          right: -100px;
          animation-delay: 0s;
        }

        .circle-2 {
          width: 400px;
          height: 400px;
          bottom: -200px;
          left: -100px;
          animation-delay: 5s;
        }

        .circle-3 {
          width: 300px;
          height: 300px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 10s;
        }

        .cross {
          position: absolute;
          font-size: 40px;
          color: rgba(67, 97, 238, 0.1);
          font-weight: 300;
          animation: spin 30s linear infinite;
        }

        .cross-1 {
          top: 20%;
          right: 15%;
        }

        .cross-2 {
          bottom: 20%;
          left: 15%;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-30px, 30px) rotate(240deg); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Loading Animation */
        .loading-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .medical-loader {
          position: relative;
          width: 100px;
          height: 100px;
          margin-bottom: 30px;
        }

        .heart-beat {
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid white;
          border-radius: 50%;
          animation: pulse-ring 1.5s ease-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .loading-text {
          color: white;
          font-size: 1.2rem;
          font-weight: 400;
          letter-spacing: 1px;
          animation: fadeInOut 2s ease-in-out infinite;
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 50%, #7209b7 100%);
          color: white;
          padding: 80px 20px 100px;
          margin-bottom: 60px;
          clip-path: polygon(0 0, 100% 0, 100% 90%, 0 100%);
          z-index: 1;
        }

        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .hero-badge {
          display: inline-block;
          padding: 8px 20px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border-radius: 40px;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.5px;
          margin-bottom: 30px;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 20px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }

        .gradient-text {
          background: linear-gradient(135deg, #ffd166, #f8f7ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.2rem;
          max-width: 700px;
          margin: 0 auto 40px;
          opacity: 0.95;
          line-height: 1.6;
        }

        .search-wrapper {
          max-width: 800px;
          margin: 0 auto 30px;
          transform: translateY(0);
          transition: transform 0.3s ease;
        }

        .search-wrapper:hover {
          transform: translateY(-5px);
        }

        .searching-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-top: 20px;
          color: white;
        }

        .searching-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .search-results-info {
          margin-top: 15px;
          font-size: 1rem;
          color: rgba(255,255,255,0.9);
        }

        .search-results-info .highlight {
          font-weight: 700;
          color: #ffd166;
          font-size: 1.2rem;
        }

        .trust-indicators {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-top: 50px;
          flex-wrap: wrap;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1rem;
          color: rgba(255,255,255,0.9);
        }

        .trust-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          font-size: 14px;
        }

        /* Search Results Section */
        .search-results-section {
          max-width: 1400px;
          margin: 0 auto 60px;
          padding: 0 20px;
          position: relative;
          z-index: 2;
          animation: fadeIn 0.5s ease;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding: 30px 40px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .results-header h2 {
          font-size: 2.2rem;
          color: #1e293b;
          margin-bottom: 5px;
        }

        .results-count {
          color: #64748b;
          font-size: 1.1rem;
        }

        .no-results-found {
          text-align: center;
          padding: 60px 40px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .no-results-found .no-results-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .no-results-found h3 {
          font-size: 1.8rem;
          color: #1e293b;
          margin-bottom: 10px;
        }

        .no-results-found p {
          color: #64748b;
          font-size: 1.1rem;
          margin-bottom: 5px;
        }

        .suggestion-text {
          margin-top: 20px !important;
          font-weight: 600;
          color: #475569 !important;
        }

        .suggestion-chips {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 15px;
          flex-wrap: wrap;
        }

        .suggestion-chip {
          padding: 12px 25px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 30px;
          color: #4361ee;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .suggestion-chip:hover {
          background: #4361ee;
          color: white;
          border-color: #4361ee;
          transform: translateY(-2px);
        }

        /* All Doctors Section */
        .all-doctors-section {
          max-width: 1400px;
          margin: 0 auto 60px;
          padding: 0 20px;
          position: relative;
          z-index: 2;
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .all-doctors-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding: 30px 40px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .all-doctors-header .header-icon {
          font-size: 3rem;
          margin-bottom: 10px;
        }

        .all-doctors-header h2 {
          font-size: 2.2rem;
          color: #1e293b;
          margin-bottom: 5px;
        }

        .doctors-count-badge {
          color: #64748b;
          font-size: 1.1rem;
        }

        .back-btn {
          padding: 14px 35px;
          background: linear-gradient(135deg, #4361ee, #3a0ca3);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .back-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(67, 97, 238, 0.3);
        }

        .all-doctors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 30px;
        }

        .all-doctor-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: all 0.3s;
          animation: slideUp 0.5s ease forwards;
          opacity: 0;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .all-doctor-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(67, 97, 238, 0.15);
        }

        .all-doctor-card-header {
          padding: 30px 20px;
          text-align: center;
          color: white;
        }

        .all-doctor-avatar {
          margin-bottom: 15px;
        }

        .all-doctor-avatar img {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid white;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .all-avatar-placeholder {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: bold;
          border: 4px solid white;
          margin: 0 auto;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .all-doctor-card-header h3 {
          font-size: 1.4rem;
          margin-bottom: 5px;
        }

        .doctor-specialization {
          font-size: 0.95rem;
          opacity: 0.9;
        }

        .all-doctor-card-body {
          padding: 25px;
        }

        .doctor-detail-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .doctor-detail-item:last-child {
          border-bottom: none;
        }

        .detail-label {
          color: #64748b;
          font-size: 0.95rem;
        }

        .detail-value {
          color: #1e293b;
          font-weight: 600;
        }

        .doctor-detail-item.fee .detail-value {
          color: #10b981;
          font-size: 1.1rem;
        }

        .all-doctor-card-actions {
          display: flex;
          padding: 0 25px 25px;
          gap: 15px;
        }

        .view-profile-full, .book-appointment-full {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          text-align: center;
          transition: all 0.3s;
        }

        .view-profile-full {
          background: #f1f5f9;
          color: #4361ee;
          border: 1px solid #4361ee;
        }

        .view-profile-full:hover {
          background: #4361ee;
          color: white;
        }

        .book-appointment-full {
          background: linear-gradient(135deg, #4361ee, #3a0ca3);
          color: white;
        }

        .book-appointment-full:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);
        }

        /* Categories Section */
        .categories-section {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px 80px;
          position: relative;
          z-index: 2;
        }

        .section-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .section-subtitle {
          display: inline-block;
          padding: 6px 16px;
          background: linear-gradient(135deg, #4361ee15, #3a0ca315);
          color: #4361ee;
          border-radius: 30px;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 20px;
        }

        .section-header h2 {
          font-size: 2.5rem;
          color: #1e293b;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .section-description {
          color: #64748b;
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 30px;
          margin: 0 auto;
        }

        .category-card {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08), 0 10px 20px rgba(0,0,0,0.05);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          animation: slideUp 0.6s ease forwards;
          opacity: 0;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .category-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 50px rgba(67, 97, 238, 0.15);
        }

        .card-header {
          position: relative;
          color: white;
          padding: 40px 25px;
          text-align: center;
          overflow: hidden;
        }

        .header-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at top right, rgba(255,255,255,0.3), transparent);
          pointer-events: none;
        }

        .category-icon {
          font-size: 4rem;
          margin-bottom: 15px;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
        }

        .card-header h3 {
          margin: 0 0 10px 0;
          font-size: 2rem;
          font-weight: 700;
          position: relative;
        }

        .card-header p {
          margin: 0;
          font-size: 1rem;
          opacity: 0.95;
          line-height: 1.6;
          position: relative;
        }

        .doctors-count {
          margin-top: 20px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          padding: 8px 20px;
          border-radius: 30px;
          font-size: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 1px solid rgba(255,255,255,0.3);
        }

        .count-number {
          font-weight: 700;
          font-size: 1.2rem;
        }

        .card-body {
          padding: 30px 25px;
        }

        .category-description {
          text-align: center;
          margin-bottom: 25px;
          color: #475569;
          line-height: 1.6;
        }

        .no-doctors-available {
          text-align: center;
          padding: 20px;
          background: #f1f5f9;
          border-radius: 12px;
          color: #64748b;
        }

        .view-all-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border: 2px solid;
          border-radius: 16px;
          text-decoration: none;
          text-align: center;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          width: 100%;
          cursor: pointer;
        }

        .view-all-btn:hover {
          background: linear-gradient(135deg, #4361ee, #3a0ca3) !important;
          color: white !important;
          border-color: transparent !important;
          transform: translateX(5px);
        }

        .view-all-btn .arrow {
          transition: transform 0.3s ease;
        }

        .view-all-btn:hover .arrow {
          transform: translateX(5px);
        }

        .no-categories-found {
          text-align: center;
          padding: 60px 40px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          max-width: 600px;
          margin: 0 auto;
        }

        .no-categories-found .no-results-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .no-categories-found h3 {
          font-size: 1.8rem;
          color: #1e293b;
          margin-bottom: 10px;
        }

        .no-categories-found p {
          color: #64748b;
          font-size: 1.1rem;
          margin-bottom: 25px;
        }

        .clear-search-btn {
          padding: 12px 30px;
          background: linear-gradient(135deg, #4361ee, #3a0ca3);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .clear-search-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(67, 97, 238, 0.3);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-section {
            padding: 60px 20px 80px;
          }

          .hero-title {
            font-size: 2rem;
          }

          .trust-indicators {
            gap: 20px;
            flex-direction: column;
            align-items: center;
          }

          .categories-grid {
            grid-template-columns: 1fr;
          }

          .all-doctors-header,
          .results-header {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }

          .all-doctors-grid {
            grid-template-columns: 1fr;
          }

          .all-doctor-card-actions {
            flex-direction: column;
          }

          .suggestion-chips {
            flex-direction: column;
            align-items: center;
          }

          .suggestion-chip {
            width: 100%;
            max-width: 300px;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 1.8rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .section-header h2 {
            font-size: 1.8rem;
          }

          .card-header h3 {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;