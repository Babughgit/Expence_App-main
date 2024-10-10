const mysql = require('mysql2/promise');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const Razorpay = require('razorpay');

const app = express();
const port = 4000;
const saltRounds = 10;
const JWT_SECRET = 'babutestingproject'; // Updated JWT secret key
const razorpay = new Razorpay({
    key_id: 'rzp_test_N8ErFdSrLpInkD', // Your Razorpay key ID
    key_secret: '4HogPZ5ElGqdYhhnRtCfQkcf' // Your Razorpay key secret
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(path.join('public')));

// Set up session management
app.use(session({
    secret: 'test', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Change this to secure in production
}));

// Create MySQL connection pool
const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Babusql@2024',
    database: 'Expense_App'
});

// Route to create a Razorpay order
app.post('/create-order', async (req, res) => {
    const options = {
        amount: 50000, // Amount in smallest currency unit (e.g., 50000 paise for INR 500)
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Unable to create order' });
    }
});

// Database connection check
db.getConnection()
    .then(connection => {
        console.log('Database connected');
        connection.release();
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
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already registered', redirect: true });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

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
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        const token = jwt.sign({ userId: user.user_id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

        req.session.userId = user.user_id;
        res.status(200).json({ message: 'Login successful', token, username: user.username });
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

// Route to check user status
// Route to check user status and return whether they are premium or not
app.get('/user/status', authenticateJWT, async (req, res) => {
  const userId = req.user.userId;

  try {
      const [user] = await db.query('SELECT is_premium FROM users WHERE user_id = ?', [userId]);
      
      if (user.length > 0) {
          return res.status(200).json({ isPremium: user[0].is_premium });
      }

      res.status(404).json({ message: 'User not found' });
  } catch (error) {
      console.error('Error fetching user status:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


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

// Update user to premium status after successful payment
app.post('/update-to-premium', authenticateJWT, async (req, res) => {
  const userId = req.user.userId;

  try {
      await db.query('UPDATE users SET is_premium = TRUE WHERE user_id = ?', [userId]);
      res.status(200).json({ message: 'User updated to premium' });
  } catch (error) {
      console.error('Error updating user to premium:', error);
      res.status(500).send('Internal Server Error');
  }
});

// Leaderboard route
app.get('/leaderboard', authenticateJWT, async (req, res) => {
  try {
      const userId = req.user.userId;
      const [user] = await db.query('SELECT is_premium FROM users WHERE user_id = ?', [userId]);

      if (!user || !user[0].is_premium) {
          return res.status(403).json({ message: 'Access denied. Premium users only.' });
      }

      const [expenses] = await db.query(`
          SELECT e.expense_id, e.description, e.amount, e.category, u.username
          FROM expenses e
          JOIN users u ON e.user_id = u.user_id
      `);

      const formattedExpenses = expenses.map(exp => ({
          description: exp.description,
          amount: exp.amount,
          category: exp.category,
          username: exp.username
      }));

      res.json(formattedExpenses);
  } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
