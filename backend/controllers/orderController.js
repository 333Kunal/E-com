const Order = require('../models/Order');
const Product = require('../models/Product');

// 🔹 STEP 1: VALIDATE STOCK BEFORE CHECKOUT
// Route: POST /api/orders/validate-stock
exports.validateStock = async (req, res) => {
  try {
    const { cartItems } = req.body;

    // Check each item in cart
    const stockIssues = [];

    for (const item of cartItems) {
      // Find product in database
      const product = await Product.findById(item._id);

      if (!product) {
        stockIssues.push({
          productId: item._id,
          productName: item.name,
          issue: 'Product not found'
        });
        continue;
      }

      // Check if enough stock available
      if (product.stock < item.quantity) {
        stockIssues.push({
          productId: product._id,
          productName: product.name,
          requested: item.quantity,
          available: product.stock,
          issue: product.stock === 0 ? 'Out of stock' : 'Insufficient stock'
        });
      }
    }

    // If any stock issues, return error
    if (stockIssues.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some items are out of stock or have insufficient quantity',
        stockIssues
      });
    }

    // All items available!
    res.status(200).json({
      success: true,
      message: 'All items are available',
      cartItems
    });

  } catch (error) {
    console.error('Validate Stock Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating stock',
      error: error.message
    });
  }
};

// 🔹 STEP 2: CREATE ORDER (RESERVE STOCK)
// Route: POST /api/orders/create
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    // Validate all fields are provided
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided'
      });
    }

    // Double-check stock availability (IMPORTANT!)
    const stockIssues = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        stockIssues.push({
          productName: item.name,
          issue: 'Product no longer available'
        });
        continue;
      }

      if (product.stock < item.quantity) {
        stockIssues.push({
          productName: product.name,
          requested: item.quantity,
          available: product.stock,
          issue: 'Insufficient stock'
        });
      }
    }

    if (stockIssues.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock changed during checkout',
        stockIssues
      });
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod: 'UPI',
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// 🔹 STEP 3: VERIFY PAYMENT AND UPDATE STOCK
// Route: PUT /api/orders/verify-payment/:orderId
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { transactionId, upiId } = req.body;

    // Find the order
    const order = await Order.findById(orderId).populate('orderItems.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Simulate payment verification
    // In real app, you'd verify with UPI payment gateway
    const paymentSuccess = transactionId && transactionId.length > 10;

    if (!paymentSuccess) {
      // Payment failed
      order.paymentDetails.paymentStatus = 'Failed';
      order.orderStatus = 'Cancelled';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Payment successful - Now reduce stock
    const stockUpdatePromises = order.orderItems.map(async (item) => {
      const product = await Product.findById(item.product);

      if (!product) {
        throw new Error(`Product ${item.name} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();

      return product;
    });

    // Execute all stock updates
    await Promise.all(stockUpdatePromises);

    // Update order with payment details
    order.paymentDetails = {
      upiId,
      transactionId,
      paymentStatus: 'Success',
      paidAt: Date.now()
    };
    order.orderStatus = 'Confirmed';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed',
      order
    });

  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying payment',
      error: error.message
    });
  }
};

// 🔹 GET USER ORDERS
// Route: GET /api/orders/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('orderItems.product', 'name image')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// 🔹 GET SINGLE ORDER
// Route: GET /api/orders/:orderId
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user (or user is admin)
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Get Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// 🔹 GET ALL ORDERS (ADMIN ONLY)
// Route: GET /api/orders/admin/all
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image')
      .sort('-createdAt');

    const totalAmount = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    res.status(200).json({
      success: true,
      count: orders.length,
      totalAmount,
      orders
    });

  } catch (error) {
    console.error('Get All Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};