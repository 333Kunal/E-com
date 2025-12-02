const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// All routes need authentication AND user privileges
// protect = checks if user is logged in
// adminOnly = checks if user is user

router.get('/users/all', protect, adminOnly, getAllUsers);
router.post('/users/create', protect, adminOnly, createUser);
router.put('/users/update/:id', protect, adminOnly, updateUser);
router.delete('/users/delete/:id', protect, adminOnly, deleteUser);
router.get('/users/:id', protect, adminOnly, getUserById);

module.exports = router;