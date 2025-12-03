import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, createUser, updateUser, deleteUser } from '../utils/adminApi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 🆕 Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  
  // 🆕 Hamburger menu state
  const [showMenu, setShowMenu] = useState(false);

  // 🆕 Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // 🆕 Sorting states
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'descending' // 'ascending' or 'descending'
  });

  // Form state for adding/editing users
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
    address: ''
  });

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users function
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data.users);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  // 🆕 Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // 🆕 Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    
    const lowercasedSearch = searchTerm.toLowerCase();
    return users.filter(user => 
      user.username.toLowerCase().includes(lowercasedSearch) ||
      user.name.toLowerCase().includes(lowercasedSearch) ||
      user.email.toLowerCase().includes(lowercasedSearch) ||
      user.role.toLowerCase().includes(lowercasedSearch) ||
      (user.phone && user.phone.toLowerCase().includes(lowercasedSearch))
    );
  }, [users, searchTerm]);

  // 🆕 Handle sorting
  const sortedUsers = useMemo(() => {
    const sortableUsers = [...filteredUsers];
    
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        // Handle different data types for sorting
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle special cases
        if (sortConfig.key === 'createdAt') {
          // Parse dates properly
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        
        // Handle null/undefined values - place them at the end
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        
        // Check if both are numbers (including dates which are converted to timestamps)
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' 
            ? aValue - bValue
            : bValue - aValue;
        }
        
        // Convert to string for comparison if not already strings
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        // String comparison
        if (aStr < bStr) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aStr > bStr) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableUsers;
  }, [filteredUsers, sortConfig]);

  // 🆕 Handle sort request
  const handleSort = (key) => {
    let direction = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending'; // Instead of resetting, just toggle back to ascending
      // Or if you want to reset to default:
      // setSortConfig({ key: 'createdAt', direction: 'descending' });
      // return;
    }
    
    setSortConfig({ key, direction });
  };

  // 🆕 Pagination calculations
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = sortedUsers.slice(startIndex, endIndex);

  // 🆕 Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    // Scroll to top of table
    document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  // 🆕 Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  // Handle input change
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle add user
  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await createUser(formData);
      setSuccess('User created successfully!');
      setShowAddModal(false);
      setFormData({
        username: '',
        name: '',
        email: '',
        password: '',
        role: 'user',
        phone: '',
        address: ''
      });
      setShowPassword(false);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create user');
    }
  };

  // Handle edit user
  const handleEditUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await updateUser(selectedUser._id, formData);
      setSuccess('User updated successfully!');
      setShowEditModal(false);
      setShowEditPassword(false);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update user');
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    setError('');
    setSuccess('');

    try {
      await deleteUser(selectedUser._id);
      setSuccess('User deleted successfully!');
      setShowDeleteModal(false);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // Open edit modal with user data
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      email: user.email,
      password: '', // Don't fill password
      role: user.role,
      phone: user.phone || '',
      address: user.address || ''
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowMenu(false);
  };

  // Handle navigate to dashboard
  const handleGoToDashboard = () => {
    navigate('/dashboard');
    setShowMenu(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.hamburger-menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  // 🆕 Get sort indicator class
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'ascending' ? 'active-asc' : 'active-desc';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="user-container">
      {/* Header */}
      <header className="user-header">
        <div className="header-left">
          <h1>👑 Admin Dashboard</h1>
        </div>
        <div className="header-right">
          <span className="user-name">Welcome, {user?.name}</span>
          
          {/* Hamburger Menu */}
          <div className="hamburger-menu-container">
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="hamburger-btn"
            >
              ☰
            </button>
            
            {showMenu && (
              <div className="hamburger-dropdown">
                <button 
                  onClick={handleGoToDashboard}
                  className="dropdown-item"
                >
                  📊 Dashboard
                </button>
                <button 
                  onClick={handleLogout}
                  className="dropdown-item"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Success/Error Messages */}
      {success && (
        <div className="alert alert-success">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          ⚠️ {error}
        </div>
      )}

      {/* Main Content */}
      <div className="user-content">
        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{users.length}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👑</div>
            <div className="stat-info">
              <h3>{users.filter(u => u.role === 'admin').length}</h3>
              <p>Admins</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👤</div>
            <div className="stat-info">
              <h3>{users.filter(u => u.role === 'user').length}</h3>
              <p>Regular Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔍</div>
            <div className="stat-info">
              <h3>{filteredUsers.length}</h3>
              <p>Filtered Users</p>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="controls-bar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search users by name, email, username, role, or phone..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="controls-right">
            <div className="items-per-page">
              <label htmlFor="itemsPerPage">Show: </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="items-select"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            
            <button 
              onClick={() => setShowAddModal(true)} 
              className="btn-primary"
            >
              ➕ Add New User
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th 
                  onClick={() => handleSort('username')}
                  className={`sortable-header ${getSortIndicator('username')}`}
                >
                  Username
                </th>
                <th 
                  onClick={() => handleSort('name')}
                  className={`sortable-header ${getSortIndicator('name')}`}
                >
                  Name
                </th>
                <th 
                  onClick={() => handleSort('email')}
                  className={`sortable-header ${getSortIndicator('email')}`}
                >
                  Email
                </th>
                <th 
                  onClick={() => handleSort('role')}
                  className={`sortable-header ${getSortIndicator('role')}`}
                >
                  Role
                </th>
                <th 
                  onClick={() => handleSort('phone')}
                  className={`sortable-header ${getSortIndicator('phone')}`}
                >
                  Phone
                </th>
                <th 
                  onClick={() => handleSort('createdAt')}
                  className={`sortable-header ${getSortIndicator('createdAt')}`}
                >
                  Created At
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <span className="username-badge">@{user.username}</span>
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'admin' ? '👑' : '👤'} {user.role}
                    </span>
                  </td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="btn-edit"
                        title="Edit User"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => openDeleteModal(user)}
                        className="btn-delete"
                        title="Delete User"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan="7" className="no-data">
                    {searchTerm ? 'No users match your search.' : 'No users found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {sortedUsers.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {startIndex + 1} to {Math.min(endIndex, sortedUsers.length)} of {sortedUsers.length} users
              </div>
              
              <div className="pagination-controls">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="pagination-btn first-page"
                >
                  ««
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ← Previous
                </button>
                
                <div className="page-numbers">
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = startPage + maxVisiblePages - 1;
                    
                    if (endPage > totalPages) {
                      endPage = totalPages;
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
                        >
                          {i}
                        </button>
                      );
                    }
                    return pages;
                  })()}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next →
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn last-page"
                >
                  »»
                </button>
              </div>
              
              <div className="page-jump">
                <span>Go to page: </span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = Math.min(Math.max(1, parseInt(e.target.value) || 1), totalPages);
                    handlePageChange(page);
                  }}
                  className="page-input"
                />
                <span> of {totalPages}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Add New User</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="btn-close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddUser} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="john_doe"
                  />
                </div>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Min 6 characters"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main Street, City"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit User</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="btn-close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditUser} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showEditPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                    >
                      {showEditPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                ></textarea>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗑️ Delete User</h2>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="btn-close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p className="delete-warning">
                Are you sure you want to delete user <strong>{selectedUser?.name}</strong>?
              </p>
              <p className="delete-info">
                This action cannot be undone.
              </p>
            </div>
            <div className="form-actions">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteUser}
                className="btn-danger"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;