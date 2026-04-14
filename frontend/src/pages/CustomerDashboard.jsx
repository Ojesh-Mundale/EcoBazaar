import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerDashboard.css';
import './TrackOrderModal.css';
import HamburgerMenu from '../components/HamburgerMenu';
import CountdownTimer from '../components/CountdownTimer';
import AssistantChat from '../components/AssistantChat';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [customerStats, setCustomerStats] = useState({
    totalOrders: 0,
    totalSpent: 0.00,
    loyaltyPoints: 0,
    ecoScore: 0,
    carbonSaved: 0,
    treesSaved: 0,
  });
  
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showTrackOrderModal, setShowTrackOrderModal] = useState(false);
  const [trackOrder, setTrackOrder] = useState(null);
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [selectedProductForFeedback, setSelectedProductForFeedback] = useState(null);

  const [products, setProducts] = useState([]);
  const [limitedTimeOffers, setLimitedTimeOffers] = useState([]);

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('ecoRating');
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    address: '',
    city: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    paymentMethod: 'credit_card'
  });
  const [showPayment, setShowPayment] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const categories = ['all', 'Fashion', 'Personal Care', 'Office', 'Accessories', 'Electronics'];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const filteredProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === 'all' || product.category === selectedCategory)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price': return a.price - b.price;
        case 'rating': return b.rating - a.rating;
        case 'carbon': return a.carbonFootprint - b.carbonFootprint;
        default:
          // Handle null/undefined ecoRating values
          const aRating = a.ecoRating || 'Z';
          const bRating = b.ecoRating || 'Z';
          return bRating.localeCompare(aRating);
      }
    });

  const addToCart = (product) => {
    setCart(prev => [...prev, { ...product, quantity: 1 }]);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCarbonSaved = () => {
    return cart.reduce((total, item) => total + (item.carbonFootprint * item.quantity), 0);
  };

  const handleCheckout = () => {
    setShowPayment(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    try {
      const token = localStorage.getItem('token');

      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          shopName: item.shopName,
          quantity: item.quantity,
          price: item.price,
          carbonFootprint: item.carbonFootprint
        })),
        totalAmount: getCartTotal(),
        shippingAddress: `${checkoutData.address}, ${checkoutData.city}, ${checkoutData.zip}`,
        paymentMethod: checkoutData.paymentMethod === 'credit_card' ? 'Credit Card' : 'Cash on Delivery'
      };

      const response = await fetch('http://localhost:5000/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok) {
        setIsProcessingPayment(false);
        setOrderSuccess(true);
        setCart([]);
        setTimeout(() => {
          setShowPayment(false);
          setOrderSuccess(false);
        }, 3000);
      } else {
        alert('Failed to create order: ' + (data.error || 'Unknown error'));
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="welcome-banner">
        <h1>Welcome to EcoBazaarX!</h1>
        <div className="eco-badge">{customerStats.ecoBadge}</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <span className="stat-number">{customerStats.totalOrders}</span>
        </div>
        <div className="stat-card">
          <h3>Total Spent</h3>
          <span className="stat-number">₹{customerStats.totalSpent.toFixed(2)}</span>
        </div>
        <div className="stat-card">
          <h3>Carbon Saved</h3>
          <span className="stat-number">{customerStats.carbonSaved} kg CO₂</span>
        </div>
      </div>

      {/* Limited Time Offers Section */}
      <div className="limited-time-offers">
        <h2>Limited Time Offers</h2>
        <div className="offers-list">
          {limitedTimeOffers.length > 0 ? (
            limitedTimeOffers.map(offer => (
              <div key={offer.id} className="offer-card" onClick={() => setActiveSection('products')}>
                <div className="offer-image">
                  {offer.imageUrls && offer.imageUrls.length > 0 ? (
                    <img
                      src={`http://localhost:5000/api/products/${offer.id}/image/0`}
                      alt={offer.name}
                      onError={(e) => {
                        // Fallback to original URL if endpoint fails
                        e.target.src = offer.imageUrls[0];
                      }}
                    />
                  ) : (
                    <span role="img" aria-label="product">📦</span>
                  )}
                </div>
                <h3>{offer.name}</h3>
                <p>{offer.description}</p>
                <div className="offer-price-section">
                  {offer.discountedPrice && offer.discountedPrice < (offer.originalPrice || 0) ? (
                    <>
                      <span className="original-price">Rs {(offer.originalPrice || 0).toFixed(2)}</span>
                      <span className="discounted-price">Rs {(offer.discountedPrice || 0).toFixed(2)}</span>
                      <span className="discount-badge">
                        {offer.discountType === 'amount'
                          ? `Rs ${offer.discountValue || 0} off`
                          : `${offer.discountValue || 0}% off`}
                      </span>
                    </>
                  ) : (
                    <span className="discounted-price">Rs {(offer.originalPrice || 0).toFixed(2)}</span>
                  )}
                </div>
                <CountdownTimer targetDate={new Date(Date.now() + offer.duration)} />
              </div>
            ))
          ) : (
            <p>No limited time offers available at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="products-content">
      <div className="products-header">
        <h2>Browse Eco-Friendly Products</h2>
        <div className="filters">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="ecoRating">Sort by Eco Rating</option>
            <option value="price">Sort by Price</option>
            <option value="rating">Sort by Rating</option>
            <option value="carbon">Sort by Carbon Footprint</option>
          </select>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image-carousel">
              {product.imageUrls && product.imageUrls.length > 0 ? (
                <div className="carousel-container">
                  {product.imageUrls.map((url, index) => (
                    <img
                      key={index}
                      src={`http://localhost:5000/api/products/${product.id}/image/${index}`}
                      alt={`${product.name} image ${index + 1}`}
                      className={`carousel-image ${index === 0 ? 'active' : ''}`}
                      onMouseEnter={e => {
                        // Remove active class from all images in this carousel
                        const container = e.currentTarget.parentElement;
                        const images = container.querySelectorAll('.carousel-image');
                        images.forEach(img => img.classList.remove('active'));
                        // Add active class to current image
                        e.currentTarget.classList.add('active');
                      }}
                      onMouseLeave={e => {
                        // Reset to first image when leaving
                        const container = e.currentTarget.parentElement;
                        const images = container.querySelectorAll('.carousel-image');
                        images.forEach(img => img.classList.remove('active'));
                        images[0].classList.add('active');
                      }}
                      onError={(e) => {
                        // Fallback to original URL if endpoint fails
                        e.target.src = url;
                      }}
                    />
                  ))}
                </div>
              ) : (
                <span role="img" aria-label="product">{product.image || '📦'}</span>
              )}
            </div>
            <h3 className="product-name">{product.name}</h3>
            <p className="product-shopname">Shop: {product.shopName}</p>
            <p className="product-price">Rs{product.price}</p>
            <div className="product-metrics">
              <span className={`eco-rating ${product.ecoRating ? product.ecoRating.toLowerCase() : 'a'}`}>
                {product.ecoRating || 'A'} Eco Rating
              </span>
              <span className="carbon-footprint">
                {product.carbonFootprint} kg CO₂
              </span>
            </div>
            <div className="product-rating" title={`${product.rating || 0} stars`}>
              {'⭐'.repeat(Math.floor(product.rating || 0))} ({product.rating || 0})
            </div>
            <button
              className="add-to-cart-btn"
              onClick={() => addToCart(product)}
            >
              Add to Cart 🛒
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCart = () => (
    <div className="cart-content">
      <div className="cart-header">
        <div className="cart-title-section">
          <div className="cart-icon">🛒</div>
          <div>
            <h2>Shopping Cart</h2>
            <p className="cart-subtitle">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
          </div>
        </div>
        {cart.length > 0 && (
          <div className="cart-stats">
            <div className="eco-impact">
              <span className="eco-icon">🌱</span>
              <span>{getCartCarbonSaved().toFixed(1)} kg CO₂ saved</span>
            </div>
          </div>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Start shopping to add eco-friendly products to your cart!</p>
          <button
            className="shop-now-btn"
            onClick={() => setActiveSection('products')}
          >
            Browse Products 🌿
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-section">
            {cart.map(item => (
              <div key={item.id} className="cart-item-card">
                <div className="item-image-section">
                  {item.imageUrls && item.imageUrls.length > 0 ? (
                    <img
                      src={`http://localhost:5000/api/products/${item.id}/image/0`}
                      alt={item.name}
                      className="item-image"
                      onError={(e) => {
                        e.target.src = item.imageUrls[0];
                      }}
                    />
                  ) : (
                    <div className="item-placeholder">
                      <span role="img" aria-label="product">{item.image || '📦'}</span>
                    </div>
                  )}
                </div>

                <div className="item-details-section">
                  <div className="item-header">
                    <h4 className="item-name">{item.name}</h4>
                    <button
                      className="remove-item-btn"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                    >
                      ×
                    </button>
                  </div>

                  <p className="item-shop">Shop: {item.shopName}</p>

                  <div className="item-metrics">
                    <span className={`eco-badge ${item.ecoRating ? item.ecoRating.toLowerCase() : 'a'}`}>
                      {item.ecoRating || 'A'} Eco Rating
                    </span>
                    <span className="carbon-footprint">
                      {item.carbonFootprint} kg CO₂
                    </span>
                  </div>

                  <div className="item-price-section">
                    <span className="item-price">Rs{item.price}</span>
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="item-total">Rs{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary-section">
            <div className="summary-card">
              <h3>Order Summary</h3>

              <div className="summary-breakdown">
                <div className="summary-row">
                  <span>Items ({cart.length})</span>
                  <span>Rs{getCartTotal().toFixed(2)}</span>
                </div>

                <div className="summary-row eco-highlight">
                  <span>🌱 Carbon Saved</span>
                  <span className="eco-value">{getCartCarbonSaved().toFixed(1)} kg CO₂</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total-row">
                  <span>Total Amount</span>
                  <span className="total-amount">Rs{getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="eco-message">
                <div className="eco-icon">🌍</div>
                <p>By purchasing these eco-friendly products, you're helping reduce carbon emissions and protect our planet!</p>
              </div>

              <button
                className="checkout-btn"
                onClick={handleCheckout}
              >
                <span className="checkout-icon">🛍️</span>
                Proceed to Checkout
                <span className="checkout-arrow">→</span>
              </button>

              <button
                className="continue-shopping-btn"
                onClick={() => setActiveSection('products')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPayment = () => (
    <div className="payment-content">
      <h2>Payment Details</h2>
      {isProcessingPayment ? (
        <div className="payment-processing">
          <div className="processing-spinner"></div>
          <p>Processing your payment...</p>
          <p>Please do not refresh the page</p>
        </div>
      ) : (
        <form onSubmit={handlePaymentSubmit} className="payment-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              required
              value={checkoutData.name}
              onChange={(e) => setCheckoutData({...checkoutData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              required
              value={checkoutData.address}
              onChange={(e) => setCheckoutData({...checkoutData, address: e.target.value})}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                required
                value={checkoutData.city}
                onChange={(e) => setCheckoutData({...checkoutData, city: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text"
                required
                value={checkoutData.zip}
                onChange={(e) => setCheckoutData({...checkoutData, zip: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select
              value={checkoutData.paymentMethod}
              onChange={(e) => setCheckoutData({...checkoutData, paymentMethod: e.target.value})}
              required
            >
              <option value="credit_card">Credit Card</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>

          {checkoutData.paymentMethod === 'credit_card' && (
            <>
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  required
                  value={checkoutData.cardNumber}
                  onChange={(e) => setCheckoutData({...checkoutData, cardNumber: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    required
                    value={checkoutData.expiry}
                    onChange={(e) => setCheckoutData({...checkoutData, expiry: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    required
                    value={checkoutData.cvv}
                    onChange={(e) => setCheckoutData({...checkoutData, cvv: e.target.value})}
                  />
                </div>
              </div>
            </>
          )}

          {checkoutData.paymentMethod === 'cod' && (
            <div className="cod-notice">
              <div className="notice-icon">💰</div>
              <p><strong>Cash on Delivery:</strong> Pay when your order arrives at your doorstep. No upfront payment required!</p>
            </div>
          )}

          <button type="submit" className="pay-now-btn">
            {checkoutData.paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'} - Rs{getCartTotal().toFixed(2)}
          </button>
        </form>
      )}
    </div>
  );

  const renderOrderSuccess = () => (
    <div className="success-content">
      <div className="success-icon">✅</div>
      <h2>Order Successful!</h2>
      <p>Thank you for your eco-friendly purchase!</p>
      <p>You saved {getCartCarbonSaved().toFixed(1)} kg CO₂ with this order.</p>
      <button 
        className="continue-shopping-btn"
        onClick={() => {
          setShowPayment(false);
          setOrderSuccess(false);
        }}
      >
        Continue Shopping
      </button>
    </div>
  );

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch orders:', data.error);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchCustomerStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders/customer-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCustomerStats({
          totalOrders: data.totalOrders || 0,
          totalSpent: data.totalSpent || 0.00,
          loyaltyPoints: data.loyaltyPoints || 0,
          ecoScore: data.ecoScore || 0,
          carbonSaved: data.carbonSaved || 0,
          treesSaved: data.treesSaved || 0,
         // ecoBadge: data.ecoBadge || 'Eco Beginner'
        });
      } else {
        console.error('Failed to fetch customer stats:', data.error);
      }
    } catch (error) {
      console.error('Error fetching customer stats:', error);
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleTrackOrder = (order) => {
    setTrackOrder(order);
    setShowTrackOrderModal(true);
  };

  const handleOpenFeedbackModal = (order) => {
    setFeedbackOrder(order);
    setFeedbackText('');
    setFeedbackRating(0);
    setSelectedProductForFeedback(null);
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      alert('Please enter your feedback');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const customerName = user.name || 'Anonymous';

      const response = await fetch('http://localhost:5000/api/orders/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: feedbackOrder.id,
          feedback: feedbackText,
          rating: feedbackRating,
          customerName: customerName,
          productId: selectedProductForFeedback
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Feedback submitted successfully!');
        setShowFeedbackModal(false);
        setFeedbackText('');
        setFeedbackRating(0);
        setSelectedProductForFeedback(null);
      } else {
        alert('Failed to submit feedback: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const renderOrderDetails = () => (
    <div className="order-details-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Order Details</h2>
          <button className="close-btn" onClick={() => setShowOrderDetails(false)}>×</button>
        </div>
        {selectedOrder && (
          <div className="order-details">
            <div className="order-info">
              <p><strong>Order ID:</strong> {selectedOrder.id}</p>
              <p><strong>Tracking Number:</strong> {selectedOrder.trackingNumber}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Order Date:</strong> {new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> Rs{selectedOrder.totalAmount}</p>
              <p><strong>Carbon Saved:</strong> {selectedOrder.carbonSaved} kg CO₂</p>
            </div>
            <div className="order-items">
              <h3>Items</h3>
              {selectedOrder.items.map((item, index) => (
                <div key={index} className="order-item">
                  <p><strong>{item.productName}</strong></p>
                  <p>Shop: {item.shopName}</p>
                  <p>Quantity: {item.quantity} × Rs{item.price}</p>
                  <p>Carbon Footprint: {item.carbonFootprint} kg CO₂</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderFeedbackModal = () => (
    <div className="feedback-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Give Feedback</h2>
          <button className="close-btn" onClick={() => setShowFeedbackModal(false)}>×</button>
        </div>
        {feedbackOrder && (
          <div className="feedback-content">
            <div className="order-summary">
              <h3>Order #{typeof feedbackOrder.id === 'string' ? feedbackOrder.id.substring(0, 8) : feedbackOrder.id}</h3>
              <p><strong>Total:</strong> Rs{feedbackOrder.totalAmount}</p>
              <p><strong>Items:</strong> {feedbackOrder.items.length}</p>
            </div>
            <div className="product-selection">
              <label>Select Product (Optional):</label>
              <select
                value={selectedProductForFeedback || ''}
                onChange={(e) => setSelectedProductForFeedback(e.target.value)}
                className="product-select"
              >
                <option value="">General Feedback</option>
                {feedbackOrder.items.map((item, index) => (
                  <option key={index} value={item.productId}>
                    {item.productName} - {item.shopName}
                  </option>
                ))}
              </select>
            </div>
            <div className="rating-input">
              <label>Rate your experience:</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= feedbackRating ? 'filled' : ''}`}
                    onClick={() => setFeedbackRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="feedback-input">
              <label>Your Feedback:</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your experience with this order..."
                rows="4"
                className="feedback-textarea"
              />
            </div>
            <div className="feedback-actions">
              <button
                className="submit-feedback-btn"
                onClick={handleSubmitFeedback}
              >
                Submit Feedback
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowFeedbackModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTrackOrderModal = () => {
    if (!trackOrder) return null;

    const getStatusStep = (status) => {
      const statusMap = {
        'pending': 1,
        'confirmed': 2,
        'processing': 3,
        'shipped': 4,
        'delivered': 5,
        'cancelled': 0
      };
      return statusMap[status.toLowerCase()] || 1;
    };

    const getStatusColor = (status) => {
      const colorMap = {
        'pending': '#ffa500',
        'confirmed': '#007bff',
        'processing': '#28a745',
        'shipped': '#17a2b8',
        'delivered': '#28a745',
        'cancelled': '#dc3545'
      };
      return colorMap[status.toLowerCase()] || '#6c757d';
    };

    const currentStep = getStatusStep(trackOrder.status);
    const statusColor = getStatusColor(trackOrder.status);

    const trackingSteps = [
      { step: 1, label: 'Order Placed', icon: '📦', completed: currentStep >= 1 },
      { step: 2, label: 'Order Confirmed', icon: '✅', completed: currentStep >= 2 },
      { step: 3, label: 'Processing', icon: '⚙️', completed: currentStep >= 3 },
      { step: 4, label: 'Shipped', icon: '🚚', completed: currentStep >= 4 },
      { step: 5, label: 'Delivered', icon: '🏠', completed: currentStep >= 5 }
    ];

    return (
      <div className="track-order-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Track Your Order</h2>
            <button className="close-btn" onClick={() => setShowTrackOrderModal(false)}>×</button>
          </div>
          <div className="track-order-content">
            <div className="order-summary-card">
              <div className="order-header-info">
                <h3>Order #{typeof trackOrder.id === 'string' ? trackOrder.id.substring(0, 8) : trackOrder.id}</h3>
                <span className={`status-badge ${trackOrder.status.toLowerCase()}`} style={{ backgroundColor: statusColor }}>
                  {trackOrder.status}
                </span>
              </div>
              <div className="order-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Tracking Number:</span>
                  <span className="detail-value">{trackOrder.trackingNumber || 'Not Available'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Order Date:</span>
                  <span className="detail-value">{new Date(trackOrder.orderDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Amount:</span>
                  <span className="detail-value">Rs{trackOrder.totalAmount}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Items:</span>
                  <span className="detail-value">{trackOrder.items.length} item(s)</span>
                </div>
              </div>
            </div>

            <div className="tracking-timeline">
              <h3>Order Progress</h3>
              <div className="timeline-container">
                {trackingSteps.map((step, index) => (
                  <div key={step.step} className={`timeline-step ${step.completed ? 'completed' : ''}`}>
                    <div className="step-connector"></div>
                    <div className="step-content">
                      <div className="step-icon" style={{ backgroundColor: step.completed ? statusColor : '#e9ecef' }}>
                        {step.icon}
                      </div>
                      <div className="step-info">
                        <h4>{step.label}</h4>
                        {step.completed && (
                          <p className="step-date">
                            {step.step === currentStep ? 'In Progress' : 'Completed'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="delivery-info">
              <h3>Delivery Information</h3>
              <div className="delivery-details">
                <div className="delivery-item">
                  <span className="delivery-label">Estimated Delivery:</span>
                  <span className="delivery-value">
                    {trackOrder.deliveryDate ? new Date(trackOrder.deliveryDate).toLocaleDateString() : 'TBD'}
                  </span>
                </div>
                <div className="delivery-item">
                  <span className="delivery-label">Shipping Address:</span>
                  <span className="delivery-value">
                    {trackOrder.shippingAddress || 'Address not available'}
                  </span>
                </div>
              </div>
            </div>

            <div className="order-items-preview">
              <h3>Order Items</h3>
              <div className="items-list">
                {trackOrder.items.map((item, index) => (
                  <div key={index} className="item-preview">
                    <div className="item-info">
                      <h4>{item.productName}</h4>
                      <p>Shop: {item.shopName}</p>
                      <p>Quantity: {item.quantity} × Rs{item.price}</p>
                    </div>
                    <div className="item-total">
                      Rs{(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOrders = () => (
    <div className="orders-content">
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p className="no-orders">No orders found. Start shopping to see your orders here!</p>
      ) : (
        <div className="orders-grid">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>Order #{typeof order.id === 'string' ? order.id.substring(0, 8) : order.id}</h3>
                <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
              </div>
              <div className="order-info">
                <p><strong>Items:</strong> {order.items.length}</p>
                <p><strong>Total:</strong> Rs{order.totalAmount}</p>
                <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
              <p><strong>Carbon Saved:</strong> {order.carbonSaved} kg CO₂</p>
              </div>
              <div className="order-actions">
                <button
                  className="track-btn"
                  onClick={() => handleTrackOrder(order)}
                >
                  Track Order
                </button>
                <button
                  className="details-btn"
                  onClick={() => handleViewOrderDetails(order)}
                >
                   View Details
                </button>
                <button
                  className="feedback-btn"
                  onClick={() => handleOpenFeedbackModal(order)}
                >
                  Give Feedback
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showFeedbackModal && renderFeedbackModal()}
    </div>
  );

  const renderContent = () => {
    if (orderSuccess) return renderOrderSuccess();
    if (showPayment) return renderPayment();

    switch (activeSection) {
      case 'dashboard': return renderDashboard();
      case 'products': return renderProducts();
      case 'cart': return renderCart();
      case 'orders': return renderOrders();
      default: return renderDashboard();
    }
  };

  // Fetch orders when orders section is active
  useEffect(() => {
    if (activeSection === 'orders') {
      fetchOrders();
    }
  }, [activeSection]);

  useEffect(() => {
    // Fetch products from backend API
    const fetchProductsFromAPI = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products/all');
        const data = await response.json();
        if (response.ok) {
          const fetchedProducts = data.products || [];
          setProducts(fetchedProducts);

          // Select random 3 products for limited time offers
          const offers = selectRandomOffers(fetchedProducts);

          setLimitedTimeOffers(offers);
        } else {
          console.error('Failed to fetch products:', data.error);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProductsFromAPI();
    fetchCustomerStats();
  }, []);

  // Function to select random 3 offers with discounts
  const selectRandomOffers = (products) => {
    if (products.length === 0) return [];
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const selectedProducts = products.length <= 3 ? products : shuffled.slice(0, 3);

    const discountOptions = [
      { type: 'amount', value: 100 },
      { type: 'amount', value: 200 },
      { type: 'amount', value: 500 },
      { type: 'percent', value: 10 },
      { type: 'percent', value: 20 }
    ];

    return selectedProducts.map(p => {
      const discount = discountOptions[Math.floor(Math.random() * discountOptions.length)];
      let originalPrice = parseFloat(p.price) || 0;
      if (originalPrice <= 0) originalPrice = 1000; // Set default price if invalid
      let discountedPrice;
      if (discount.type === 'amount') {
        discountedPrice = Math.max(0, originalPrice - discount.value);
      } else {
        discountedPrice = originalPrice * (1 - discount.value / 100);
      }
      discountedPrice = Math.round(discountedPrice * 100) / 100; // Round to 2 decimal places

      return {
        ...p,
        description: 'Limited Time Offer!',
        duration: 24 * 60 * 60 * 1000, // 24 hours
        originalPrice,
        discountType: discount.type,
        discountValue: discount.value,
        discountedPrice
      };
    });
  };

  return (
    <div className="customer-dashboard">
      <aside className={`customer-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>EcoBazaarX</h2>

        </div>
        <nav className="sidebar-nav">
          <div className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
               onClick={() => setActiveSection('dashboard')}>
              Dashboard
          </div>
          <div className={`nav-item ${activeSection === 'products' ? 'active' : ''}`}
               onClick={() => setActiveSection('products')}>
               Products
          </div>
          <div className={`nav-item ${activeSection === 'cart' ? 'active' : ''}`}
               onClick={() => setActiveSection('cart')}>
              Cart ({cart.length})
          </div>
          <div className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
               onClick={() => setActiveSection('orders')}>
               Orders
          </div>
          <div className={`nav-item ${activeSection === 'logout' ? 'active' : ''}`} onClick={handleLogout}>
            Logout
          </div>
      </nav>
      </aside>

      <main className="customer-main-content">
        <header className="main-header">
          <HamburgerMenu isOpen={isSidebarOpen} toggle={toggleSidebar} />
          <h1>Eco-Friendly Shopping</h1>
          <div className="header-actions">
            {/* <span className="cart-badge" onClick={() => setActiveSection('cart')}>
              {cart.length}
            </span> */}
          </div>
        </header>

        {renderContent()}

        {/* Chatbot Icon */}
        <div className="chatbot-container">
          <button
            className="chatbot-icon"
            onClick={() => setShowChatbot(true)}
            aria-label="Open Chatbot"
            title="Ask me about eco-friendly products!"
          >
            💬
          </button>
        </div>

        {/* Chatbot */}
        <AssistantChat
          isOpen={showChatbot}
          onClose={() => setShowChatbot(false)}
        />
      </main>

      {showOrderDetails && renderOrderDetails()}
      {showTrackOrderModal && renderTrackOrderModal()}
    </div>
  );
};

export default CustomerDashboard;
