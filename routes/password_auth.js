const express = require('express');
const router = express.Router();
const db = require('../config/db');
require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const SibApiV3Sdk = require('sib-api-v3-sdk');

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Send reset password email function
const sendResetPasswordEmail = async (recipientEmail, token) => {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const resetLink = `http://localhost:4000/reset-password?token=${token}`;

    const emailData = {
        sender: { 
            name: process.env.SENDER_NAME, 
            email: process.env.SENDER_EMAIL 
        },
        to: [{ email: recipientEmail }],
        subject: "Password Reset",
        htmlContent: `<p>Click the link to reset your password: <a href="${resetLink}">Reset Password</a></p>`
    };

    try {
        const response = await apiInstance.sendTransacEmail(emailData);
        console.log('Email sent:', response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};


// Forgot password endpoint
// Forgot Password Route

router.post('/forgot-password', async(req, res) => {
    console.log('Received forgot-password request:', req.body); // Log the request data
    const { email } = req.body;
    try{
        const [results] = await db.query('SELECT * FROM usersdata WHERE email = ?', [email]);
        
        if (results.length === 0) {
            console.error('User not found');
            return res.status(400).json({ message: 'User not found' });
        }
        const token = crypto.randomBytes(32).toString('hex');
        await db.query('UPDATE usersdata SET reset_token = ?, resetPasswordExpires = ? WHERE email = ?', [
            token, new Date(Date.now() + 3600000), email // Token expires in 1 hour
        ]);
        await sendResetPasswordEmail(email, token);
        res.json({ message: 'Reset link sent to your email' });
    }catch(err)
    {
        console.error('Error during forgot-password process:', err);
        res.status(500).json({ message: 'Error generating reset link' });
    }
     });

// Reset Password
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Find user by reset token
        const [results] = await db.query('SELECT * FROM usersdata WHERE reset_token = ?', [token]);
        
        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        const user = results[0];

        // Check if the token has expired
        // if (new Date() > user.resetPasswordExpires) {
        //     return res.status(400).json({ message: 'Token has expired' });
        // }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user’s password and clear the reset token
        await db.query(
            'UPDATE usersdata SET hashedpassword = ?, reset_token = NULL, resetPasswordExpires = NULL WHERE reset_token = ?',
            [hashedPassword, token]
        );

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        console.error('Error during password reset:', err);
        res.status(500).json({ message: 'Error resetting password' });
    }
});




module.exports = router;
