import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './AuthForm.css';

const AuthForm = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(mode === 'signup' ? false : true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isLogin) {
      // Login logic
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess('Login successful!');
          // Store token and user data in localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          // Redirect based on role
          setTimeout(() => {
            if (data.user.role === 'admin') {
              navigate('/admin');
            } else if (data.user.role === 'seller') {
              navigate('/seller');
            } else {
              navigate('/customer');
            }
          }, 1000);
        } else {
          setError(data.error || 'Login failed');
        }
      } catch (error) {
        setError('Network error. Please try again.');
      }
    } else {
      // Sign up logic
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            role: formData.role
          })
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess('Account created successfully!');
          // Store token and user data in localStorage for auto-login
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          setTimeout(async () => {
            // Redirect based on role after successful registration
            if (data.user.role === 'admin') {
              navigate('/admin');
            } else if (data.user.role === 'seller') {
              // Check if seller profile is complete
              try {
                const profileResponse = await fetch('http://localhost:5000/api/sellers/profile-status', {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${data.token}`
                  }
                });

                if (profileResponse.ok) {
                  const profileData = await profileResponse.json();
                  if (profileData.profileComplete) {
                    navigate('/seller');
                  } else {
                    navigate('/seller/complete-profile');
                  }
                } else {
                  // If profile status check fails, assume incomplete and redirect to completion
                  navigate('/seller/complete-profile');
                }
              } catch (error) {
                console.error('Error checking profile status:', error);
                // If error occurs, assume incomplete and redirect to completion
                navigate('/seller/complete-profile');
              }
            } else {
              navigate('/customer');
            }
          }, 2000);
        } else {
          setError(data.error || 'Registration failed');
        }
      } catch (error) {
        setError('Network error. Please try again.');
      }
    }
    setLoading(false);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      role: 'customer'
    });
  };

  return (
    <div className="auth-container">
      
      
      <div className="auth-header">
        <h2>EcoBazaarX</h2>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your Email"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>
        
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required={!isLogin}
            >
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
            </select>
          </div>
        )}
        
        {!isLogin && (
          <>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required={!isLogin}
              />
            </div>
          </>
        )}
        
        <button type="submit" className="auth-button">
          {isLogin ? 'Login to EcoBazaarX' : 'Join EcoBazaarX'}
        </button>
      </form>
      
      <div className="toggle-link">
        <button onClick={toggleForm}>
          {isLogin 
            ? "🌱 New to sustainable shopping? Sign up here" 
            : "🌍 Already eco-conscious? Login here"}
        </button>
      </div>
      
    </div>
  );
};

export default AuthForm;
