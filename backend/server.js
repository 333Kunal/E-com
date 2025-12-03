const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes'); // 🆕 MAKE SURE THIS LINE EXISTS!

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); // 🆕 MAKE SURE THIS LINE EXISTS!

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Server is running!',
    success: true 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📦 Available routes:`);
  console.log(`   - /api/auth`);
  console.log(`   - /api/admin`);
  console.log(`   - /api/products`);
  console.log(`   - /api/orders`); // 🆕
});