import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../utils/productApi';
import './Product.css';

const Product = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Products state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 🆕 Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // 🆕 Sorting states
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'descending'
  });

  // 🆕 Hamburger menu state
  const [showMenu, setShowMenu] = useState(false);

  // Product form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    image: '',
    stock: ''
  });

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch products function
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data.products);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
      setLoading(false);
    }
  };

  // 🆕 Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // 🆕 Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    
    const lowercasedSearch = searchTerm.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowercasedSearch) ||
      product.description.toLowerCase().includes(lowercasedSearch) ||
      product.category.toLowerCase().includes(lowercasedSearch) ||
      product.price.toString().includes(lowercasedSearch) ||
      product.stock.toString().includes(lowercasedSearch)
    );
  }, [products, searchTerm]);

  // 🆕 Handle sorting
  const sortedProducts = useMemo(() => {
    const sortableProducts = [...filteredProducts];
    
    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'createdAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        
        if (sortConfig.key === 'price' || sortConfig.key === 'stock') {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }
        
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' 
            ? aValue - bValue
            : bValue - aValue;
        }
        
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (aStr < bStr) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aStr > bStr) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableProducts;
  }, [filteredProducts, sortConfig]);

  // 🆕 Handle sort request
  const handleSort = (key) => {
    let direction = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    
    setSortConfig({ key, direction });
  };

  // 🆕 Pagination calculations
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  // 🆕 Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  // 🆕 Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Handle input change
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle add product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await createProduct({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      });
      setSuccess('Product created successfully!');
      setShowAddModal(false);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        image: '',
        stock: ''
      });
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create product');
    }
  };

  // Handle edit product
  const handleEditProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await updateProduct(selectedProduct._id, {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      });
      setSuccess('Product updated successfully!');
      setShowEditModal(false);
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update product');
    }
  };

  // Handle delete product
  const handleDeleteProduct = async () => {
    setError('');
    setSuccess('');

    try {
      await deleteProduct(selectedProduct._id);
      setSuccess('Product deleted successfully!');
      setShowDeleteModal(false);
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete product');
    }
  };

  // Open edit modal with product data
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      stock: product.stock.toString()
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (product) => {
    setSelectedProduct(product);
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
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="product-container">
      {/* Header */}
      <header className="product-header">
        <div className="header-left">
          <h1>📦 Product Management</h1>
          <p>Manage all products</p>
        </div>
        <div className="header-right">
          <span className="admin-name">Welcome, {user?.name}</span>
          
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
      <div className="product-content">
        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{products.length}</h3>
              <p>Total Products</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{products.filter(p => p.stock > 0).length}</h3>
              <p>In Stock</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-info">
              <h3>{products.filter(p => p.stock === 0).length}</h3>
              <p>Out of Stock</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔍</div>
            <div className="stat-info">
              <h3>{filteredProducts.length}</h3>
              <p>Filtered Products</p>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="controls-bar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search products by name, description, category, price, or stock..."
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
              ➕ Add New Product
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th 
                  onClick={() => handleSort('name')}
                  className={`sortable-header ${getSortIndicator('name')}`}
                >
                  Name
                </th>
                <th 
                  onClick={() => handleSort('category')}
                  className={`sortable-header ${getSortIndicator('category')}`}
                >
                  Category
                </th>
                <th 
                  onClick={() => handleSort('price')}
                  className={`sortable-header ${getSortIndicator('price')}`}
                >
                  Price
                </th>
                <th 
                  onClick={() => handleSort('stock')}
                  className={`sortable-header ${getSortIndicator('stock')}`}
                >
                  Stock
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
              {currentProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="product-thumbnail"
                    />
                  </td>
                  <td>
                    <div className="product-name-cell">
                      <strong>{product.name}</strong>
                      <p className="product-description-truncate">{product.description}</p>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{product.category}</span>
                  </td>
                  <td className="product-price-cell">₹{parseFloat(product.price).toFixed(2)}</td>
                  <td>
                    <span className={`stock-badge ${product.stock === 0 ? 'out-of-stock' : 'in-stock'}`}>
                      {product.stock === 0 ? 'Out of Stock' : `${product.stock} units`}
                    </span>
                  </td>
                  <td>
                    {new Date(product.createdAt).toLocaleDateString('en-US', {
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
                        onClick={() => openEditModal(product)}
                        className="btn-edit"
                        title="Edit Product"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => openDeleteModal(product)}
                        className="btn-delete"
                        title="Delete Product"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="no-data">
                    {searchTerm ? 'No products match your search.' : 'No products found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {sortedProducts.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {startIndex + 1} to {Math.min(endIndex, sortedProducts.length)} of {sortedProducts.length} products
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Add New Product</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="btn-close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Wireless Headphones"
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Electronics">📱 Electronics</option>
                    <option value="Clothing">👕 Clothing</option>
                    <option value="Footwear">👟 Footwear</option>
                    <option value="Accessories">👜 Accessories</option>
                    <option value="Fitness">💪 Fitness</option>
                    <option value="Books">📚 Books</option>
                    <option value="Sports">⚽ Sports</option>
                    <option value="Other">📦 Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Premium wireless headphones with noise cancellation, 30-hour battery life..."
                  rows="4"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="79.99"
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL *</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                />
                {formData.image && (
                  <div className="image-preview">
                    <img src={formData.image} alt="Preview" />
                    <p className="image-preview-text">Image Preview</p>
                  </div>
                )}
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
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Product</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="btn-close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditProduct} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Electronics">📱 Electronics</option>
                    <option value="Clothing">👕 Clothing</option>
                    <option value="Footwear">👟 Footwear</option>
                    <option value="Accessories">👜 Accessories</option>
                    <option value="Home">🏠 Home</option>
                    <option value="Fitness">💪 Fitness</option>
                    <option value="Books">📚 Books</option>
                    <option value="Beauty">💄 Beauty</option>
                    <option value="Sports">⚽ Sports</option>
                    <option value="Other">📦 Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL *</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                />
                {formData.image && (
                  <div className="image-preview">
                    <img src={formData.image} alt="Preview" />
                    <p className="image-preview-text">Image Preview</p>
                  </div>
                )}
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
                  Update Product
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
              <h2>🗑️ Delete Product</h2>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="btn-close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p className="delete-warning">
                Are you sure you want to delete product <strong>{selectedProduct?.name}</strong>?
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
                onClick={handleDeleteProduct}
                className="btn-danger"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;