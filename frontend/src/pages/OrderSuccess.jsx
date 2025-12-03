import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getOrderById } from '../utils/orderApi';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = location.state?.orderId;

  useEffect(() => {
    // 🔧 FIX: Define fetchOrder inside useEffect
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data.order);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order:', error);
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    } else {
      navigate('/dashboard');
    }
  }, [orderId, navigate]); // ✅ Now only depends on orderId and navigate

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <div className="success-background">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>

      <div className="success-content">
        <div className="success-card">
          <div className="success-icon">
            <div className="checkmark">✓</div>
          </div>

          <h1>Order Placed Successfully!</h1>
          <p className="success-message">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          <div className="order-id-section">
            <p>Order ID</p>
            <h2>{order?._id}</h2>
          </div>

          <div className="order-details-card">
            <h3>Order Summary</h3>
            
            <div className="order-items">
              {order?.orderItems.map((item, index) => (
                <div key={index} className="success-order-item">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-total">
              <span>Total Paid</span>
              <span className="total-amount">₹{order?.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="shipping-info">
            <h3>📍 Delivery Address</h3>
            <p>{order?.shippingAddress.address}</p>
            <p>{order?.shippingAddress.city}, {order?.shippingAddress.postalCode}</p>
            <p>{order?.shippingAddress.country}</p>
          </div>

          <div className="action-buttons">
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              Continue Shopping
            </button>
            <button 
              onClick={() => navigate('/orders')}
              className="btn-secondary"
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;