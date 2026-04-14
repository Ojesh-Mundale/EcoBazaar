import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SellerProfileCompletion.css';

const SellerProfileCompletion = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    storeName: '',
    productCategories: [],
    description: '',
    phoneNumber: '',
    address: '',
    website: ''
  });

  const [availableCategories] = useState([
    'Fashion', 'Electronics', 'Food', 'Home & Garden',
    'Personal Care', 'Office Supplies', 'Accessories', 'Books',
    'Sports', 'Automotive', 'Health', 'Beauty'
  ]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get user email from localStorage
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.storeName || selectedCategories.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/sellers/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          productCategories: selectedCategories
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert('Profile completed successfully!');
        navigate('/seller');
      } else {
        setError(result.error || 'Failed to complete profile');
      }
    } catch (error) {
      console.error('Error completing profile:', error);
      setError('Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-completion-container">
      <div className="profile-completion-card">
        <div className="profile-header">
          <h1>Complete Your Seller Profile</h1>
          <p>Please provide the following information to complete your seller profile</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Store Name *</label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => handleInputChange('storeName', e.target.value)}
                  placeholder="Enter your store name"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Product Categories *</h3>
            <p>Select all categories that apply to your products</p>
            <div className="categories-grid">
              {availableCategories.map(category => (
                <div
                  key={category}
                  className={`category-item ${selectedCategories.includes(category) ? 'selected' : ''}`}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </div>
              ))}
            </div>
            {selectedCategories.length === 0 && (
              <p className="error-text">Please select at least one category</p>
            )}
          </div>

          <div className="form-section">
            <h3>Store Description</h3>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell customers about your store and what makes it special..."
                rows="4"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Contact Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your business address"
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/auth')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Completing Profile...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerProfileCompletion;
