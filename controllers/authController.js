const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file
const db = require('../config/db.js');
const saltRound = 10;
const JWT_SECRET = process.env.JWT_SECRET;

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    
    try {
        // Check if user already exists
        const [existingUser] = await db.query(
            `SELECT * FROM usersdata WHERE email = ?`, [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: "Email already registered", redirect: true });
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRound);
        await db.query(`INSERT INTO usersdata (username, email, hashedpassword) VALUES (?, ?, ?)`, [name, email, hashedPassword]);

        res.status(201).json({ message: 'Signup successful' });
    } catch (error) {
        console.log("Error during signup:", error);
        res.status(500).json({ error: 'Server issue' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    
    try {
        // Retrieve user from the database
        const [rows] = await db.query(
            `SELECT * FROM usersdata WHERE email = ?`, [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.hashedpassword);
        
        if (!passwordMatch) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        // Generate JWT token
        const token = jwt.sign({ userid: user.user_id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

        // Set session if using sessions (optional)
        req.session.userid = user.user_id; // This line is optional and depends on whether you're using sessions
        console.log("Generated token for user_id:", user.user_id); // Log user_id
        res.status(200).json({ message: "Login successful", token, username: user.username });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ error: 'Server error' });
    }
};
