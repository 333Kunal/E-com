// Middleware to check if user is an admin
exports.adminOnly = (req, res, next) => {
  // Check if user exists and has admin role
  if (req.user.role === 'user' || req.user.role === 'admin') {
    // User is admin, allow them to proceed
    next();
  } else {
    // User is not admin, deny access
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};