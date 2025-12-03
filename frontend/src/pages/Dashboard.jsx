import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { getAllProducts } from '../utils/productApi';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { addToCart, getCartCount } = useCart();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
    // 🆕 Hamburger menu state
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };
  const handleProductClick = () => {
    navigate('/product');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  // Check if user is admin
  const isAdmin = user && user.role === 'admin';

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data.products);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    addToCart(product);
    setSuccessMessage(`${product.name} added to cart!`);
    
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
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
    <div className="dashboard-container">
      <div className="dashboard-background">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>

      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="logo">
            <span className="logo-icon">🛍️</span>
            <span className="logo-text">E-Commerce</span>
          </div>
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
                  onClick={handleAdminClick}
                  className="dropdown-item"
                >
                  👑 Admin Panel
                </button>
                <button 
                  onClick={handleProductClick}
                  className="dropdown-item"
                >
                  📦 Products
                </button>
                 <button 
                  onClick={handleCartClick}
                  className="dropdown-item"
                >
                  🛒 Cart <span className="cart-badge">{getCartCount()}</span>
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
          {/* <div className="header-actions">
            <button onClick={handleCartClick} className="cart-button">
              <span>🛒</span>
              <span className="cart-text">Cart</span>
              {getCartCount() > 0 && (
                <span className="cart-badge">{getCartCount()}</span>
              )}
            </button>

            {isAdmin && (
              <button onClick={handleAdminClick} className="admin-button">
                <span>👑</span> Admin Panel
              </button>
            )}

            <button onClick={handleLogout} className="logout-button">
              <span>🚪</span> Logout
            </button>
          </div> */}
        </header>

        {successMessage && (
          <div className="success-notification">
            ✅ {successMessage}
          </div>
        )}

        <div className="welcome-banner">
          <div className="welcome-content">
            <h1>Welcome back, {user?.name}! 👋</h1>
            <p>Discover amazing products at unbeatable prices</p>
          </div>
          <div className="user-info-badge">
            <span className="user-role-badge">
              {isAdmin ? '👑 Admin' : '👤 User'}
            </span>
          </div>
        </div>

        <div className="products-section">
          <div className="section-header">
            <h2>Featured Products</h2>
            <p>Browse our collection of premium products</p>
          </div>

          {products.length === 0 ? (
            <div className="empty-products">
              <h3>No products available yet</h3>
              <p>Check back later or contact admin to add products!</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product._id} className="product-card">
                  <div className="product-image-container">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="product-image"
                    />
                    <span className="product-category">{product.category}</span>
                    {product.stock === 0 && (
                      <span className="out-of-stock-badge">Out of Stock</span>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    
                    <div className="product-footer">
                      <span className="product-price">₹{product.price.toFixed(2)}</span>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="add-to-cart-btn"
                        disabled={product.stock === 0}
                      >
                        <span>🛒</span> 
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
