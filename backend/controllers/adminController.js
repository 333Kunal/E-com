const User = require('../models/User');

// 🔹 GET ALL USERS (Admin Only)
// Route: GET /api/user/users/all
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users from database
    // We exclude password field for security
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// 🔹 CREATE NEW USER (Admin Only)
// Route: POST /api/user/users/create
exports.createUser = async (req, res) => {
  try {
    const { username, name, email, password, role, phone, address } = req.body;

    // Validate required fields
    if (!username || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, name, email, and password'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create new user instance
    const user = new User({
      username,
      name,
      email,
      password,
      role: role || 'user',
      phone: phone || '',
      address: address || ''
    });

    // Hash password
    await user.hashPassword();

    // Save to database
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// 🔹 UPDATE USER (Admin Only)
// Route: PUT /api/user/users/update/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, name, email, role, phone, address, password } = req.body;

    // Find user by ID
    let user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (username) user.username = username;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    // If password is provided, hash it
    if (password) {
      user.password = password;
      await user.hashPassword();
    }

    // Save updated user
    await user.save();

    // Get user without password
    const updatedUser = await User.findById(id).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// 🔹 DELETE USER (Admin Only)
// Route: DELETE /api/user/users/delete/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent user from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// 🔹 GET SINGLE USER (Admin Only)
// Route: GET /api/user/users/:id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};