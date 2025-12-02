const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/database');

dotenv.config();
connectDB();

const checkAdmin = async () => {
  try {
    const user = await User.findOne({ email: 'user@ecommerce.com' });
    
    if (user) {
      console.log('✅ Admin user found!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', user.email);
      console.log('👤 Username:', user.username);
      console.log('👑 Role:', user.role);
      console.log('🆔 ID:', user._id);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (user.role !== 'user') {
        console.log('⚠️  WARNING: User role is NOT user!');
        console.log('🔧 Fixing role...');
        
        user.role = 'user';
        await user.save();
        
        console.log('✅ Role updated to user!');
      }
    } else {
      console.log('❌ Admin user not found!');
      console.log('Run: node addTestUser.js');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkAdmin();