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

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // UPI payment state
  const [upiId, setUpiId] = useState('');
  const [transactionId, setTransactionId] = useState('');

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

      const result = await createOrder(orderData);
      console.log('✅ Order created:', result.order._id);

      setCurrentOrder(result.order);
      setShowUPIModal(true);
      setLoading(false);

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

  // Handle Payment
  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // STEP 3: Verify payment
      console.log('💳 Step 3: Verifying payment...');
      const paymentData = {
        transactionId,
        upiId
      };

      await verifyPayment(currentOrder._id, paymentData);
      console.log('✅ Payment verified!');

      // STEP 4: Clear cart and show success
      clearCart();
      navigate('/order-success', { 
        state: { orderId: currentOrder._id } 
      });

    } catch (error) {
      console.error('❌ Payment Error:', error);
      setError(error.response?.data?.message || 'Payment verification failed');
      setLoading(false);
    }
  };

  // Generate UPI payment link
  const generateUPILink = () => {
    const merchantUPI = 'xyz@okaxis';
    const amount = totalPrice.toFixed(2);
    const transactionNote = `Order ${currentOrder?._id}`;
    
    // UPI URI format
    return `upi://pay?pa=${merchantUPI}&pn=E-Commerce&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
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
          {/* Shipping Form */}
          <div className="shipping-section">
            <h2>📍 Shipping Address</h2>
            <form onSubmit={handlePlaceOrder} className="shipping-form">
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

              <button 
                type="submit" 
                className="place-order-btn"
                disabled={loading}
              >
                {loading ? 'Processing...' : '💳 Proceed to Payment'}
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

            <div className="payment-info">
              <h3>💳 Payment Method</h3>
              <div className="payment-method-selected">
                <span className="upi-icon">📱</span>
                <div>
                  <strong>UPI Payment</strong>
                  <p>Pay using any UPI app</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UPI Payment Modal */}
      {showUPIModal && (
        <div className="modal-overlay">
          <div className="modal-content upi-modal">
            <div className="modal-header">
              <h2>💳 UPI Payment</h2>
            </div>

            <div className="upi-payment-content">
              <div className="upi-qr-section">
                <h3>Scan QR Code</h3>
                <div className="qr-code-placeholder">
                  {/* In production, use a library like qrcode.react */}
                  <div className="qr-mock">
                    <p>📱</p>
                    <p>Scan with any UPI app</p>
                  </div>
                </div>
                <p className="upi-id">UPI ID: 8347631720@superyes</p>
                <p className="amount">Amount: ₹{totalPrice.toFixed(2)}</p>
              </div>

              <div className="upi-or">OR</div>

              <div className="upi-link-section">
                <h3>Pay with UPI App</h3>
                <a 
                  href={generateUPILink()} 
                  className="upi-pay-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📱 Open UPI App
                </a>
              </div>

              <div className="payment-verification-form">
                <h3>After Payment</h3>
                <p>Enter your UPI transaction details:</p>

                <form onSubmit={handlePayment}>
                  <div className="form-group">
                    <label>UPI ID (Your ID) *</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      required
                      placeholder="yourname@paytm"
                    />
                  </div>

                  <div className="form-group">
                    <label>Transaction ID / UTR Number *</label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      required
                      placeholder="Enter 12-digit transaction ID"
                      minLength={12}
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      onClick={() => setShowUPIModal(false)}
                      className="btn-secondary"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Verifying...' : 'Verify Payment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;