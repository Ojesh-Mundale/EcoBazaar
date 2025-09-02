import React, { useEffect, useState } from 'react';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [customerStats, setCustomerStats] = useState({
    totalOrder: 20,
    totalSpent: 500.00,
    loyaltyPoints: 150,
    ecoScore: 85,
    carbonSaved: 45.2,
    treesSaved: 3.8,
    ecoBadge: 'Green Warrior',
    leaderboardPosition: 12
  });
  
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const [products, setProducts] = useState([]);

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
    cvv: ''
  });
  const [showPayment, setShowPayment] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const categories = ['all', 'Fashion', 'Personal Care', 'Office', 'Accessories', 'Electronics'];

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
        paymentMethod: 'Credit Card'
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
        <h1>Welcome to EcoBazaar! 🌱</h1>
        <div className="eco-badge">{customerStats.ecoBadge}</div>
        <p>You're ranked #{customerStats.leaderboardPosition} in our sustainability leaderboard</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <span className="stat-number">{customerStats.totalOrder}</span>
        </div>
        <div className="stat-card">
          <h3>Total Spent</h3>
          <span className="stat-number">Rs {customerStats.totalSpent}</span>
        </div>
        <div className="stat-card">
          <h3>Loyalty Points</h3>
          <span className="stat-number">{customerStats.loyaltyPoints}</span>
        </div>
        <div className="stat-card">
          <h3>Eco Score</h3>
          <span className="stat-number">{customerStats.ecoScore}/100</span>
        </div>
      </div>

      <div className="eco-impact">
        <h2>Your Eco Impact 🌍</h2>
        <div className="impact-cards">
          <div className="impact-card">
            <span className="impact-icon">☁️</span>
            <span className="impact-value">{customerStats.carbonSaved} kg CO₂</span>
            <span className="impact-label">Carbon Saved</span>
          </div>
          <div className="impact-card">
            <span className="impact-icon">🌳</span>
            <span className="impact-value">{customerStats.treesSaved}</span>
            <span className="impact-label">Trees Saved</span>
          </div>
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
            <div className="product-image">
              {product.imageUrls && product.imageUrls.length > 0 ? (
                <img src={product.imageUrls[0]} alt={product.name} />
              ) : (
                <span role="img" aria-label="product">{product.image || '📦'}</span>
              )}
            </div>
            <h3>{product.name}</h3>
            <p className="product-category">{product.category}</p>
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
            <div className="product-rating">
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
      <h2>Shopping Cart</h2>
      {cart.length === 0 ? (
        <p className="empty-cart">Your cart is empty</p>
      ) : (
        <>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <span className="item-image">{item.image}</span>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Rs{item.price} • {item.ecoRating} Rating</p>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div className="summary-item">
              <span>Items: {cart.length}</span>
              <span>Rs{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Carbon Saved:</span>
              <span>{getCartCarbonSaved().toFixed(1)} kg CO₂</span>
            </div>
            <div className="summary-item total">
              <span>Total:</span>
              <span>Rs{getCartTotal().toFixed(2)}</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout →
            </button>
          </div>
        </>
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
          <button type="submit" className="pay-now-btn">
            Pay Now - Rs{getCartTotal().toFixed(2)}
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

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleTrackOrder = (order) => {
    // For now, just show an alert with tracking info
    alert(`Tracking Number: ${order.trackingNumber}\nStatus: ${order.status}\nEstimated Delivery: ${order.deliveryDate || 'TBD'}`);
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
                <h3>Order #{order.id.substring(0, 8)}</h3>
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
              </div>
            </div>
          ))}
        </div>
      )}
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

  React.useEffect(() => {
    // Fetch products from backend API
    const fetchProductsFromAPI = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products/all');
        const data = await response.json();
        if (response.ok) {
          setProducts(data.products || []);
        } else {
          console.error('Failed to fetch products:', data.error);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProductsFromAPI();
  }, []);

  return (
    <div className="customer-dashboard">
      <aside className="customer-sidebar">
        <div className="sidebar-header">
          <h2>🌿 EcoBazaar</h2>

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
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span>👤 Customer</span>
            <span>⭐ Eco Score: {customerStats.ecoScore}</span>
          </div>
        </div>
      </aside>

      <main className="customer-main-content">
        <header className="main-header">
          <h1>Eco-Friendly Shopping</h1>
          <div className="header-actions">
            {/* <span className="cart-badge" onClick={() => setActiveSection('cart')}>
              {cart.length}
            </span> */}
          </div>
        </header>

        {renderContent()}
      </main>

      {showOrderDetails && renderOrderDetails()}
    </div>
  );
};

export default CustomerDashboard;
