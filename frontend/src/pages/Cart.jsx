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
    getCartCount 
  } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleContinueShopping = () => {
    navigate('/dashboard');
  };

  const handleCheckout = () => {
    // In a real app, this would navigate to checkout page
    //alert('Proceeding to checkout... (This would be your checkout page)');
     navigate('/checkout');
  };

  const isAdmin = user && user.role === 'admin';

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
          <div className="header-actions">
            <button onClick={handleContinueShopping} className="continue-shopping-btn">
              <span>🏠</span> Continue Shopping
            </button>

            {isAdmin && (
              <button onClick={() => navigate('/admin')} className="admin-button">
                <span>👑</span> Admin
              </button>
            )}

            <button onClick={handleLogout} className="logout-button">
              <span>🚪</span> Logout
            </button>
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
                  {cartItems.map((item) => (
                    <div key={item._id} className="cart-item">
                      <div className="cart-item-image">
                        <img src={item.image} alt={item.name} />
                      </div>

                      <div className="cart-item-details">
                        <h3>{item.name}</h3>
                        <p className="cart-item-category">{item.category}</p>
                        <p className="cart-item-price">₹{item.price.toFixed(2)}</p>
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
                        >
                          +
                        </button>
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
                  ))}
                </div>
              </div>

              {/* Cart Summary */}
              <div className="cart-summary">
                <h2>Order Summary</h2>
                
                <div className="summary-row">
                  <span>Subtotal</span>
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;