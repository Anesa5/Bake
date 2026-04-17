// components/ReviewForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const ReviewForm = ({ doctorId, onSuccess }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        patientName: '',
        patientEmail: '',
        rating: 0,
        comment: ''
    });
    const [hover, setHover] = useState(0);
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

        if (formData.rating === 0) {
            setError('Please select a rating');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post('http://localhost:5000/api/reviews', {
                doctorId,
                ...formData
            });

            // Reset form
            setFormData({
                patientName: '',
                patientEmail: '',
                rating: 0,
                comment: ''
            });

            // Close modal
            setIsModalOpen(false);

            // Call success callback
            onSuccess?.();

        } catch (error) {
            console.error('Error submitting review:', error);
            setError(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
        setError('');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            patientName: '',
            patientEmail: '',
            rating: 0,
            comment: ''
        });
        setError('');
    };

    return (
        <>
            {/* Write a Review Button */}
            <div style={buttonContainerStyle}>
                <button onClick={openModal} style={writeReviewButtonStyle}>
                    <span style={buttonIconStyle}>✏️</span>
                    Write a Review
                </button>
            </div>

            {/* Modal Popup */}
            {isModalOpen && (
                <div style={modalOverlayStyle} onClick={closeModal}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div style={modalHeaderStyle}>
                            <h3 style={modalTitleStyle}>Write a Review</h3>
                            <button onClick={closeModal} style={closeButtonStyle}>×</button>
                        </div>

                        {/* Modal Body */}
                        <div style={modalBodyStyle}>
                            {error && (
                                <div style={errorStyle}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Name Input */}
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Your Name *</label>
                                    <input
                                        type="text"
                                        name="patientName"
                                        value={formData.patientName}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        required
                                        style={inputStyle}
                                    />
                                </div>

                                {/* Email Input (Optional) */}
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Email (Optional)</label>
                                    <input
                                        type="email"
                                        name="patientEmail"
                                        value={formData.patientEmail}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        style={inputStyle}
                                    />
                                </div>

                                {/* Rating Stars */}
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Your Rating *</label>
                                    <div style={starsContainerStyle}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, rating: star })}
                                                onMouseEnter={() => setHover(star)}
                                                onMouseLeave={() => setHover(0)}
                                                style={{
                                                    ...starButtonStyle,
                                                    color: star <= (hover || formData.rating) ? '#FFD700' : '#ccc'
                                                }}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <div style={ratingLabelsStyle}>
                                        <span>Poor</span>
                                        <span>Average</span>
                                        <span>Good</span>
                                        <span>Very Good</span>
                                        <span>Excellent</span>
                                    </div>
                                </div>

                                {/* Comment */}
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Your Review *</label>
                                    <textarea
                                        name="comment"
                                        value={formData.comment}
                                        onChange={handleChange}
                                        placeholder="Share your experience with this doctor..."
                                        rows="4"
                                        required
                                        style={{ ...inputStyle, resize: 'vertical' }}
                                    />
                                </div>

                                {/* Modal Footer with Buttons */}
                                <div style={modalFooterStyle}>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        style={cancelButtonStyle}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            ...submitButtonStyle,
                                            opacity: loading ? 0.7 : 1,
                                            cursor: loading ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {loading ? 'Submitting...' : 'Post Review'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Styles
const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px'
};

const writeReviewButtonStyle = {
    padding: '14px 30px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
};

const buttonIconStyle = {
    fontSize: '20px'
};

// Modal Styles
const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease'
};

const modalContentStyle = {
    background: 'white',
    borderRadius: '15px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: 'slideUp 0.3s ease'
};

const modalHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 25px',
    borderBottom: '1px solid #e0e0e0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '15px 15px 0 0'
};

const modalTitleStyle = {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: '600'
};

const closeButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '30px',
    cursor: 'pointer',
    padding: 0,
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background 0.3s'
};

const modalBodyStyle = {
    padding: '25px'
};

const modalFooterStyle = {
    display: 'flex',
    gap: '15px',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0'
};

const cancelButtonStyle = {
    flex: 1,
    padding: '12px',
    background: '#f0f0f0',
    color: '#666',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.3s'
};

const submitButtonStyle = {
    flex: 2,
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s'
};

// Form Styles (same as before)
const errorStyle = {
    background: '#fee',
    color: '#c00',
    padding: '12px',
    borderRadius: '5px',
    marginBottom: '20px',
    border: '1px solid #fcc'
};

const inputGroupStyle = {
    marginBottom: '20px'
};

const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
    fontWeight: '500',
    fontSize: '14px'
};

const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.3s'
};

const starsContainerStyle = {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
    justifyContent: 'center'
};

const starButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '35px',
    cursor: 'pointer',
    padding: '0 3px',
    transition: 'color 0.2s'
};

const ratingLabelsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#999',
    fontSize: '12px',
    marginTop: '5px',
    padding: '0 8px'
};

// Add animations to global styles
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

export default ReviewForm;