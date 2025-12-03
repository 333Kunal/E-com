const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Who placed the order
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // What they ordered
  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      },
      image: {
        type: String,
        required: true
      }
    }
  ],

  // Delivery information
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' }
  },

  // Payment information
  paymentMethod: {
    type: String,
    required: true,
    enum: ['UPI', 'COD'],
    default: 'UPI'
  },

  paymentDetails: {
    upiId: String,
    transactionId: String,
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Success', 'Failed'],
      default: 'Pending'
    },
    paidAt: Date
  },

  // Pricing
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },

  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },

  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },

  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },

  // Order status
  orderStatus: {
    type: String,
    required: true,
    enum: ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },

  deliveredAt: Date
});

module.exports = mongoose.model('Order', orderSchema);