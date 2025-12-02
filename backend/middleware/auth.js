const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔹 Protect routes - Check if user is authenticated
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 🔹 Step 1: Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Token format: "Bearer TOKEN_HERE"
      // Split and get the actual token
      token = req.headers.authorization.split(' ')[1];
    }

    // 🔹 Step 2: Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // 🔹 Step 3: Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔹 Step 4: Find user by ID from token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // 🔹 Step 5: User is authenticated, proceed to next middleware/controller
    next();

  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};