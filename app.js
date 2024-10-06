const mysql = require('mysql2/promise');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const port = 4000;
const saltRounds = 10; 

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
  console.log(name,email,password);
  try {
    // Check if email already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser.length > 0) {
      return res.status(400).send('Email already registered');
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user into the database
    await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    res.status(200).json({ message: "Signup successful" });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json('Server error');
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

    // Compare provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send('Incorrect password');
    }

    res.status(200).send('Login successful');
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Server error');
  }
});

app.post('/expenses', async (req, res) => {
  const { user_id, amount, description, category } = req.body; // Make sure to destructure user_id from the request body

  if (!user_id) {
    return res.status(400).send('User ID is required');
  }

  try {
      // Insert the new expense into the database
      await db.query('INSERT INTO expenses (user_id, description, amount, category) VALUES (?, ?, ?, ?)', [user_id, description, amount, category]);
      res.status(200).send('Expense added successfully');
  } catch (error) {
      console.error('Error adding expense:', error);
      res.status(500).send('Server error');
  }
});


app.get('/expenses', async (req, res) => {
  try {
      const [expenses] = await db.query('SELECT * FROM expenses');
      res.status(200).json(expenses); // Send expenses as JSON
  } catch (error) {
      console.error('Error retrieving expenses:', error);
      res.status(500).send('Server error');
  }
});
app.delete('/expenses/:expense_id', async (req, res) => {
  console.log('Received DELETE request:', req.params); // Log parameters

  const { expense_id } = req.params; // Extract expense_id from URL parameters

  if (!expense_id) {
      return res.status(400).send('Expense ID is required');
  }

  console.log('Expense ID:', expense_id); // Debugging line to check the value

  try {
      // Ensure that you are using the correct column name 'expense_id'
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
