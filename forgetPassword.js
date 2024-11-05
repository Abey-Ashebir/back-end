const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer'); // For sending emails
const crypto = require('crypto'); // For generating random passwords
const CustomerModel = require('./customers'); // Ensure this is the correct model

const router = express.Router();

// Reset Password Route
router.post('/', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await CustomerModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a random password
    const newPassword = crypto.randomBytes(4).toString('hex'); // Generates a random 8-character password

    // Update user's password in the database (ensure you hash it before saving)
    user.password = newPassword; // In a real application, hash this password
    await user.save();

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Use your email provider
      auth: {
        user: 'your-email@gmail.com', // Your email
        pass: 'your-email-password', // Your email password
      },
    });

    // Email options
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Your new password is: ${newPassword}`, // Send the new password
    };

    // Send email
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        return res.status(500).json({ message: 'Error sending email' });
      }
      res.status(200).json({ message: 'Password reset link sent' });
    });

  } catch (error) {
    res.status(500).json({ message: 'Error processing request' });
  }
});

module.exports = router;
