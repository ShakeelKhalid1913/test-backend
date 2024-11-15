const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Import User model
const jwt = require('jsonwebtoken');  // For JWT

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    console.log("User Found:", user);  // Log the user to verify it's fetched

    if (!user) {
      return res.status(400).send('Invalid credentials');
    }

    // Compare passwords using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,  // Make sure JWT_SECRET is defined in your .env file
      { expiresIn: '1h' }
    );

    res.status(200).send({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Server error');
  }
};

module.exports = login;
