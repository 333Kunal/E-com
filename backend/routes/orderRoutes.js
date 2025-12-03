const express = require('express');
const router = express.Router();
const {
  validateStock,
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// User routes (must be logged in)
router.post('/validate-stock', protect, validateStock);
router.post('/create', protect, createOrder);
router.put('/verify-payment/:orderId', protect, verifyPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/:orderId', protect, getOrderById);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllOrders);

module.exports = router;