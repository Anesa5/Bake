// components/RatingStars.jsx
import React from 'react';

const RatingStars = ({ rating, size = 'medium', showNumber = false }) => {
    const stars = [];

    const starSize = {
        small: '16px',
        medium: '20px',
        large: '24px',
        xlarge: '30px'
    };

    for (let i = 1; i <= 5; i++) {
        stars.push(
            <span key={i} style={{
                color: i <= rating ? '#FFD700' : '#e0e0e0',
                fontSize: starSize[size] || '20px',
                marginRight: '2px'
            }}>
                ★
            </span>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex' }}>{stars}</div>
            {showNumber && rating > 0 && (
                <span style={{ color: '#666', fontWeight: '600' }}>
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default RatingStars;