const mysql = require('mysql2/promise');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 4000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Create MySQL connection
const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'Babusql@2024',
  database: 'Expense_App'
});
db.getConnection()
  .then(connection => {
    console.log('Database connected');
    connection.release();  // Release the connection back to the pool
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if email already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser.length > 0) {
      return res.status(400).send('Email already registered');
    }

    // Insert new user into the database
    await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
    res.status(200).send('Signup successful');
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).send('Server error');
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).send('User not found');
    }

    const user = rows[0];

    // Check if password matches
    if (user.password !== password) {
      return res.status(401).send('Incorrect password');
    }

    res.status(200).send('Login successful');
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
