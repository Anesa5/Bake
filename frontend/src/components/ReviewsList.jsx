// components/ReviewsList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RatingStars from './RatingStars';

const ReviewsList = ({ doctorId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });
    const [sort, setSort] = useState('recent');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchReviews();
    }, [doctorId, page, sort]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:5000/api/reviews/doctor/${doctorId}`,
                { params: { page, sort } }
            );

            setReviews(response.data.reviews);
            setTotalPages(response.data.totalPages);

            // Calculate stats from response
            const dist = response.data.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            const total = response.data.totalReviews;

            // Calculate weighted average
            let sum = 0;
            let count = 0;
            Object.entries(dist).forEach(([rating, num]) => {
                sum += parseInt(rating) * num;
                count += num;
            });

            const avg = count > 0 ? (sum / count).toFixed(1) : 0;

            setStats({
                averageRating: avg,
                totalReviews: total,
                distribution: dist
            });

        } catch (error) {
            console.error('Error fetching reviews:', error);
            setError('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    if (loading && page === 1) {
        return (
            <div style={loadingStyle}>
                <div className="spinner"></div>
                <p>Loading reviews...</p>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            {/* Header with Stats */}
            <div style={headerStyle}>
                <div>
                    <h2 style={titleStyle}>Patient Reviews</h2>
                    <div style={statsStyle}>
                        <span style={avgRatingStyle}>{stats.averageRating}</span>
                        <RatingStars rating={parseFloat(stats.averageRating)} size="large" />
                        <span style={totalStyle}>({stats.totalReviews} reviews)</span>
                    </div>
                </div>

                {/* Sort Dropdown */}
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    style={sortStyle}
                >
                    <option value="recent">Most Recent</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                </select>
            </div>

            {/* Rating Distribution */}
            {stats.totalReviews > 0 && (
                <div style={distributionStyle}>
                    {[5, 4, 3, 2, 1].map(rating => (
                        <div key={rating} style={distributionRowStyle}>
                            <span style={starLabelStyle}>{rating} ★</span>
                            <div style={progressBarContainerStyle}>
                                <div
                                    style={{
                                        ...progressBarStyle,
                                        width: `${(stats.distribution[rating] / stats.totalReviews) * 100}%`,
                                        background: rating >= 4 ? '#27ae60' : rating >= 3 ? '#f39c12' : '#e74c3c'
                                    }}
                                ></div>
                            </div>
                            <span style={countStyle}>({stats.distribution[rating]})</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Error State */}
            {error && (
                <div style={errorStyle}>
                    <p>{error}</p>
                    <button onClick={fetchReviews} style={retryStyle}>
                        Try Again
                    </button>
                </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 && !loading ? (
                <div style={emptyStyle}>
                    <p>No reviews yet. Be the first to review!</p>
                </div>
            ) : (
                <>
                    {reviews.map(review => (
                        <div key={review._id} style={reviewCardStyle}>
                            <div style={reviewHeaderStyle}>
                                <div>
                                    <h4 style={reviewerNameStyle}>{review.patientName}</h4>
                                    <RatingStars rating={review.rating} size="small" />
                                </div>
                                <span style={dateStyle}>
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p style={commentStyle}>{review.comment}</p>
                        </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={paginationStyle}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={pageButtonStyle}
                            >
                                ← Previous
                            </button>
                            <span style={pageInfoStyle}>
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                style={pageButtonStyle}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// Styles
const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px'
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
};

const titleStyle = {
    margin: '0 0 10px 0',
    color: '#333'
};

const statsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap'
};

const avgRatingStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333'
};

const totalStyle = {
    color: '#666',
    fontSize: '14px'
};

const sortStyle = {
    padding: '10px 15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer'
};

const distributionStyle = {
    background: '#f9f9f9',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '30px'
};

const distributionRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px'
};

const starLabelStyle = {
    width: '40px',
    color: '#666'
};

const progressBarContainerStyle = {
    flex: 1,
    height: '8px',
    background: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden'
};

const progressBarStyle = {
    height: '100%',
    transition: 'width 0.3s'
};

const countStyle = {
    width: '50px',
    color: '#666',
    fontSize: '12px'
};

const errorStyle = {
    textAlign: 'center',
    padding: '40px',
    color: '#e74c3c'
};

const retryStyle = {
    padding: '8px 20px',
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px'
};

const emptyStyle = {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
    background: '#f9f9f9',
    borderRadius: '10px'
};

const reviewCardStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px'
};

const reviewHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px'
};

const reviewerNameStyle = {
    margin: '0 0 5px 0',
    color: '#333'
};

const dateStyle = {
    color: '#999',
    fontSize: '14px'
};

const commentStyle = {
    color: '#555',
    lineHeight: '1.6',
    margin: '0'
};

const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    marginTop: '30px'
};

const pageButtonStyle = {
    padding: '8px 16px',
    background: '#f0f0f0',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
};

const pageInfoStyle = {
    color: '#666',
    fontSize: '14px'
};

const loadingStyle = {
    textAlign: 'center',
    padding: '60px',
    color: '#666'
};

export default ReviewsList;