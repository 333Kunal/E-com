import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../utils/orderApi';
import './Orders.css';

const Orders = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data.orders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    const colors = {
      'Processing': 'status-processing',
      'Confirmed': 'status-confirmed',
      'Shipped': 'status-shipped',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-cancelled'
    };
    return colors[status] || 'status-processing';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'Pending': 'payment-pending',
      'Success': 'payment-success',
      'Failed': 'payment-failed'
    };
    return colors[status] || 'payment-pending';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-background">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>

      <div className="orders-content">
        {/* Header */}
        <header className="orders-header">
          <div className="header-left">
            <h1>📦 My Orders</h1>
            <p>Track and manage your orders</p>
          </div>
          <div className="header-actions">
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">
              🏠 Home
            </button>
            {isAdmin && (
              <button onClick={() => navigate('/admin')} className="admin-button">
                👑 Admin
              </button>
            )}
            <button onClick={handleLogout} className="btn-secondary">
              🚪 Logout
            </button>
          </div>
        </header>

        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h2>No Orders Yet</h2>
            <p>Start shopping and your orders will appear here!</p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header-section">
                  <div className="order-id-section">
                    <span className="order-label">Order ID</span>
                    <span className="order-id">{order._id}</span>
                  </div>
                  <div className="order-date">
                    <span className="order-label">Order Date</span>
                    <span>{new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                </div>

                <div className="order-status-section">
                  <div className="status-badge-container">
                    <span className="status-label">Order Status</span>
                    <span className={`status-badge ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="status-badge-container">
                    <span className="status-label">Payment Status</span>
                    <span className={`payment-badge ${getPaymentStatusColor(order.paymentDetails.paymentStatus)}`}>
                      {order.paymentDetails.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="order-items-section">
                  <h3>Items ({order.orderItems.length})</h3>
                  <div className="order-items-grid">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="order-item-card">
                        <img src={item.image} alt={item.name} />
                        <div className="order-item-info">
                          <h4>{item.name}</h4>
                          <p>Qty: {item.quantity}</p>
                          <span className="item-price">₹{item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-details-section">
                  <div className="shipping-address">
                    <h4>📍 Shipping Address</h4>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>

                  <div className="payment-info">
                    <h4>💳 Payment Details</h4>
                    <p><strong>Method:</strong> {order.paymentMethod}</p>
                    <p><strong>UPI ID:</strong> {order.paymentDetails.upiId || 'N/A'}</p>
                    {order.paymentDetails.transactionId && (
                      <p><strong>Transaction ID:</strong> {order.paymentDetails.transactionId}</p>
                    )}
                  </div>
                </div>

                <div className="order-footer-section">
                  <div className="order-total">
                    <span>Total Amount</span>
                    <span className="total-price">₹{order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;