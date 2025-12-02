const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// Public routes (anyone can view products)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes (admin only)
router.post('/create', protect, adminOnly, createProduct);
router.put('/update/:id', protect, adminOnly, updateProduct);
router.delete('/delete/:id', protect, adminOnly, deleteProduct);

module.exports = router;