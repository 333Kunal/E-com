import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { validateStock, createOrder, verifyPayment } from '../utils/orderApi';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Form state
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'India'
  });

  const [upiId, setUpiId] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate prices
  const itemsPrice = getCartTotal();
  const shippingPrice = itemsPrice > 0 ? 0 : 50;
  const taxPrice = itemsPrice * 0.18; // 18% GST
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  // Handle input change
  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  // Handle Place Order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // STEP 1: Validate stock
      console.log('🔍 Step 1: Validating stock...');
      await validateStock(cartItems);
      console.log('✅ Stock validated!');

      // STEP 2: Create order
      console.log('📝 Step 2: Creating order...');
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        })),
        shippingAddress,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
      };

      const orderResult = await createOrder(orderData);
      console.log('✅ Order created:', orderResult.order._id);

      // STEP 3: Simulate UPI payment and verify
      console.log('💳 Step 3: Processing UPI payment...');
      
      // Generate a mock transaction ID (in real app, this comes from UPI gateway)
      const transactionId = `UPI${Date.now()}${Math.floor(Math.random() * 10000)}`;

      const paymentData = {
        transactionId,
        upiId
      };

      await verifyPayment(orderResult.order._id, paymentData);
      console.log('✅ Payment verified!');

      // STEP 4: Clear cart and navigate to orders
      clearCart();
      setLoading(false);
      
      // Show success message
      alert('✅ Order placed successfully!');
      
      // Navigate to orders page
      navigate('/orders');

    } catch (error) {
      console.error('❌ Checkout Error:', error);
      setError(error.response?.data?.message || 'Checkout failed');
      setLoading(false);

      // Handle stock issues
      if (error.response?.data?.stockIssues) {
        const issues = error.response.data.stockIssues;
        const issueMessages = issues.map(issue => 
          `${issue.productName}: ${issue.issue}`
        ).join('\n');
        setError(`Stock issues:\n${issueMessages}`);
      }
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-checkout">
          <h2>Your cart is empty!</h2>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-background">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>

      <div className="checkout-content">
        <header className="checkout-header">
          <h1>🛒 Checkout</h1>
          <button onClick={() => navigate('/cart')} className="back-btn">
            ← Back to Cart
          </button>
        </header>

        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}

        <div className="checkout-layout">
          {/* Checkout Form */}
          <div className="shipping-section">
            <h2>📦 Complete Your Order</h2>
            <form onSubmit={handlePlaceOrder} className="shipping-form">
              {/* Shipping Address Section */}
              <div className="form-section">
                <h3>📍 Shipping Address</h3>
                
                <div className="form-group">
                  <label>Full Address *</label>
                  <textarea
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    required
                    placeholder="123 Main Street, Apartment 4B"
                    rows="3"
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      required
                      placeholder="Mumbai"
                    />
                  </div>

                  <div className="form-group">
                    <label>Postal Code *</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleInputChange}
                      required
                      placeholder="400001"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={shippingAddress.country}
                    readOnly
                  />
                </div>
              </div>

              {/* Payment Section */}
              <div className="form-section">
                <h3>💳 Payment Details</h3>
                
                <div className="payment-method-info">
                  <div className="upi-info-box">
                    <span className="upi-icon">📱</span>
                    <div>
                      <strong>Pay to UPI ID:</strong>
                      <p className="merchant-upi">8347631720@superyes</p>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Your UPI ID *</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                    placeholder="yourname@paytm"
                  />
                  <small className="form-hint">
                    Enter your UPI ID (e.g., yourname@paytm, yourname@phonepe)
                  </small>
                </div>

                <div className="payment-instructions">
                  <h4>💡 Payment Instructions:</h4>
                  <ol>
                    <li>Open any UPI app (PhonePe, Paytm, Google Pay)</li>
                    <li>Send ₹{totalPrice.toFixed(2)} to <strong>xyz@okaxis</strong></li>
                    <li>Enter your UPI ID above</li>
                    <li>Click "Place Order" below</li>
                  </ol>
                </div>
              </div>

              <button 
                type="submit" 
                className="place-order-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing Payment...
                  </>
                ) : (
                  '🛍️ Place Order'
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <h2>📋 Order Summary</h2>
            
            <div className="order-items-list">
              {cartItems.map((item) => (
                <div key={item._id} className="order-item">
                  <img src={item.image} alt={item.name} />
                  <div className="order-item-details">
                    <h4>{item.name}</h4>
                    <p>{item.quantity} × ₹{item.price}</p>
                  </div>
                  <span className="order-item-total">
                    ₹{(item.quantity * item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="order-summary-calculations">
              <div className="summary-row">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>₹{itemsPrice.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span className={shippingPrice === 0 ? 'free' : ''}>
                  {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice.toFixed(2)}`}
                </span>
              </div>

              <div className="summary-row">
                <span>GST (18%)</span>
                <span>₹{taxPrice.toFixed(2)}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row summary-total">
                <span>Total Amount</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;