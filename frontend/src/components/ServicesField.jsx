import React from 'react';

const ServicesField = ({ services = [], newService = '', onAddService, onRemoveService, onNewServiceChange }) => {
    return (
        <div style={{
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
        }}>
            <label style={{
                display: 'block',
                marginBottom: '15px',
                fontWeight: '600',
                color: '#2c3e50',
                fontSize: '16px'
            }}>
                Services Offered
            </label>

            {/* Services List */}
            {services.length > 0 ? (
                <div style={{ marginBottom: '15px' }}>
                    {services.map((service, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                backgroundColor: 'white',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                marginBottom: '8px'
                            }}
                        >
                            <span style={{ color: '#495057' }}>{service}</span>
                            <button
                                type="button"
                                onClick={() => onRemoveService(index)}
                                style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{
                    textAlign: 'center',
                    color: '#6c757d',
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    marginBottom: '15px'
                }}>
                    No services added yet. Add your services below.
                </p>
            )}

            {/* Add New Service */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={newService}
                    onChange={(e) => onNewServiceChange(e.target.value)}
                    placeholder="Enter a service (e.g., Heart Surgery)"
                    style={{
                        flex: 1,
                        padding: '10px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '14px'
                    }}
                />
                <button
                    type="button"
                    onClick={onAddService}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    Add Service
                </button>
            </div>
            <small style={{
                color: '#6c757d',
                display: 'block',
                marginTop: '10px',
                fontSize: '13px'
            }}>
                Add all services you offer (optional)
            </small>
        </div>
    );
};

export default ServicesField;