const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/database');

dotenv.config();
connectDB();

const createAdmin = async () => {
  try {
    // Check if user exists
    const adminExists = await User.findOne({ email: 'admin@ecommerce.com' });
    
    if (adminExists) {
      console.log('⚠️  Admin already exists!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email: admin@ecommerce.com');
      console.log('🔑 Password: Admin@123');
      console.log('👑 Role: admin');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      process.exit(0);
    }

    // Create user user
    const user = new User({
      username: 'admin',
      name: 'Admin User',
      email: 'user@ecommerce.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+1234567890',
      address: '123 Admin Street'
    });

    await user.hashPassword();
    await user.save();

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Username: admin');
    console.log('📧 Email: admin@ecommerce.com');
    console.log('🔑 Password: Admin@123');
    console.log('👑 Role: admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    process.exit(1);
  }
};

createAdmin();