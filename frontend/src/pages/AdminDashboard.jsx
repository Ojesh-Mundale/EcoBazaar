import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from '../components/HamburgerMenu';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar starts closed
  const [customers, setCustomers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const navigate = useNavigate();

  // Fetch customers from DB
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/customers', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCustomers(data);
        } else {
          console.error('Failed to fetch customers');
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  // Fetch sellers from DB
  useEffect(() => {
    const fetchSellers = async () => {
      setLoadingSellers(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/sellers', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setSellers(data);
        } else {
          console.error('Failed to fetch sellers');
        }
      } catch (error) {
        console.error('Error fetching sellers:', error);
      } finally {
        setLoadingSellers(false);
      }
    };
    fetchSellers();
  }, []);

  // Toggle sidebar for mobile view
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // State and handlers for product details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedProduct(null);
  };

  // State and handlers for seller details modal
  const [showSellerDetailsModal, setShowSellerDetailsModal] = useState(false);
  const [selectedSellerDetails, setSelectedSellerDetails] = useState(null);
  const [loadingSellerDetails, setLoadingSellerDetails] = useState(false);

  const handleViewSellerDetails = async (sellerId) => {
    setLoadingSellerDetails(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/sellers/${sellerId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();

        // Map backend fields to frontend expected fields
        const mappedData = {
          id: data.id,
          email: data.seller ? data.seller.email : 'N/A',
          name: data.name || 'N/A',
          phone: data.phoneNumber || 'N/A',
          storeName: data.storeName || 'N/A',
          storeDescription: data.description || 'N/A',
          website: data.website || 'N/A',
          totalProducts: data.totalProducts || 0,
          totalOrders: data.totalOrders || 0,
          carbonFootprint: data.carbonFootprint || 0,
          isVerified: data.seller ? data.seller.isVerified : false,
          registrationDate: data.createdAt || null
        };

        setSelectedSellerDetails(mappedData);
        setShowSellerDetailsModal(true);
      } else {
        alert("Failed to fetch seller details.");
      }
    } catch (error) {
      console.error("Error fetching seller details:", error);
      alert("Error fetching seller details.");
    } finally {
      setLoadingSellerDetails(false);
    }
  };

  const closeSellerDetailsModal = () => {
    setShowSellerDetailsModal(false);
    setSelectedSellerDetails(null);
  };

  // Remove hardcoded products array and add state for products
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch products from backend API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await fetch('http://localhost:5000/api/products/all');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        } else {
          console.error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Add orders state and fetch
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch orders from backend API
  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/orders/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Ensure orders is always an array
          const ordersArray = Array.isArray(data) ? data : (data?.orders || []);
          setOrders(ordersArray);
        } else {
          console.error('Failed to fetch orders');
          setOrders([]); // Set empty array on error
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]); // Set empty array on error
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  // Order filtering and sorting state
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('orderDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Flatten orders data for table display
  const orderItems = orders.flatMap(order =>
    order.items.map(item => ({
      orderId: order.id,
      customerEmail: order.customerEmail,
      productName: item.productName,
      sellerEmail: item.sellerEmail,
      quantity: item.quantity,
      orderDate: order.orderDate,
      status: order.status
    }))
  );

  // Filter and sort order items
  const filteredOrderItems = orderItems
    .filter(item => {
      const matchesSearch = orderSearchTerm === '' ||
        item.customerEmail.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        item.sellerEmail.toLowerCase().includes(orderSearchTerm.toLowerCase());

      const matchesStatus = orderStatusFilter === 'all' || item.status === orderStatusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'orderDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Export orders to CSV
  const exportOrdersToCSV = () => {
    if (!filteredOrderItems || filteredOrderItems.length === 0) return;

    const csvContent = [
      ['Customer Email', 'Product Name', 'Seller Email', 'Quantity', 'Order Date', 'Status'],
      ...filteredOrderItems.map(item => [
        item.customerEmail,
        item.productName,
        item.sellerEmail,
        item.quantity,
        new Date(item.orderDate).toLocaleDateString(),
        item.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orders_report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const adminSidebarItems = [
    { id: 'dashboard', label: 'Dashboard', },
    { id: 'customers', label: 'Customer Management',  },
    { id: 'sellers', label: 'Seller Management',  },
    { id: 'products', label: 'Product Oversight', },
    { id: 'analytics', label: 'Carbon Analytics', },
    { id: 'logout', label: 'Logout'}
  ];



  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const handleApproveSeller = async (sellerId) => {
    if (!window.confirm("Are you sure you want to approve this seller?")) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/sellers/${sellerId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        alert("Seller approved successfully.");
        // Update sellers list to reflect approval
        setSellers(prevSellers => prevSellers.map(s => s.id === sellerId ? { ...s, isVerified: true } : s));
      } else {
        alert("Failed to approve seller.");
      }
    } catch (error) {
      console.error("Error approving seller:", error);
      alert("Error approving seller.");
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        // Remove deleted customer from state
        setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== customerId));
        alert("Customer deleted successfully.");
      } else {
        alert("Failed to delete customer.");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Error deleting customer.");
    }
  };

  const handleDeleteSeller = async (sellerId) => {
    if (!window.confirm("Are you sure you want to delete this seller?")) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/sellers/${sellerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        // Remove deleted seller from state
        setSellers(prevSellers => prevSellers.filter(s => s.id !== sellerId));
        alert("Seller deleted successfully.");
      } else {
        alert("Failed to delete seller.");
      }
    } catch (error) {
      console.error("Error deleting seller:", error);
      alert("Error deleting seller.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        // Remove deleted product from state
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        alert("Product deleted successfully.");
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product.");
    }
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          {/* <span className="stat-number">1,248</span>
          <span className="stat-change">+12% this month</span> */}
        </div>
        <div className="stat-card">
          <h3>Active Sellers</h3>
          {/* <span className="stat-number">89</span>
          <span className="stat-change">+5% this month</span> */}
        </div>
        <div className="stat-card">
          <h3>Total Products</h3>
          {/* <span className="stat-number">2,456</span>
          <span className="stat-change">+8% this month</span> */}
        </div>
        <div className="stat-card">
          <h3>Carbon Saved</h3>
          {/* <span className="stat-number">12.5T</span>
          <span className="stat-change">+15% this month</span> */}
        </div>
      </div>

      <div className="orders-sellers-section">
        <div className="section-header">
          <h3>Customer Orders & Seller Products</h3>
          <div className="header-actions">
            <button className="btn-primary" onClick={exportOrdersToCSV}>Export Orders</button>
          </div>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Search orders..."
            className="search-input"
            onChange={(e) => setOrderSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            onChange={(e) => setOrderStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="orders-table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('customerEmail')} style={{ cursor: 'pointer' }}>
                  Customer Email {sortField === 'customerEmail' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('productName')} style={{ cursor: 'pointer' }}>
                  Product Name {sortField === 'productName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('sellerEmail')} style={{ cursor: 'pointer' }}>
                  Seller Email {sortField === 'sellerEmail' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th>Quantity</th>
                <th onClick={() => handleSort('orderDate')} style={{ cursor: 'pointer' }}>
                  Order Date {sortField === 'orderDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingOrders ? (
                <tr>
                  <td colSpan="6">Loading orders...</td>
                </tr>
              ) : filteredOrderItems.length > 0 ? (
                filteredOrderItems.map((item, index) => (
                  <tr key={`${item.orderId}-${index}`}>
                    <td>{item.customerEmail}</td>
                    <td>{item.productName}</td>
                    <td>{item.sellerEmail}</td>
                    <td>{item.quantity}</td>
                    <td>{new Date(item.orderDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sellers Summary */}
        <div className="sellers-summary">
          <h4>Sellers with Total Products</h4>
          <div className="sellers-grid">
            {sellers.slice(0, 6).map(seller => (
              <div key={seller.id} className="seller-card">
                <div className="seller-info">
                  <h5>{seller.storeName || seller.name}</h5>
                  <p>{seller.email}</p>
                  <span className="product-count">{seller.totalProducts} products</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomerManagement = () => (
    <div className="management-content">
      <div className="section-header">
        <h2>Customer Management</h2>
        <div className="header-actions">
          <button className="btn-primary" onClick={exportCustomersToCSV}>Export Customers</button>
        </div>
      </div>

      <div className="filters">
        <input type="text" placeholder="Search customers..." className="search-input" />
        <select className="filter-select">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>
              {/* Checkbox removed as per request */}
            </th>
            <th>Email</th>
            <th>Total Orders</th>
            <th>Total Carbon Footprint (kg CO₂)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id}>
              <td>
                {/* Checkbox removed as per request */}
              </td>
              <td>{customer.email}</td>
              <td>{customer.orders}</td>
              <td>{customer.carbonSaved.toFixed(2)}</td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn-action delete"
                    onClick={() => handleDeleteCustomer(customer.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSellerManagement = () => (
    <div className="management-content">
      <div className="section-header">
        <h2>Seller Management</h2>
        <div className="header-actions">
          <button className="btn-primary" onClick={exportSellersToCSV}>Export Sellers</button>
        </div>
      </div>

      <div className="filters">
        <input type="text" placeholder="Search sellers..." className="search-input" />
        <select className="filter-select">
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Store Name</th>
            <th>Total Products</th>
            <th>Carbon Footprint (kg CO₂)</th>
            <th>Actions</th>
          </tr>
        </thead>
      <tbody>
          {sellers.map(seller => (
            <tr key={seller.id}>
              <td>{seller.email}</td>
              <td>{seller.name}</td>
              <td>{seller.storeName}</td>
              <td>{seller.totalProducts}</td>
              <td>{seller.carbonFootprint.toFixed(2)}</td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn-action view"
                    onClick={() => handleViewSellerDetails(seller.id)}
                    disabled={loadingSellerDetails}
                  >
                    {loadingSellerDetails ? 'Loading...' : 'View Details'}
                  </button>
                  {!seller.isVerified && (
                    <button
                      className="btn-action approve"
                      onClick={() => handleApproveSeller(seller.id)}
                    >
                      Approve
                    </button>
                  )}
                  <button
                    className="btn-action delete"
                    onClick={() => handleDeleteSeller(seller.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderProductOversight = () => (
    <div className="management-content">
      <div className="section-header">
        <h2>Product Oversight</h2>
        <div className="header-actions">
          <button className="btn-primary" onClick={exportProductsToCSV}>Export Products</button>
          <button className="btn-secondary">Add Product</button>
        </div>
      </div>

      <div className="filters">
        <input type="text" placeholder="Search products..." className="search-input" />
        <select className="filter-select">
          <option value="all">All Categories</option>
          <option value="fashion">Fashion</option>
          <option value="personal-care">Personal Care</option>
          <option value="kitchen">Kitchen</option>
          <option value="office">Office</option>
        </select>
        <select className="filter-select">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="reported">Reported</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="product-table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Seller</th>
              <th>Price</th>
              <th>Category</th>
              <th>Carbon Footprint</th>
              <th>Eco Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingProducts ? (
              <tr>
                <td colSpan="8">Loading products...</td>
              </tr>
            ) : products && Array.isArray(products) && products.length > 0 ? (
              products.map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sellerEmail}</td>
                  <td>${product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.carbonFootprint} kg CO2</td>
                  <td>
                    <span className={`eco-badge ${product.ecoRating ? product.ecoRating.toLowerCase() : ''}`}>
                      {product.ecoRating}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action delete"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDetailsModal && selectedProduct && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeDetailsModal}>×</button>
            <div className="modal-body">
              <div className="modal-image-section">
                <img src={selectedProduct.imageUrls && selectedProduct.imageUrls.length > 0 ? selectedProduct.imageUrls[0] : ''} alt={selectedProduct.name} />
              </div>
              <div className="modal-details-section">
                <h3>{selectedProduct.name}</h3>
                <p><strong>Seller Email:</strong> {selectedProduct.sellerEmail}</p>
                <p><strong>Carbon Footprint:</strong> {selectedProduct.carbonFootprint} kg CO2</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Carbon Analytics Section
  const [carbonReport, setCarbonReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCarbonReport = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/carbon-report', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCarbonReport(data);
      } else {
        console.error('Failed to fetch carbon report, using mock data for testing');
        // Use mock data for testing when backend is not available
        const mockReport = generateMockCarbonReport();
        setCarbonReport(mockReport);
      }
    } catch (error) {
      console.error('Error fetching carbon report, using mock data for testing:', error);
      // Use mock data for testing when backend is not available
      const mockReport = generateMockCarbonReport();
      setCarbonReport(mockReport);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockCarbonReport = () => {
    // Generate random mock data for testing
    const totalSellers = Math.floor(Math.random() * 50) + 20;
    const activeSellers = Math.floor(totalSellers * 0.8);
    const totalProducts = Math.floor(Math.random() * 1000) + 500;
    const totalCarbonEmissions = Math.random() * 1000 + 200;
    
    const reportData = [];
    const sellerEmails = [
      'ecofashion@example.com',
      'greentech@example.com',
      'organicfoods@example.com',
      'sustainablehome@example.com',
      'greenliving@example.com',
      'ecoware@example.com',
      'natureproducts@example.com',
      'earthfriendly@example.com'
    ];
    
    for (let i = 0; i < sellerEmails.length; i++) {
      const productCount = Math.floor(Math.random() * 50) + 10;
      const totalCarbon = Math.random() * 100 + 5;
      const earningsEstimate = Math.random() * 10000 + 1000;
      
      reportData.push({
        sellerEmail: sellerEmails[i],
        productCount,
        totalCarbon,
        earningsEstimate
      });
    }
    
    return {
      totalSellers,
      activeSellers,
      totalProducts,
      totalCarbonEmissions,
      reportData
    };
  };

  const exportToCSV = () => {
    if (!carbonReport || !carbonReport.reportData) return;

    const csvContent = [
      ['Seller Email', 'Total Carbon Emissions (kg CO2)', 'Product Count', 'Earnings Estimate ($)'],
      ...carbonReport.reportData.map(item => [
        item.sellerEmail,
        item.totalCarbon,
        item.productCount,
        item.earningsEstimate.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'carbon_emission_report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCustomersToCSV = () => {
    if (!customers || customers.length === 0) return;

    const csvContent = [
      ['Email', 'Total Orders', 'Total Carbon Saved (kg CO₂)'],
      ...customers.map(customer => [
        customer.email,
        customer.orders,
        customer.carbonSaved.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customers_report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportSellersToCSV = () => {
    if (!sellers || sellers.length === 0) return;

    const csvContent = [
      ['Email', 'Name', 'Store Name', 'Total Products', 'Carbon Footprint (kg CO₂)'],
      ...sellers.map(seller => [
        seller.email,
        seller.name,
        seller.storeName,
        seller.totalProducts,
        seller.carbonFootprint.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sellers_report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportProductsToCSV = () => {
    if (!products || !Array.isArray(products) || products.length === 0) return;

    const csvContent = [
      ['Product Name', 'Seller', 'Price ($)', 'Category', 'Carbon Footprint (kg CO2)', 'Eco Rating', 'Status'],
      ...products.map(product => [
        product.name,
        product.sellerEmail,
        product.price,
        product.category,
        product.carbonFootprint,
        product.ecoRating || '',
        product.isActive ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products_report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderCarbonAnalytics = () => (
    <div className="analytics-content">
      <div className="section-header">
        <h2>Carbon Emission Analytics</h2>
        <div className="header-actions">
          <button className="btn-primary" onClick={fetchCarbonReport} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Report'}
          </button>
          <button className="btn-secondary" onClick={exportToCSV} disabled={!carbonReport}>
            Export CSV
          </button>
        </div>
      </div>

      {carbonReport && (
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Total Sellers</h3>
            <div className="carbon-metric">{carbonReport.totalSellers}</div>
            <div className="carbon-trend">Active: {carbonReport.activeSellers}</div>
          </div>
          <div className="analytics-card">
            <h3>Total Carbon Emissions</h3>
            <div className="carbon-metric">{carbonReport.totalCarbonEmissions.toFixed(2)} kg CO2</div>
            <div className="carbon-trend">Across all sellers</div>
          </div>
          <div className="analytics-card">
            <h3>Total Products</h3>
            <div className="carbon-metric">{carbonReport.totalProducts}</div>
            <div className="carbon-trend">Active products</div>
          </div>
        </div>
      )}

      {carbonReport && carbonReport.reportData && carbonReport.reportData.length > 0 && (
        <div className="report-table-section">
          <h3>Seller Carbon Emission Report</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Seller Email</th>
                <th>Total Carbon (kg CO2)</th>
                <th>Products</th>
                <th>Earnings Estimate</th>
                <th>Carbon Intensity</th>
              </tr>
            </thead>
            <tbody>
              {carbonReport.reportData.map((item, index) => (
                <tr key={index}>
                  <td>{item.sellerEmail}</td>
                  <td>{item.totalCarbon.toFixed(2)}</td>
                  <td>{item.productCount}</td>
                  <td>${item.earningsEstimate.toFixed(2)}</td>
                  <td>
                    <span className={`carbon-badge ${getCarbonIntensityClass(item.totalCarbon)}`}>
                      {getCarbonIntensityLabel(item.totalCarbon)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!carbonReport && !isLoading && (
        <div className="report-placeholder">
          <h3>Carbon Emission Report</h3>
          <p>Click "Generate Report" to view carbon emissions data for all sellers.</p>
          <p>The report will show total carbon emissions, product counts, and earnings estimates for each seller.</p>
        </div>
      )}

      {isLoading && (
        <div className="report-loading">
          <h3>Generating Carbon Report...</h3>
          <p>Please wait while we compile the carbon emission data.</p>
        </div>
      )}
    </div>
  );

  const getCarbonIntensityClass = (carbon) => {
    if (carbon === 0) return 'none';
    if (carbon <= 10) return 'low';
    if (carbon <= 50) return 'medium';
    return 'high';
  };

  const getCarbonIntensityLabel = (carbon) => {
    if (carbon === 0) return 'None';
    if (carbon <= 10) return 'Low';
    if (carbon <= 50) return 'Medium';
    return 'High';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'customers':
        return renderCustomerManagement();
      case 'sellers':
        return renderSellerManagement();
      case 'products':
        return renderProductOversight();
      case 'analytics':
        return renderCarbonAnalytics();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>EcoBazaar Admin</h2>
        </div>
        <nav className="sidebar-nav">
          {adminSidebarItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => item.id === 'logout' ? handleLogout() : setActiveSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Top Bar */}
        <header className="admin-top-bar">
          <HamburgerMenu isOpen={isSidebarOpen} toggle={toggleSidebar} />
          <div className="search-section">
            <input type="text" placeholder="Search..." className="search-bar" />
          </div>
          <div className="profile-section">
            <span>Admin User</span>
            <div className="profile-avatar">AU</div>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content-area">
          {renderContent()}
        </div>
      </main>

      {/* Seller Details Modal */}
      {showSellerDetailsModal && selectedSellerDetails && (
        <div className="modal-overlay" onClick={closeSellerDetailsModal}>
          <div className="modal-content seller-details-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeSellerDetailsModal}>×</button>
            <div className="modal-header">
              <h2>Seller Details</h2>
            </div>
            <div className="modal-body">
              <div className="seller-details-grid">
                <div className="details-section">
                  <h3>Basic Information</h3>
                  <div className="details-row">
                    <span className="label">Name:</span>
                    <span className="value">{selectedSellerDetails.name || 'N/A'}</span>
                  </div>
                  <div className="details-row">
                    <span className="label">Email:</span>
                    <span className="value">{selectedSellerDetails.email || 'N/A'}</span>
                  </div>
                  <div className="details-row">
                    <span className="label">Phone:</span>
                    <span className="value">{selectedSellerDetails.phone || 'N/A'}</span>
                  </div>
                  <div className="details-row">
                    <span className="label">Store Name:</span>
                    <span className="value">{selectedSellerDetails.storeName || 'N/A'}</span>
                  </div>
                  <div className="details-row">
                    <span className="label">Store Description:</span>
                    <span className="value">{selectedSellerDetails.storeDescription || 'N/A'}</span>
                  </div>
                  <div className="details-row">
                    <span className="label">Website:</span>
                    <span className="value">{selectedSellerDetails.website || 'N/A'}</span>
                  </div>
                </div>



                <div className="details-section">
                  <h3>Statistics</h3>
                  <div className="details-row">
                    <span className="label">Total Products:</span>
                    <span className="value">{selectedSellerDetails.totalProducts || 0}</span>
                  </div>
                  <div className="details-row">
                    <span className="label">Total Orders:</span>
                    <span className="value">{selectedSellerDetails.totalOrders || 0}</span>
                  </div>
                  <div className="details-row">
                    <span className="label">Carbon Footprint:</span>
                    <span className="value">{selectedSellerDetails.carbonFootprint ? selectedSellerDetails.carbonFootprint.toFixed(2) + ' kg CO₂' : '0 kg CO₂'}</span>
                  </div>
                  <div className="details-row">
                    <span className="label">Verification Status:</span>
                    <span className={`status-badge ${selectedSellerDetails.isVerified ? 'active' : 'inactive'}`}>
                      {selectedSellerDetails.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="details-row">
                    <span className="label">Registration Date:</span>
                    <span className="value">{selectedSellerDetails.registrationDate ? new Date(selectedSellerDetails.registrationDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
