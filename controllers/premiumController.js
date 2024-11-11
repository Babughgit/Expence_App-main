const Razorpay = require('razorpay');
const db = require('../config/db');
require('dotenv').config('.env');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,  
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.initiatePremiumPayment = async (req, res) => {
    const user_id = req.user.userid;
    
    const options = {
        amount: 50000, // INR 500 in paisa
        currency: "INR",
        receipt: `receipt_${user_id}`
    };

    try {
        const order = await razorpay.orders.create(options);
        res.status(200).json({ order_id: order.id, amount: order.amount });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ message: "Error initiating payment" });
    }
};

exports.confirmPremium = async (req, res) => {
    const user_id = req.user.userid;
    try {
        await db.query('UPDATE usersdata SET premium = 1 WHERE user_id = ?', [user_id]);
        res.status(200).json({ message: "Payment confirmed, user is now premium" });
    } catch (error) {
        console.error("Error updating user to premium:", error);
        res.status(500).json({ message: "Error confirming payment" });
    }
};
exports.checkPremium = async (req, res) => {
    const user_id = req.user.userid; // Assuming `authenticateJWT` middleware adds `userid` to `req.user`

    try {
        const [rows] = await db.query('SELECT premium FROM usersdata WHERE user_id = ?', [user_id]);

        if (rows.length > 0) {
            const isPremium = rows[0].premium === 1;
            res.status(200).json({ isPremium });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error checking premium status:", error);
        res.status(500).json({ message: "Error checking premium status" });
    }
};
