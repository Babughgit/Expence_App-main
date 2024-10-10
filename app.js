const mysql = require('mysql2/promise');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const jwt = require('jsonwebtoken');
const app = express();
const port = 4000;
const saltRounds = 10;
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with your actual secret key

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(path.join('public')));

// Create MySQL connection pool
const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'Babusql@2024',
  database: 'Expense_App'
});

db.getConnection()
  .then(connection => {
    console.log('Database connected');
    connection.release(); // Release the connection back to the pool
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

// Serve signup and login pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/expense', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'expense.html'));
});

// Signup Route
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
      // Check if email already exists
      const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

      // If the email already exists, return an error response
      if (existingUser.length > 0) {
          return res.status(400).json({ error: 'Email already registered', redirect: true });
      }

      // Hash the password before storing it
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user into the database
      await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
      
      // Return success message
      res.status(200).json({ message: "Signup successful" });
  } catch (error) {
      console.error('Error during signup:', error);
      res.status(500).json({ error: 'Server error' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' }); // Change to JSON response
    }

    const user = rows[0];

    // Compare provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect password' }); // Change to JSON response
    }

    // Create JWT token
    const token = jwt.sign({ userId: user.user_id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token, username: user.username });
 // Include username in response
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.sendStatus(403);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

// Expense Management Routes
app.post('/expenses', authenticateJWT, async (req, res) => {
  const { description, amount, category } = req.body; 
  const userId = req.user.userId;

  try {
    await db.query('INSERT INTO expenses (user_id, description, amount, category) VALUES (?, ?, ?, ?)', [userId, description, amount, category]);
    res.status(200).send('Expense added successfully');
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).send('Server error');
  }
});

app.get('/expenses', authenticateJWT, async (req, res) => {
  const userId = req.user.userId; 
  try {
    const [expenses] = await db.query('SELECT * FROM expenses WHERE user_id = ?', [userId]);
    res.status(200).json(expenses); 
  } catch (error) {
    console.error('Error retrieving expenses:', error);
    res.status(500).send('Server error');
  }
});

app.delete('/expenses/:expense_id', authenticateJWT, async (req, res) => {
  const { expense_id } = req.params; 

  try {
    await db.query('DELETE FROM expenses WHERE expense_id = ?', [expense_id]);
    res.status(200).send('Expense deleted successfully');
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
