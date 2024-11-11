const jwt = require('jsonwebtoken');
require('dotenv').config('.env');
const JWT_SECRET = process.env.JWT_SECRET ;  // Make sure your secret key is set in .env

// Middleware function to authenticate JWT
// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided, authorization denied' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user; // Attach user info to request
        next();
    });
};
module.exports=authenticateToken;