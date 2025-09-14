
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from '../components/HamburgerMenu';
import './SellerDashboard.css';

// Simple logger utility
const logger = {
  info: (message) => console.log(`[INFO] ${new Date().toISOString()}: ${message}`),
  error: (message) => console.error(`[ERROR] ${new Date().toISOString()}: ${message}`)
};

const SellerDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [activeOrderTab, setActiveOrderTab] = useState('new');
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar starts closed
  const [sellerProfile, setSellerProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalFeedback: 0
  });
  const [profileForm, setProfileForm] = useState({
    name: '',
    storeName: '',
    productCategories: [],
    description: '',
    phoneNumber: '',
    address: '',
    website: ''
  });
  const navigate = useNavigate();
  
  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isVerified = user?.is_verified || false;

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // State for seller stats
  const [sellerStats, setSellerStats] = useState({
    totalSales: 3,
    totalRevenue: 0.00,
    carbonFootprint: 1.8,
    rating: 4.8,
    ecoBadge: 'Eco Champion',
    leaderboardPosition: 12,
    pendingPayouts: 1245.75,
    completedOrder: 134,
    returnedOrder: 8
  });

  const products = [
    { id: 1, name: 'Organic Cotton T-Shirt', price: 29.99, status: 'Active', carbonFootprint: 1.2, ecoRating: 'A', inventory: 45, sales: 89, category: 'Fashion' },
    { id: 2, name: 'Bamboo Toothbrush', price: 12.99, status: 'Active', carbonFootprint: 0.8, ecoRating: 'A+', inventory: 78, sales: 156, category: 'Personal Care' },
    { id: 3, name: 'Recycled Notebook', price: 8.99, status: 'Active', carbonFootprint: 0.5, ecoRating: 'A', inventory: 23, sales: 34, category: 'Office' },
    { id: 4, name: 'Hemp Bag', price: 24.99, status: 'Warning', carbonFootprint: 3.2, ecoRating: 'C', inventory: 12, sales: 8, warning: 'High carbon footprint', category: 'Accessories' }
  ];

  const Order = [
    { id: 1, customer: 'John Doe', product: 'Organic Cotton T-Shirt', price: 29.99, status: 'Pending', date: '2024-01-15', shipping: 'Standard', quantity: 1 },
    { id: 2, customer: 'Jane Smith', product: 'Bamboo Toothbrush', price: 12.99, status: 'Processing', date: '2024-01-16', shipping: 'Eco', quantity: 2 },
    { id: 3, customer: 'Bob Wilson', product: 'Recycled Notebook', price: 8.99, status: 'Shipped', date: '2024-01-14', shipping: 'Standard', quantity: 1 },
    { id: 4, customer: 'Alice Brown', product: 'Hemp Bag', price: 24.99, status: 'Delivered', date: '2024-01-13', shipping: 'Eco', quantity: 1 },
    { id: 5, customer: 'Mike Johnson', product: 'Organic Cotton T-Shirt', price: 29.99, status: 'Returned', date: '2024-01-12', shipping: 'Standard', quantity: 1 }
  ];





  const sellersidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'D' },
    { id: 'add-product', label: 'Add Product', icon: '+' },
    { id: 'products', label: 'View Products', icon: 'P' },
    { id: 'Order', label: 'Order', icon: 'O' },
    { id: 'analytics', label: 'Carbon Analytics', icon: 'C' },
    { id: 'earnings', label: 'Earnings', icon: 'Rs' },
    { id: 'feedback', label: 'Customer Feedback', icon: 'F' }
  ];

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    materials: '',
    manufacturing: '',
    shippingMethod: 'standard',
    shopName: '',
    ecoTags: [],
    images: [],
    imageUrls: [],
    imageUrlInput: '',
    inventory: ''
  });

  const [existingImageUrls, setExistingImageUrls] = useState([]);

  const [newEcoTag, setNewEcoTag] = useState('');
  const [backendProducts, setBackendProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products/my-products', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (response.ok) {
        setBackendProducts(result.products || []);
      } else {
        console.error('Failed to fetch products:', result.error);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Fetch products when component mounts
  React.useEffect(() => {
    if (activeSection === 'products' || activeSection === 'analytics') {
      fetchProducts();
    }
  }, [activeSection]);

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders/seller-orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (response.ok) {
        setSellerOrders(result.orders || []);
      } else {
        console.error('Failed to fetch orders:', result.error);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch orders when Order section is active
  React.useEffect(() => {
    if (activeSection === 'Order') {
      fetchOrders();
    }
  }, [activeSection]);

  // Fetch seller stats from backend
  const fetchSellerStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/sellers/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (response.ok) {
        setSellerStats({
          totalSales: result.totalSales || 0,
          totalRevenue: result.totalRevenue || 0.00,
          carbonFootprint: result.carbonFootprint || 0,
          rating: result.rating || 4.8,
          ecoBadge: result.ecoBadge || 'Green Seller',
          leaderboardPosition: result.leaderboardPosition || 12,
          pendingPayouts: result.pendingPayouts || 1245.75,
          completedOrder: result.completedOrder || 134,
          returnedOrder: result.returnedOrder || 8
        });
      } else {
        console.error('Failed to fetch seller stats:', result.error);
        // Keep default values if fetch fails
      }
    } catch (error) {
      console.error('Error fetching seller stats:', error);
      // Keep default values if fetch fails
    }
  };

  // Fetch seller stats when component mounts
  React.useEffect(() => {
    fetchSellerStats();
  }, []);

  // Fetch seller profile data
  const fetchSellerProfile = async () => {
    try {
      setLoadingProfile(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/sellers/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (response.ok) {
        setSellerProfile(result);
      } else {
        console.error('Failed to fetch seller profile:', result.error);
      }
    } catch (error) {
      console.error('Error fetching seller profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch seller profile when view-profile section is active
  React.useEffect(() => {
    if (activeSection === 'view-profile') {
      fetchSellerProfile();
    }
  }, [activeSection]);

  // Fetch reviews from backend
  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders/seller-feedback', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (response.ok) {
        setReviews(result.feedback || []);
        setReviewStats({
          averageRating: result.averageRating || 0,
          totalFeedback: result.totalFeedback || 0
        });
      } else {
        console.error('Failed to fetch reviews:', result.error);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Fetch reviews when feedback section is active
  React.useEffect(() => {
    if (activeSection === 'feedback') {
      fetchReviews();
    }
  }, [activeSection]);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/sellers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });

      const result = await response.json();
      if (response.ok) {
        alert('Profile updated successfully!');
        setSellerProfile(result);
        setEditingProfile(false);
        // Refresh profile data
        fetchSellerProfile();
      } else {
        alert('Failed to update profile: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleSelectItem = (type, id) => {
    if (type === 'products') {
      setSelectedProducts(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else if (type === 'Order') {
      setSelectedOrder(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }
  };

  const handleAddEcoTag = () => {
    if (newEcoTag.trim() && !productForm.ecoTags.includes(newEcoTag.trim())) {
      setProductForm(prev => ({
        ...prev,
        ecoTags: [...prev.ecoTags, newEcoTag.trim()]
      }));
      setNewEcoTag('');
    }
  };

  const handleRemoveEcoTag = (tagToRemove) => {
    setProductForm(prev => ({
      ...prev,
      ecoTags: prev.ecoTags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleInputChange = (field, value) => {
    setProductForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setProductForm(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const handleRemoveImage = (index) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const calculateCarbonFootprint = () => {
    // Mock carbon footprint calculation based on form inputs
    let footprint = 2.0; // Base footprint
    
    if (productForm.materials.includes('organic')) footprint -= 0.5;
    if (productForm.materials.includes('recycled')) footprint -= 0.3;
    if (productForm.shippingMethod === 'eco') footprint -= 0.2;
    if (productForm.manufacturing === 'local') footprint -= 0.4;
    
    return Math.max(0.5, footprint).toFixed(1);
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    // Validation
    if (!productForm.name || !productForm.description || !productForm.price ||
        !productForm.category || !productForm.materials || !productForm.shopName ||
        !productForm.inventory) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const carbonFootprint = calculateCarbonFootprint();

      // Convert images to base64
      const imageUrls = [];
      for (const file of productForm.images) {
        try {
          const base64 = await fileToBase64(file);
          imageUrls.push(base64);
        } catch (error) {
          console.error('Error converting image to base64:', error);
        }
      }

      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
        materials: productForm.materials,
        manufacturing: productForm.manufacturing,
        shippingMethod: productForm.shippingMethod,
        shopName: productForm.shopName,
        ecoTags: productForm.ecoTags,
        carbonFootprint: parseFloat(carbonFootprint),
        inventory: parseInt(productForm.inventory),
        imageUrls: [...imageUrls, ...(productForm.imageUrls || [])]
        // sellerEmail will be automatically added by the backend from the JWT token
      };

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();

      if (response.ok) {
        alert('Product submitted successfully! Carbon footprint: ' + carbonFootprint + ' kg CO₂');
        // Reset form
        setProductForm({
          name: '',
          description: '',
          price: '',
          category: '',
          materials: '',
          manufacturing: '',
          shippingMethod: 'standard',
          shopName: '',
          ecoTags: [],
          images: [],
          imageUrls: [],
          imageUrlInput: '',
          inventory: ''
        });
        // Refresh products list
        fetchProducts();
      } else {
        alert('Failed to add product: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('Failed to add product. Please try again.');
    }
  };

  const handleOrderAction = async (orderId, action) => {
    console.log('handleOrderAction called with:', orderId, action);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: action })
      });

      const result = await response.json();
      if (response.ok) {
        alert(`Order ${orderId} ${action} successfully!`);
        fetchOrders(); // Refresh orders list
      } else {
        alert('Failed to update order: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    }
  };

  const handleReply = (reviewId) => {
    if (replyText.trim()) {
      console.log('Reply to review', reviewId, ':', replyText);
      alert('Reply submitted successfully!');
      setReplyText('');
    }
  };

  const handleLogout = () => {
    console.log('Logout button clicked');
    console.log('User before logout:', localStorage.getItem('user'));

    // Clear all authentication data
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    console.log('User after logout:', localStorage.getItem('user'));
    console.log('Navigating to auth page');

    // Navigate to auth page immediately after clearing localStorage
    navigate('/auth', { replace: true });
  };

  // Handle Edit Product
  const handleEditProduct = (product) => {
    logger.info(`Editing product: ${product.name}`);
    setEditingProduct(product);
    setExistingImageUrls(product.imageUrls || []);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      materials: product.materials || '',
      manufacturing: product.manufacturing || '',
      shippingMethod: product.shippingMethod || 'standard',
      shopName: product.shopName || '',
      ecoTags: product.ecoTags || [],
      images: [], // Reset images for editing
      imageUrls: product.imageUrls || [],
      imageUrlInput: '',
      inventory: product.inventory || ''
    });
    setActiveSection('add-product');
  };

  // Handle View Product
  const handleViewProduct = (product) => {
    logger.info(`Viewing product: ${product.name}`);
    setViewingProduct(product);
    setShowViewModal(true);
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      logger.info(`Deleting product: ${productId}`);
      try {
        const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

        if (response.ok) {
          alert('Product deleted successfully!');
          fetchProducts(); // Refresh the products list
        } else {
          const result = await response.json();
          alert('Failed to delete product: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  // Handle Update Product (for editing)
  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!editingProduct) return;

    // Validation
    if (!productForm.name || !productForm.description || !productForm.price ||
        !productForm.category || !productForm.materials || !productForm.shopName ||
        !productForm.inventory) {
      alert('Please fill in all required fields.');
      return;
    }

    logger.info(`Updating product: ${productForm.name}`);
    try {
      const carbonFootprint = calculateCarbonFootprint();

      // Convert images to base64 if new images are uploaded
      const imageUrls = [];
      for (const file of productForm.images) {
        try {
          const base64 = await fileToBase64(file);
          imageUrls.push(base64);
        } catch (error) {
          console.error('Error converting image to base64:', error);
        }
      }

      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
        materials: productForm.materials,
        manufacturing: productForm.manufacturing,
        shippingMethod: productForm.shippingMethod,
        shopName: productForm.shopName,
        ecoTags: productForm.ecoTags,
        carbonFootprint: parseFloat(carbonFootprint),
        inventory: parseInt(productForm.inventory),
        imageUrls: [...(editingProduct.imageUrls || []), ...imageUrls]
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();

      if (response.ok) {
        logger.info(`Product updated successfully: ${productData.name}`);
        alert('Product updated successfully! Carbon footprint: ' + carbonFootprint + ' kg CO₂');
        // Reset form and state
        setProductForm({
          name: '',
          description: '',
          price: '',
          category: '',
          materials: '',
          manufacturing: '',
          shippingMethod: 'standard',
          shopName: '',
          ecoTags: [],
          images: [],
          imageUrls: [],
          imageUrlInput: '',
          inventory: ''
        });
        setEditingProduct(null);
        setActiveSection('products');
        fetchProducts(); // Refresh products list
      } else {
        logger.error(`Failed to update product: ${result.error}`);
        alert('Failed to update product: ' + result.error);
      }
    } catch (error) {
      logger.error(`Error updating product: ${error.message}`);
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const renderDashboard = () => (
    <div className="seller-dashboard-content">
      <div className="welcome-banner">
        <h1>Welcome, Eco Seller!</h1>
        <div className="eco-badge-large">{sellerStats.ecoBadge}</div>
        <p style={{ color: 'yellow' }}>You're ranked #{sellerStats.leaderboardPosition} in our sustainability leaderboard</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <span className="stat-number">{sellerStats.totalSales}</span>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <span className="stat-number">Rs{sellerStats.totalRevenue}</span>
        </div>
        <div className="stat-card">
          <h3>Carbon Footprint</h3>
          <span className="stat-number">{sellerStats.carbonFootprint} kg CO₂</span>
        </div>
        <div className="stat-card">
          <h3>Completed Orders</h3>
          <span className="stat-number">{sellerStats.completedOrder}</span>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons-grid">
          <button className="action-btn" onClick={() => setActiveSection('add-product')}>
            <span className="action-icon">+</span>
            Add New Product
          </button>
          <button className="action-btn" onClick={() => setActiveSection('Order')}>
            <span className="action-icon">O</span>
            View Order
          </button>
          <button className="action-btn" onClick={() => setActiveSection('analytics')}>
            <span className="action-icon">C</span>
            Carbon Analytics
          </button>
        </div>
      </div>


    </div>
  );

  const renderAddProduct = () => (
    <div className="seller-form-content">
      <div className="section-header">
        <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
        <p>{editingProduct ? 'Update the product details below' : 'Fill in the details below to list a new eco-friendly product'}</p>
      </div>
      <form onSubmit={editingProduct ? handleUpdateProduct : handleSubmitProduct} className="product-form">
        <div className="form-columns">
          <div className="form-column">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={productForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your product features and benefits"
                rows="4"
                required
              />
            </div>
            <div className="form-group">
              <label>Price (Rs) *</label>
              <input
                type="number"
                value={productForm.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={productForm.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
              >
                <option value="">Select category</option>
                <option value="fashion">Fashion</option>
                <option value="electronics">Electronics</option>
                <option value="food">Food</option>
                <option value="home">Home & Garden</option>
                <option value="Personal-care">Personal Care</option>
                <option value="office">Office Supplies</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            <div className="form-group">
              <label>Shop Name *</label>
              <input
                type="text"
                value={productForm.shopName}
                onChange={(e) => handleInputChange('shopName', e.target.value)}
                placeholder="Enter your shop name"
                required
              />
            </div>
            <div className="form-group">
              <label>Inventory *</label>
              <input
                type="number"
                value={productForm.inventory}
                onChange={(e) => handleInputChange('inventory', e.target.value)}
                placeholder="Enter initial inventory"
                min="0"
                required
              />
            </div>
          </div>
          <div className="form-column">
            <div className="form-group">
              <label>Materials *</label>
              <input
                type="text"
                value={productForm.materials}
                onChange={(e) => handleInputChange('materials', e.target.value)}
                placeholder="e.g., organic cotton, recycled plastic"
                required
              />
            </div>
            <div className="form-group">
              <label>Manufacturing Process</label>
              <select
                value={productForm.manufacturing}
                onChange={(e) => handleInputChange('manufacturing', e.target.value)}
              >
                <option value="">Select manufacturing type</option>
                <option value="local">Local production</option>
                <option value="sustainable">Sustainable manufacturing</option>
                <option value="traditional">Traditional manufacturing</option>
              </select>
            </div>
            <div className="form-group">
              <label>Shipping Method</label>
              <select
                value={productForm.shippingMethod}
                onChange={(e) => handleInputChange('shippingMethod', e.target.value)}
              >
                <option value="standard">Standard Shipping</option>
                <option value="eco">Eco-friendly Shipping</option>
                <option value="carbon-neutral">Carbon Neutral Shipping</option>
              </select>
            </div>
            <div className="form-group">
              <label>Eco Tags</label>
              <div className="ecotags-container">
                <div className="ecotags-input">
                  <input
                    type="text"
                    value={newEcoTag}
                    onChange={(e) => setNewEcoTag(e.target.value)}
                    placeholder="Add eco tag..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddEcoTag()}
                  />
                  <button type="button" onClick={handleAddEcoTag} className="btn-primary">
                    Add
                  </button>
                </div>
                <div className="ecotags-list">
                  {productForm.ecoTags.map((tag, index) => (
                    <span key={index} className="eco-tag">
                      {tag}
                      <button type="button" onClick={() => handleRemoveEcoTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Product Images</label>
              <div className="image-upload" onClick={() => document.getElementById('image-upload').click()}>
                <p>Click to upload images or drag and drop</p>
                <p style={{ fontSize: '12px', color: '#6c757d' }}>PNG, JPG, GIF up to 10MB</p>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
              {productForm.images.length > 0 && (
                <div className="image-preview">
                  {productForm.images.map((image, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={URL.createObjectURL(image)} alt={`Preview ${index}`} />
                      <button type="button" onClick={() => handleRemoveImage(index)}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="form-group">
                <label>Add Image URL</label>
                <input
                  type="text"
                  placeholder="Enter image URL "
                  value={productForm.imageUrlInput || ''}
                  onChange={(e) => handleInputChange('imageUrlInput', e.target.value)}
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    if (productForm.imageUrlInput && productForm.imageUrlInput.trim() && !productForm.imageUrls.includes(productForm.imageUrlInput.trim())) {
                      setProductForm(prev => ({
                        ...prev,
                        imageUrls: [...(prev.imageUrls || []), prev.imageUrlInput.trim()],
                        imageUrlInput: ''
                      }));
                    }
                  }}
                >
                  Add Image URL
                </button>
                {productForm.imageUrls && productForm.imageUrls.length > 0 && (
                  <div className="image-url-preview">
                    <h5>Added Image URLs:</h5>
                    {productForm.imageUrls.map((url, index) => (
                      <div key={index} className="image-url-item">
                        <span>{url}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setProductForm(prev => ({
                              ...prev,
                              imageUrls: prev.imageUrls.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="carbon-preview">
              <h4>Estimated Carbon Footprint</h4>
              <div className="carbon-score">{calculateCarbonFootprint()} kg CO₂</div>
              <p style={{ fontSize: '12px', margin: '8px 0 0 0', color: '#6c757d' }}>
                Based on your product details
              </p>
            </div>
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => setActiveSection('products')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {editingProduct ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderProducts = () => (
    <div className="seller-products-content">
      <div className="section-header">
        <h2>My Products</h2>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setActiveSection('add-product')}>
            Add New Product
          </button>
        </div>
      </div>

      <div className="filteRs">
        <input type="text" placeholder="Search products..." className="search-input" />
        <select className="filter-select">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="warning">Warning</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="products-grid">
        {backendProducts.length > 0 ? (
          backendProducts.map(product => (
            <div key={product.id} className={`product-card ${product.status === 'Warning' ? 'warning' : ''}`}>
              <div className="product-header">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleSelectItem('products', product.id)}
                />
                <span className={`status-badge ${product.status ? product.status.toLowerCase() : 'active'}`}>
                  {product.status || 'Active'}
                </span>
              </div>

              {/* Product Images */}
              {product.imageUrls && product.imageUrls.length > 0 && (
                <div className="product-image">
                  <img
                    src={product.imageUrls[0]}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = '/placeholder-image.png'; // Fallback image
                    }}
                  />
                </div>
              )}

              <div className="product-info">
                <h3 className="product-name" style={{textAlign: 'center'}}>{product.name}</h3>
                <p className="product-shopname">Shop: {product.shopName}</p>
                <div className="product-details-container">
                  <div className="product-details-row">
                    <p><strong>Price:</strong> Rs{product.price}</p>
                    <p><strong>Category:</strong> {product.category || 'N/A'}</p>
                  </div>
                  <div className="product-details-row">
                    <p><strong>Carbon Footprint:</strong> {product.carbonFootprint} kg CO₂</p>
                    <p><strong>Inventory:</strong> {product.inventory || 0}</p>
                  </div>
                  <div className="product-details-row">
                    <p><strong>Sales:</strong> {product.sales || 0}</p>
                    <span className={`eco-rating ${product.ecoRating ? product.ecoRating.toLowerCase() : 'a'}`}>
                      {product.ecoRating || 'A'} Eco Rating
                    </span>
                  </div>
                </div>
                {product.warning && (
                  <div className="warning-message">
                    ! {product.warning}
                  </div>
                )}
              </div>
              <div className="product-actions">
                <button
                  type="button"
                  className="edit-btn"
                  onClick={() => handleEditProduct(product)}
                  title="Edit this product"
                  aria-label={`Edit ${product.name}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => handleDeleteProduct(product.id)}
                  title="Delete this product"
                  aria-label={`Delete ${product.name}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            <p>No products found. Add your first product to get started!</p>
            <button className="btn-primary" onClick={() => setActiveSection('add-product')}>
              Add Your First Product
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderOrder = () => (
    <div className="seller-Order-content">
      <div className="section-header">
        <h2>Order</h2>
        <div className="order-tabs">
          {['new', 'processing', 'shipped', 'delivered', 'returned'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeOrderTab === tab ? 'active' : ''}`}
              onClick={() => setActiveOrderTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loadingOrders ? (
        <div className="loading">Loading orders...</div>
      ) : (
        <div className="Order-grid">
          {sellerOrders.length > 0 ? (
            sellerOrders.filter(order => activeOrderTab === 'new' || order.status.toLowerCase() === activeOrderTab).map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <input
                    type="checkbox"
                    checked={selectedOrder.includes(order.id)}
                    onChange={() => handleSelectItem('Order', order.id)}
                  />
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                  <span className="order-date">{new Date(order.orderDate).toLocaleDateString()}</span>
                </div>
                <div className="order-info">
                  <h3>Order #{order.id}</h3>
                  <p><strong>Customer:</strong> {order.customerEmail || 'N/A'}</p>
                  <div className="order-container">
                    <div className="product-info-container">
                  <p><strong>Shop:</strong> {order.items && order.items.length > 0 ? order.items[0].shopName || 'N/A' : 'N/A'}</p>
                  <p><strong>Price:</strong> Rs{order.items && order.items.length > 0 ? order.items[0].price || 0 : 0}</p>
                  <p><strong>Eco Rating:</strong> {order.items && order.items.length > 0 ? order.items[0].ecoRating || 'A' : 'A'}</p>
                    </div>
                    <div className="order-details-container">
                      <p><strong>Items:</strong> {order.items ? order.items.length : 1}</p>
                      <p><strong>Total:</strong> Rs{order.totalAmount || 699}</p>
                      <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                      <p><strong>Carbon Saved:</strong> {order.carbonSaved || '1.8'} kg CO₂</p>
                    </div>
                  </div>
                  <p><strong>Status:</strong> {order.status || 'PENDING'}</p>
                  <p><strong>Shipping:</strong> <button className="btn-link" onClick={() => alert(`Shipping Address: ${order.shippingAddress || 'Standard'}`)}>View Details</button></p>
                </div>
                <div className="order-actions">
                  {order.status?.toLowerCase() === 'pending' && (
                    <>
                      <button className="btn-primary" onClick={() => handleOrderAction(order.id, 'confirmed')}>
                        Accept
                      </button>
                      <button className="btn-danger" onClick={() => handleOrderAction(order.id, 'cancelled')}>
                        Reject
                      </button>
                    </>
                  )}
                  {order.status?.toLowerCase() === 'confirmed' && (
                    <>
                      <button className="btn-primary" onClick={() => handleOrderAction(order.id, 'shipped')}>
                        Mark as Shipped
                      </button>
                      <button className="btn-primary" onClick={() => handleOrderAction(order.id, 'delivered')}>
                        Mark as Delivered
                      </button>
                    </>
                  )}
                  {order.status?.toLowerCase() === 'shipped' && (
                    <button className="btn-primary" onClick={() => handleOrderAction(order.id, 'delivered')}>
                      Mark as Delivered
                    </button>
                  )}
                  {order.status?.toLowerCase() === 'delivered' && (
                    <span className="status-completed">Order Completed</span>
                  )}
                  {order.status?.toLowerCase() === 'cancelled' && (
                    <span className="status-cancelled">Order Cancelled</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-orders">
              <p>No orders found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => {
    // Compute carbon footprint by category from backendProducts
    const carbonByCategory = backendProducts.reduce((acc, product) => {
      let category = product.category || 'Other';
      // Normalize category names
      if (category === 'Personal-care') {
        category = 'Personal Care';
      } else if (category === 'fashion') {
        category = 'Fashion';
      } else if (category === 'office') {
        category = 'Office';
      } else if (category === 'accessories') {
        category = 'Accessories';
      } else {
        category = category.charAt(0).toUpperCase() + category.slice(1);
      }
      acc[category] = (acc[category] || 0) + (product.carbonFootprint || 0);
      return acc;
    }, {});

    return (
      <div className="seller-analytics-content">
        <div className="section-header">
          <h2>Carbon Analytics</h2>
          <p>Track your environmental impact and sustainability metrics</p>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Total Carbon Footprint</h3>
            <div className="carbon-metric">{sellerStats.carbonFootprint} kg CO₂</div>
          </div>
          <div className="analytics-card">
            <h3>Completed Orders</h3>
            <div className="carbon-metric">{sellerStats.completedOrder}</div>
          </div>

        </div>

        <div className="impact-breakdown">
          <div className="breakdown-card">
            <h3>Carbon Impact by Category</h3>
            <div className="category-list">
              {Object.entries(carbonByCategory).map(([category, total]) => (
                <div key={category} className="category-item">
                  <span>{category}</span>
                  <span className="impact-value">{total.toFixed(1)} kg CO₂</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEarnings = () => (
    <div className="seller-earnings-content">
      <div className="section-header">
        <h2>Earnings Dashboard</h2>
        <p>Track your revenue, payouts, and financial performance</p>
      </div>

      <div className="earnings-summary-grid">
        <div className="earnings-card primary">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <div className="earnings-amount">Rs{sellerStats.totalRevenue}</div>
            <div className="earnings-change positive">+12% this month</div>
          </div>
        </div>

        <div className="earnings-card secondary">
          <div className="card-icon">⏳</div>
          <div className="card-content">
            <h3>Pending Payouts</h3>
            <div className="earnings-amount">Rs{sellerStats.pendingPayouts}</div>
            <div className="earnings-change info">Available in 3 days</div>
          </div>
        </div>

        <div className="earnings-card success">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <h3>Completed Order</h3>
            <div className="earnings-amount">{sellerStats.completedOrder}</div>
            <div className="earnings-change neutral">This month</div>
          </div>
        </div>
      </div>

      <div className="transactions-section">
        {/* <h3>Recent Transactions</h3> */}
        <div className="transactions-list">
          {transactions.map(transaction => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-info">
                <span className="transaction-type">{transaction.type}</span>
                <span className="transaction-order">Order {transaction.orderId}</span>
                <span className="transaction-date">{transaction.date}</span>
              </div>
              <div className="transaction-amount">
                <span className={`amount ${transaction.type === 'Refund' ? 'negative' : 'positive'}`}>
                  {transaction.type === 'Refund' ? '-' : '+'}Rs{Math.abs(transaction.amount).toFixed(2)}
                </span>
                <span className={`status ${transaction.status.toLowerCase()}`}>
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="seller-feedback-content">
      <div className="section-header">
        <h2>Customer Reviews</h2>
        <p>Manage reviews and customer interactions</p>
      </div>

      {loadingReviews ? (
        <div className="loading">Loading reviews...</div>
      ) : (
        <>
          <div className="feedback-stats">
            <div className="feedback-stat">
              <h3>Average Rating</h3>
              <div className="rating-display">
                <span className="rating-number">{reviewStats.averageRating || 0}</span>
                <span className="rating-stars">⭐⭐⭐⭐⭐</span>
              </div>
            </div>
            <div className="feedback-stat">
              <h3>Total Reviews</h3>
              <div className="review-count">{reviewStats.totalFeedback || 0}</div>
            </div>
            <div className="feedback-stat">
              <h3>Response Rate</h3>
              <div className="response-rate">95%</div>
            </div>
          </div>

          <div className="reviews-content">
            <h3>Recent Reviews</h3>
            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <span className="customer-name">{review.customerName || review.customer || 'Anonymous'}</span>
                      <span className="review-date">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <span className="review-product">{review.productName || review.product || 'Product'}</span>
                    <div className="review-rating">
                      {'⭐'.repeat(review.rating || 0)}
                    </div>
                    <p className="review-text">{review.comment || review.feedback || 'No comment'}</p>
                    <div className="review-actions">
                      <button className="reply-btn" onClick={() => handleReply(review.id)}>
                        Reply
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-reviews">
                  <p>No reviews found yet. Reviews will appear here once customers leave feedback on your products.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderViewProfile = () => (
    <div className="seller-profile-content">
      <div className="section-header">
        <h2>{editingProfile ? 'Edit Profile' : 'My Profile'}</h2>
        <p>{editingProfile ? 'Update your seller profile information' : 'View your complete seller profile information'}</p>
      </div>

      {loadingProfile ? (
        <div className="loading">Loading profile...</div>
      ) : editingProfile ? (
        <div className="profile-edit-container">
          <form onSubmit={handleUpdateProfile} className="profile-edit-form">
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Store Name *</label>
                  <input
                    type="text"
                    value={profileForm.storeName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, storeName: e.target.value }))}
                    placeholder="Enter your store name"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Product Categories</h3>
              <p>Update your product categories</p>
              <div className="categories-grid">
                {['Fashion', 'Electronics', 'Food', 'Home & Garden', 'Personal Care', 'Office Supplies', 'Accessories', 'Books', 'Sports', 'Automotive', 'Health', 'Beauty'].map(category => (
                  <div
                    key={category}
                    className={`category-item ${profileForm.productCategories.includes(category) ? 'selected' : ''}`}
                    onClick={() => {
                      setProfileForm(prev => ({
                        ...prev,
                        productCategories: prev.productCategories.includes(category)
                          ? prev.productCategories.filter(c => c !== category)
                          : [...prev.productCategories, category]
                      }));
                    }}
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3>Store Description</h3>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={profileForm.description}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
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
                    value={profileForm.phoneNumber}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    value={profileForm.website}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={profileForm.address}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your business address"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditingProfile(false);
                  // Reset form to original values
                  if (sellerProfile) {
                    setProfileForm({
                      name: sellerProfile.name || '',
                      storeName: sellerProfile.storeName || '',
                      productCategories: sellerProfile.productCategories || [],
                      description: sellerProfile.description || '',
                      phoneNumber: sellerProfile.phoneNumber || '',
                      address: sellerProfile.address || '',
                      website: sellerProfile.website || ''
                    });
                  }
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Update Profile
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="profile-container">
          <div className="profile-info">
            <div className="profile-avatar-large">
              {sellerProfile?.name ? sellerProfile.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="profile-details">
              <h3>{sellerProfile?.name || user?.email || 'Seller Name'}</h3>
              <p>{user?.email || 'seller@example.com'}</p>
            </div>
          </div>

          <div className="profile-details-grid">
            <div className="profile-detail-section">
              <h4>Business Information</h4>
              <div className="detail-item">
                <span className="detail-label">Store Name:</span>
                <span className="detail-value">{sellerProfile?.storeName || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{sellerProfile?.description || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Website:</span>
                <span className="detail-value">
                  {sellerProfile?.website ? (
                    <a href={sellerProfile.website} target="_blank" rel="noopener noreferrer">
                      {sellerProfile.website}
                    </a>
                  ) : 'Not provided'}
                </span>
              </div>
            </div>

            <div className="profile-detail-section">
              <h4>Contact Information</h4>
              <div className="detail-item">
                <span className="detail-label">Phone Number:</span>
                <span className="detail-value">{sellerProfile?.phoneNumber || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{sellerProfile?.address || 'Not provided'}</span>
              </div>
            </div>

            <div className="profile-detail-section">
              <h4>Performance Metrics</h4>
              <div className="detail-item">
                <span className="detail-label">Total Sales:</span>
                <span className="detail-value">{sellerStats.totalSales}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Rating:</span>
                <span className="detail-value">{sellerStats.rating}⭐</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Eco Badge:</span>
                <span className="detail-value">{sellerStats.ecoBadge}</span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button
              className="btn-primary"
              onClick={() => {
                setEditingProfile(true);
                // Initialize form with current profile data
                if (sellerProfile) {
                  setProfileForm({
                    name: sellerProfile.name || '',
                    storeName: sellerProfile.storeName || '',
                    productCategories: sellerProfile.productCategories || [],
                    description: sellerProfile.description || '',
                    phoneNumber: sellerProfile.phoneNumber || '',
                    address: sellerProfile.address || '',
                    website: sellerProfile.website || ''
                  });
                }
              }}
            >
              Edit Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderPendingVerification = () => (
    <div className="seller-dashboard-content" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '70vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div className="pending-verification-message" style={{
        textAlign: 'center',
        background: 'white',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '90%'
      }}>
        <div className="pending-icon" style={{
          fontSize: '4rem',
          marginBottom: '1.5rem',
          animation: 'pulse 2s infinite'
        }}>⏳</div>
        <h1 style={{
          color: '#2c3e50',
          marginBottom: '1rem',
          fontSize: '2.5rem',
          fontWeight: '300'
        }}>Your Verification is Pending</h1>
        <p style={{
          color: '#7f8c8d',
          fontSize: '1.1rem',
          marginBottom: '0.5rem',
          lineHeight: '1.6'
        }}>Please wait 2-3 days until your application is approved.</p>
        <p style={{
          color: '#95a5a6',
          fontSize: '1rem',
          lineHeight: '1.6'
        }}>Once approved, you will have full access to your seller dashboard.</p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!isVerified) {
      return renderPendingVerification();
    }

    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'add-product':
        return renderAddProduct();
      case 'products':
        return renderProducts();
      case 'Order':
        return renderOrder();
      case 'analytics':
        return renderAnalytics();
      case 'earnings':
        return renderEarnings();
      case 'feedback':
        return renderFeedback();
      case 'view-profile':
        return renderViewProfile();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="seller-dashboard">
      {/* Left Sidebar */}
      <aside className={`seller-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2 style={{ color: 'yellow' }}>EcoBazaarX Seller</h2>
        </div>
        <nav className="sidebar-nav">
          {sellersidebarItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
        {/* Sidebar Footer with Logout */}
        <div className="sidebar-footer">
          <div className="nav-item logout-item" onClick={handleLogout}>
            <span className="nav-icon"></span>
            <span className="nav-label">Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
       <main className={`seller-main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Top Bar */}
        <header className="seller-top-bar">
          <div className="hamburger-section">
            <HamburgerMenu isOpen={isSidebarOpen} toggle={toggleSidebar} />
          </div>
          <div className="search-section">
            <input type="text" placeholder="Search..." className="search-bar" />
          </div>
          <div className="profile-section">
            <span>Welcome, Eco Seller!</span>
            <div className="profile-avatar">ES</div>
          </div>
        </header>

        {/* Content Area */}
        <div className="seller-content-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;
