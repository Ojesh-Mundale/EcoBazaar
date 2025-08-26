import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from '../components/HamburgerMenu';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedSellers, setSelectedSellers] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar starts closed
  const navigate = useNavigate();


  // Toggle sidebar for mobile view
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  // Mock data for demonstration
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Customer', status: 'Active', joined: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Seller', status: 'Pending', joined: '2024-01-20' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Customer', status: 'Active', joined: '2024-01-25' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Seller', status: 'Blocked', joined: '2024-02-01' }
  ];

  const sellers = [
    { id: 1, name: 'EcoFashion Store', owner: 'Jane Smith', products: 24, sales: 156, rating: 4.8, status: 'Pending', carbonScore: 'A' },
    { id: 2, name: 'GreenTech Gadgets', owner: 'Mike Johnson', products: 45, sales: 289, rating: 4.5, status: 'Approved', carbonScore: 'B' },
    { id: 3, name: 'Organic Foods Co', owner: 'Sarah Wilson', products: 32, sales: 198, rating: 4.9, status: 'Approved', carbonScore: 'A+' },
    { id: 4, name: 'Sustainable Home', owner: 'Tom Brown', products: 18, sales: 67, rating: 3.8, status: 'Suspended', carbonScore: 'C' }
  ];

  const products = [
    { id: 1, name: 'Organic Cotton T-Shirt', seller: 'EcoFashion', price: 29.99, status: 'Active', carbonFootprint: 1.2, ecoRating: 'A', category: 'Fashion' },
    { id: 2, name: 'Bamboo Toothbrush', seller: 'GreenTech', price: 12.99, status: 'Active', carbonFootprint: 0.8, ecoRating: 'A+', category: 'Personal Care' },
    { id: 3, name: 'Plastic Water Bottle', seller: 'CheapGoods', price: 5.99, status: 'Reported', carbonFootprint: 3.5, ecoRating: 'D', category: 'Kitchen' },
    { id: 4, name: 'Recycled Notebook', seller: 'EcoOffice', price: 8.99, status: 'Active', carbonFootprint: 0.5, ecoRating: 'A', category: 'Office' }
  ];

  const adminSidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'sellers', label: 'Seller Management', icon: '🏪' },
    { id: 'products', label: 'Product Oversight', icon: '📦' },
    { id: 'analytics', label: 'Carbon Analytics', icon: '📈' },
    { id: 'config', label: 'System Config', icon: '⚙️' }
  ];

  const handleSelectAll = (type, items) => {
    if (type === 'users') {
      setSelectedUsers(selectedUsers.length === items.length ? [] : items.map(u => u.id));
    } else if (type === 'sellers') {
      setSelectedSellers(selectedSellers.length === items.length ? [] : items.map(s => s.id));
    } else if (type === 'products') {
      setSelectedProducts(selectedProducts.length === items.length ? [] : items.map(p => p.id));
    }
  };

  const handleSelectItem = (type, id) => {
    if (type === 'users') {
      setSelectedUsers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else if (type === 'sellers') {
      setSelectedSellers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else if (type === 'products') {
      setSelectedProducts(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <span className="stat-number">1,248</span>
          <span className="stat-change">+12% this month</span>
        </div>
        <div className="stat-card">
          <h3>Active Sellers</h3>
          <span className="stat-number">89</span>
          <span className="stat-change">+5% this month</span>
        </div>
        <div className="stat-card">
          <h3>Total Products</h3>
          <span className="stat-number">2,456</span>
          <span className="stat-change">+8% this month</span>
        </div>
        <div className="stat-card">
          <h3>Carbon Saved</h3>
          <span className="stat-number">12.5T</span>
          <span className="stat-change">+15% this month</span>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">✅</span>
            <div className="activity-details">
              <p>Approved seller registration: EcoFashion Store</p>
              <span className="activity-time">2 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">⚠️</span>
            <div className="activity-details">
              <p>Reported product: Plastic Water Bottle</p>
              <span className="activity-time">4 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">👥</span>
            <div className="activity-details">
              <p>New user registration: Alice Brown</p>
              <span className="activity-time">6 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="management-content">
      <div className="section-header">
        <h2>User Management</h2>
        <div className="header-actions">
          <button className="btn-primary">Export Users</button>
          <button className="btn-secondary">Add User</button>
        </div>
      </div>

      <div className="filters">
        <input type="text" placeholder="Search users..." className="search-input" />
        <select className="filter-select">
          <option value="all">All Roles</option>
          <option value="customer">Customers</option>
          <option value="seller">Sellers</option>
        </select>
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
              <input
                type="checkbox"
                checked={selectedUsers.length === users.length}
                onChange={() => handleSelectAll('users', users)}
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleSelectItem('users', user.id)}
                />
              </td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className={`role-badge ${user.role.toLowerCase()}`}>
                  {user.role}
                </span>
              </td>
              <td>
                <span className={`status-badge ${user.status.toLowerCase()}`}>
                  {user.status}
                </span>
              </td>
              <td>{user.joined}</td>
              <td>
                <div className="action-buttons">
                  <button className="btn-action approve">Approve</button>
                  <button className="btn-action block">Block</button>
                  <button className="btn-action delete">Delete</button>
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
          <button className="btn-primary">Generate Report</button>
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
            <th>
              <input
                type="checkbox"
                checked={selectedSellers.length === sellers.length}
                onChange={() => handleSelectAll('sellers', sellers)}
              />
            </th>
            <th>Store Name</th>
            <th>Owner</th>
            <th>Products</th>
            <th>Sales</th>
            <th>Rating</th>
            <th>Carbon Score</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sellers.map(seller => (
            <tr key={seller.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedSellers.includes(seller.id)}
                  onChange={() => handleSelectItem('sellers', seller.id)}
                />
              </td>
              <td>{seller.name}</td>
              <td>{seller.owner}</td>
              <td>{seller.products}</td>
              <td>{seller.sales}</td>
              <td>{seller.rating} ⭐</td>
              <td>
                <span className={`carbon-badge ${seller.carbonScore.toLowerCase()}`}>
                  {seller.carbonScore}
                </span>
              </td>
              <td>
                <span className={`status-badge ${seller.status.toLowerCase()}`}>
                  {seller.status}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button className="btn-action approve">Approve</button>
                  <button className="btn-action suspend">Suspend</button>
                  <button className="btn-action view">View Details</button>
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
          <button className="btn-primary">Export Products</button>
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

      <table className="data-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedProducts.length === products.length}
                onChange={() => handleSelectAll('products', products)}
              />
            </th>
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
          {products.map(product => (
            <tr key={product.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleSelectItem('products', product.id)}
                />
              </td>
              <td>{product.name}</td>
              <td>{product.seller}</td>
              <td>${product.price}</td>
              <td>{product.category}</td>
              <td>{product.carbonFootprint} kg CO2</td>
              <td>
                <span className={`eco-badge ${product.ecoRating.toLowerCase()}`}>
                  {product.ecoRating}
                </span>
              </td>
              <td>
                <span className={`status-badge ${product.status.toLowerCase()}`}>
                  {product.status}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button className="btn-action approve">Approve</button>
                  <button className="btn-action flag">Flag</button>
                  <button className="btn-action view">View</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUserManagement();
      case 'sellers':
        return renderSellerManagement();
      case 'products':
        return renderProductOversight();
      case 'analytics':
        return <div className="management-content"><h2>Carbon Analytics</h2><p>Analytics dashboard coming soon...</p></div>;
      case 'config':
        return <div className="management-content"><h2>System Configuration</h2><p>Configuration settings coming soon...</p></div>;
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
              onClick={() => setActiveSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
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
    </div>
  );
};

export default AdminDashboard;
