const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const CustomerModel = require('./customers');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/shopper')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

// Signup Route
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = await CustomerModel.create({ name, email, password: hashedPassword });
    res.status(201).json(customer);
  } catch (err) {
    console.error('Error registering customer:', err);
    res.status(500).json({ error: 'Failed to register customer' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const customer = await CustomerModel.findOne({ email });
    if (!customer) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Successful login
    res.status(200).json({ message: 'Login successful', customer });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Start server
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
