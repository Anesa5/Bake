// components/SearchBar.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, MapPin, Briefcase, ChevronDown } from 'lucide-react';
import axios from 'axios';

const SearchBar = ({ onSearch, onCategorySearch, loading, initialValues = {} }) => {
    const [searchTerm, setSearchTerm] = useState(initialValues.query || '');
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        specialty: initialValues.specialty || '',
        city: initialValues.city || '',
        category: initialValues.category || ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    // Real-time search for categories
    useEffect(() => {
        if (onCategorySearch) {
            onCategorySearch(searchTerm);
        }
    }, [searchTerm, onCategorySearch]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/categories');
            if (response.data.success) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Dummy categories if API fails
            setCategories([
                { _id: '1', name: 'Cardiology', icon: '❤️' },
                { _id: '2', name: 'Dermatology', icon: '🧴' },
                { _id: '3', name: 'Neurology', icon: '🧠' },
                { _id: '4', name: 'Pediatrics', icon: '👶' },
                { _id: '5', name: 'Orthopedics', icon: '🦴' },
            ]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Call doctor search with current search term and filters
        onSearch({
            query: searchTerm,
            ...filters
        });
    };

    const clearSearch = () => {
        setSearchTerm('');
        setFilters({ specialty: '', city: '', category: '' });
        if (onCategorySearch) {
            onCategorySearch('');
        }
    };

    const specialtySuggestions = [
        'Cardiologist', 'Dentist', 'Dermatologist', 'Gynecologist',
        'Neurologist', 'Orthopedic', 'Pediatrician', 'Psychiatrist'
    ];

    return (
        <div className="search-bar-container">
            <form onSubmit={handleSubmit} className="search-form">
                {/* Main Search Input */}
                <div className={`search-input-wrapper ${isFocused ? 'focused' : ''} ${showFilters ? 'with-filters' : ''}`}>
                    <div className="search-icon">
                        <Search size={20} />
                    </div>

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Search for medical specialties or doctors..."
                        className="search-input"
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="clear-button"
                            title="Clear search"
                        >
                            <X size={18} />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`filter-toggle ${showFilters ? 'active' : ''}`}
                    >
                        <Filter size={18} />
                        <span>Filters</span>
                        <ChevronDown size={16} className={`chevron ${showFilters ? 'rotated' : ''}`} />
                    </button>
                </div>

                {/* Search Hint */}
                {searchTerm && (
                    <div className="search-hint">
                        <span>Searching for: </span>
                        <strong>"{searchTerm}"</strong>
                        <span className="hint-text"> in specialties</span>
                    </div>
                )}

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <div className="filters-panel">
                        <div className="filters-header">
                            <h3>Advanced Filters</h3>
                            <p>Refine your search to find the perfect doctor</p>
                        </div>

                        <div className="filters-grid">
                            {/* Category Filter */}
                            <div className="filter-group">
                                <label>
                                    <Briefcase size={16} />
                                    <span>Category</span>
                                </label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    className="filter-select"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat.name}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Specialty Filter */}
                            <div className="filter-group">
                                <label>
                                    <Search size={16} />
                                    <span>Specialty</span>
                                </label>
                                <input
                                    type="text"
                                    value={filters.specialty}
                                    onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                                    placeholder="e.g., Cardiologist"
                                    list="specialties"
                                    className="filter-input"
                                />
                                <datalist id="specialties">
                                    {specialtySuggestions.map(s => (
                                        <option key={s} value={s} />
                                    ))}
                                </datalist>
                            </div>

                            {/* City Filter */}
                            <div className="filter-group">
                                <label>
                                    <MapPin size={16} />
                                    <span>City</span>
                                </label>
                                <input
                                    type="text"
                                    value={filters.city}
                                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                    placeholder="Enter city name"
                                    className="filter-input"
                                />
                            </div>
                        </div>

                        {/* Quick Category Buttons */}
                        {categories.length > 0 && (
                            <div className="quick-categories">
                                <p className="quick-categories-title">Popular Specialties:</p>
                                <div className="category-chips">
                                    {categories.slice(0, 8).map(cat => (
                                        <button
                                            key={cat._id}
                                            type="button"
                                            onClick={() => {
                                                setSearchTerm(cat.name);
                                                setFilters({ ...filters, category: cat.name });
                                                setShowFilters(false);
                                                if (onCategorySearch) {
                                                    onCategorySearch(cat.name);
                                                }
                                            }}
                                            className={`category-chip ${filters.category === cat.name ? 'active' : ''}`}
                                        >
                                            {cat.icon && <span className="chip-icon">{cat.icon}</span>}
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Filter Actions */}
                        <div className="filter-actions">
                            <button
                                type="button"
                                onClick={() => setFilters({ specialty: '', city: '', category: '' })}
                                className="clear-filters-btn"
                            >
                                Clear All Filters
                            </button>
                            <button
                                type="submit"
                                className="apply-filters-btn"
                                disabled={loading}
                            >
                                {loading ? 'Searching...' : 'Apply Filters'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Search Button */}
                <button
                    type="submit"
                    className="search-button"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <div className="searching-spinner-small"></div>
                            <span>Searching...</span>
                        </>
                    ) : (
                        <>
                            <Search size={20} />
                            <span>Search Doctors</span>
                        </>
                    )}
                </button>
            </form>

            <style jsx>{`
                .search-bar-container {
                    width: 100%;
                    max-width: 900px;
                    margin: 0 auto;
                }

                .search-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                /* Search Hint */
                .search-hint {
                    text-align: left;
                    padding: 8px 16px;
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 30px;
                    color: white;
                    font-size: 0.95rem;
                    border: 1px solid rgba(255,255,255,0.2);
                    display: inline-block;
                    margin: 0 auto;
                }

                .search-hint strong {
                    color: #ffd166;
                    font-weight: 600;
                }

                .hint-text {
                    opacity: 0.8;
                }

                /* Main Search Input */
                .search-input-wrapper {
                    display: flex;
                    align-items: center;
                    background: white;
                    border: 2px solid #e2e8f0;
                    border-radius: 16px;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .search-input-wrapper.focused {
                    border-color: #4361ee;
                    box-shadow: 0 0 0 4px rgba(67, 97, 238, 0.15);
                }

                .search-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding-left: 16px;
                    color: #94a3b8;
                }

                .search-input {
                    flex: 1;
                    padding: 14px 12px;
                    border: none;
                    font-size: 1rem;
                    color: #1e293b;
                    background: transparent;
                    outline: none;
                }

                .search-input::placeholder {
                    color: #94a3b8;
                }

                .clear-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    margin-right: 4px;
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    border-radius: 50%;
                    transition: all 0.2s;
                }

                .clear-button:hover {
                    background: #f1f5f9;
                    color: #ef4444;
                }

                .filter-toggle {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0 20px;
                    height: 52px;
                    background: transparent;
                    border: none;
                    border-left: 2px solid #e2e8f0;
                    color: #475569;
                    font-size: 0.95rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .filter-toggle:hover {
                    background: #f8fafc;
                    color: #4361ee;
                }

                .filter-toggle.active {
                    background: #4361ee;
                    color: white;
                }

                .chevron {
                    transition: transform 0.3s;
                }

                .chevron.rotated {
                    transform: rotate(180deg);
                }

                /* Filters Panel */
                .filters-panel {
                    background: white;
                    border: 2px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 24px;
                    animation: slideDown 0.3s ease;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .filters-header {
                    margin-bottom: 20px;
                }

                .filters-header h3 {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 4px;
                }

                .filters-header p {
                    font-size: 0.9rem;
                    color: #64748b;
                }

                .filters-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                }

                .filter-group label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #475569;
                    margin-bottom: 6px;
                }

                .filter-group label svg {
                    color: #4361ee;
                }

                .filter-select,
                .filter-input {
                    padding: 12px 14px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 0.95rem;
                    color: #1e293b;
                    transition: all 0.2s;
                }

                .filter-select:hover,
                .filter-input:hover {
                    border-color: #94a3b8;
                }

                .filter-select:focus,
                .filter-input:focus {
                    outline: none;
                    border-color: #4361ee;
                    box-shadow: 0 0 0 3px rgba(67,97,238,0.1);
                }

                .quick-categories {
                    margin-bottom: 24px;
                }

                .quick-categories-title {
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #475569;
                    margin-bottom: 12px;
                }

                .category-chips {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .category-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: #f8fafc;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 30px;
                    font-size: 0.9rem;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .category-chip:hover {
                    border-color: #4361ee;
                    color: #4361ee;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px -1px rgba(67,97,238,0.2);
                }

                .category-chip.active {
                    background: #4361ee;
                    border-color: #4361ee;
                    color: white;
                }

                .chip-icon {
                    font-size: 1.1rem;
                }

                .filter-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 20px;
                }

                .clear-filters-btn {
                    padding: 12px 24px;
                    background: transparent;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    color: #64748b;
                    font-size: 0.95rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .clear-filters-btn:hover {
                    border-color: #ef4444;
                    color: #ef4444;
                    background: #fef2f2;
                }

                .apply-filters-btn {
                    padding: 12px 32px;
                    background: linear-gradient(135deg, #4361ee, #3a0ca3);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(67,97,238,0.3);
                }

                .apply-filters-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 12px -1px rgba(67,97,238,0.4);
                }

                .apply-filters-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                /* Search Button */
                .search-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 16px 32px;
                    background: linear-gradient(135deg, #4361ee, #3a0ca3);
                    border: none;
                    border-radius: 16px;
                    color: white;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 8px 15px -3px rgba(67,97,238,0.4);
                    width: 100%;
                }

                .search-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 25px -5px rgba(67,97,238,0.5);
                }

                .search-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .searching-spinner-small {
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-top: 3px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .filters-grid {
                        grid-template-columns: 1fr;
                    }

                    .filter-toggle span {
                        display: none;
                    }

                    .filter-actions {
                        flex-direction: column;
                    }

                    .clear-filters-btn,
                    .apply-filters-btn {
                        width: 100%;
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default SearchBar;