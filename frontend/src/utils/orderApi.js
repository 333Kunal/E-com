import api from './api';

// Validate stock before checkout
export const validateStock = async (cartItems) => {
  const response = await api.post('/orders/validate-stock', { cartItems });
  return response.data;
};

// Create order
export const createOrder = async (orderData) => {
  const response = await api.post('/orders/create', orderData);
  return response.data;
};

// Verify payment
export const verifyPayment = async (orderId, paymentData) => {
  const response = await api.put(`/orders/verify-payment/${orderId}`, paymentData);
  return response.data;
};

// Get my orders
export const getMyOrders = async () => {
  const response = await api.get('/orders/my-orders');
  return response.data;
};

// Get single order
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};


// utils/orderApi.js

export const initiateUPIPayment = async (paymentData) => {
  try {
    const response = await fetch('/api/orders/initiate-upi-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(paymentData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to initiate UPI payment');
    }

    return data;
  } catch (error) {
    console.error('UPI Payment Initiation Error:', error);
    throw error;
  }
};