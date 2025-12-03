import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const { user, logout } = useAuth();
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getCartCount,
    isMaxQuantity,
    getStockLeft
  } = useCart();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowMenu(false);
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
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

  const handleContinueShopping = () => {
    navigate('/dashboard');
    setShowMenu(false);
  };

  const handleCheckout = () => {
    navigate('/checkout');
    setShowMenu(false);
  };

  const isAdmin = user && user.role === 'admin';

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

  return (
    <div className="cart-container">
      {/* Animated Background */}
      <div className="cart-background">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>

      {/* Cart Content */}
      <div className="cart-content">
        {/* Header */}
        <header className="cart-header">
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
                  onClick={handleDashboardClick}
                  className="dropdown-item"
                >
                  🏠 Dashboard
                </button>
                
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
                  onClick={handleLogout}
                  className="dropdown-item"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Cart Main Content */}
        <div className="cart-main">
          <div className="cart-title-section">
            <h1>🛒 Shopping Cart</h1>
            <p>{getCartCount()} {getCartCount() === 1 ? 'item' : 'items'} in your cart</p>
          </div>

          {cartItems.length === 0 ? (
            // Empty Cart
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Add some products to get started!</p>
              <button onClick={handleContinueShopping} className="btn-primary">
                Browse Products
              </button>
            </div>
          ) : (
            // Cart with Items
            <div className="cart-layout">
              {/* Cart Items */}
              <div className="cart-items-section">
                <div className="cart-items-header">
                  <button onClick={clearCart} className="clear-cart-btn">
                    🗑️ Clear Cart
                  </button>
                </div>

                <div className="cart-items-list">
                  {cartItems.map((item) => {
                    const maxStock = item.maxStock || item.stock || 0;
                    const stockLeft = getStockLeft(item._id);
                    const isMaxInCart = isMaxQuantity(item._id);
                    
                    return (
                      <div key={item._id} className="cart-item">
                        <div className="cart-item-image">
                          <img src={item.image} alt={item.name} />
                        </div>

                        <div className="cart-item-details">
                          <h3>{item.name}</h3>
                          <p className="cart-item-category">{item.category}</p>
                          <p className="cart-item-price">₹{item.price.toFixed(2)}</p>
                          
                          <div className="cart-item-stock">
                            <span className={`stock-status ${stockLeft === 0 ? 'out-of-stock' : 'in-stock'}`}>
                              {stockLeft === 0 ? 'Out of Stock' : `${stockLeft} available`}
                            </span>
                            {isMaxInCart && (
                              <span className="max-quantity-warning">
                                ⚠️ Maximum quantity in cart
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="cart-item-quantity">
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="quantity-btn"
                          >
                            −
                          </button>
                          <span className="quantity-display">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="quantity-btn"
                            disabled={isMaxInCart}
                            title={isMaxInCart ? "Maximum quantity reached" : "Increase quantity"}
                          >
                            +
                          </button>
                          
                          <div className="quantity-info">
                            Max: {maxStock}
                          </div>
                        </div>

                        <div className="cart-item-total">
                          <span className="item-total-label">Total:</span>
                          <span className="item-total-price">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>

                        <button 
                          onClick={() => removeFromCart(item._id)}
                          className="remove-item-btn"
                          title="Remove item"
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cart Summary */}
              <div className="cart-summary">
                <h2>Order Summary</h2>
                
                <div className="summary-row">
                  <span>Subtotal ({getCartCount()} items)</span>
                  <span>₹{getCartTotal().toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="free-shipping">FREE</span>
                </div>

                <div className="summary-row">
                  <span>Tax (18%)</span>
                  <span>₹{(getCartTotal() * 0.18).toFixed(2)}</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row summary-total">
                  <span>Total</span>
                  <span>₹{(getCartTotal() * 1.18).toFixed(2)}</span>
                </div>

                <button onClick={handleCheckout} className="checkout-btn">
                  Proceed to Checkout
                </button>

                <div className="payment-methods">
                  <p>We accept:</p>
                  <div className="payment-icons">
                    <span>💳</span>
                    <span>🏦</span>
                    <span>📱</span>
                  </div>
                </div>
                
                <div className="cart-actions">
                  <button onClick={handleContinueShopping} className="continue-shopping-btn">
                    ← Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;