const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Ensure this path matches your actual User model path
const router = express.Router();

// Route: POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Invalid credentials or inactive account.' });
    }

    // Check if the password is correct
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, user: { email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Route: GET /api/auth/user - Fetch logged-in user profile
router.get('/user', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract Bearer token from Authorization header
  if (!token) {
    return res.status(401).send({ message: 'No token provided' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    // Fetch the user data based on the decoded token's userId
    User.findById(decoded.id)
      .then((user) => {
        if (!user) {
          return res.status(404).send({ message: 'User not found' });
        }
        // Send back the user's profile information
        res.status(200).json({
          email: user.email,
          role: user.role,
          status: user.status,
          // Add other user fields you want to expose here
        });
      })
      .catch(() => {
        res.status(500).send({ message: 'Failed to fetch user data' });
      });
  });
});

module.exports = router;
