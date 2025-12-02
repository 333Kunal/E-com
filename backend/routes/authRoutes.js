const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public Routes (anyone can access)
router.post('/register', register);
router.post('/login', login);

// Protected Routes (must be logged in)
// The protect middleware runs BEFORE getMe
// Flow: User Request → protect (check token) → getMe (send user info)
router.get('/me', protect, getMe);

module.exports = router;