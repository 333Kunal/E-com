import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { getAllProducts } from '../utils/productApi';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { 
    addToCart, 
    getCartCount, 
    isMaxQuantity,
    getItemQuantity,
    isInCart 
  } = useCart();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowMenu(false);
  };

  const handleAdminClick = () => {
    navigate('/admin');
    setShowMenu(false);
  };

  const handleProductClick = () => {
    navigate('/product');
    setShowMenu(false);
  };

  const handleCartClick = () => {
    navigate('/cart');
    setShowMenu(false);
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

  // Handle add to cart with stock validation
  const handleAddToCart = (product) => {
    // Check if product is in stock
    if (product.stock === 0) {
      setSuccessMessage(`❌ ${product.name} is out of stock!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }
    
    // Check if already at max quantity in cart
    if (isMaxQuantity(product._id)) {
      setSuccessMessage(`⚠️ Maximum quantity of ${product.name} already in cart!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }
    
    addToCart(product);
    setSuccessMessage(`✅ ${product.name} added to cart!`);
    
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
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
                {isAdmin && (
                  <button 
                    onClick={handleAdminClick}
                    className="dropdown-item"
                  >
                    👑 Admin Panel
                  </button>
                )}
                
                {isAdmin && (
                  <button 
                    onClick={handleProductClick}
                    className="dropdown-item"
                  >
                    📦 Products
                  </button>
                )}
                 
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
        </header>

        {successMessage && (
          <div className={`success-notification ${successMessage.includes('❌') ? 'error' : successMessage.includes('⚠️') ? 'warning' : 'success'}`}>
            {successMessage}
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
              {products.map((product) => {
                const cartQuantity = getItemQuantity(product._id);
                const stockLeft = product.stock - cartQuantity;
                const isMaxInCart = cartQuantity >= product.stock;
                const inCart = isInCart(product._id);
                
                return (
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
                      
                      <div className="product-stock-info">
                        <span className={`stock-badge ${product.stock === 0 ? 'out-of-stock' : 'in-stock'}`}>
                          {product.stock === 0 ? 'Out of Stock' : `${stockLeft} available`}
                        </span>
                        {inCart && (
                          <span className="cart-quantity-badge">
                            {cartQuantity} in cart
                          </span>
                        )}
                      </div>
                      
                      <div className="product-footer">
                        <span className="product-price">₹{product.price.toFixed(2)}</span>
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className={`add-to-cart-btn ${product.stock === 0 || isMaxInCart ? 'disabled' : ''}`}
                          disabled={product.stock === 0 || isMaxInCart}
                          title={product.stock === 0 ? 'Out of Stock' : isMaxInCart ? 'Maximum quantity in cart' : 'Add to Cart'}
                        >
                          <span>🛒</span> 
                          {product.stock === 0 ? 'Out of Stock' : isMaxInCart ? 'Max in Cart' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;