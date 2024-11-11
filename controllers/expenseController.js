const db = require('../config/db'); // Import your database connection



// Add a new expense (POST)
exports.addExpense = async (req, res) => {
    try {
        const { product_name, product_price,category } = req.body;
        console.log(product_name,product_price,category);
        const user_id = req.user.userid;  // Access user_id from req.user
        console.log("User ID from request:", user_id); // Log user ID

        if (!product_name || !product_price) {
            return res.status(400).json({ message: "Please provide product name and price." });
        }

        // Insert new expense into the database
        const result = await db.query(
            'INSERT INTO expenses (user_id, product_name, product_price,category) VALUES (?, ?, ?, ?)', 
            [user_id, product_name, product_price,category]
        );
        res.status(201).json({ message: "Expense added successfully", expenseId: result[0].insertId });
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ message: "Server error" });
    }
};


// Get all expenses for the authenticated user (GET)
exports.getExpense = async (req, res) => {
    try {
        const user_id = req.user.userid;  // Correct this line
        console.log("Fetching expenses for user_id:", user_id); // Log the user ID

        // Fetch expenses for the logged-in user
        const [expenses] = await db.query(
            'SELECT * FROM expenses WHERE user_id = ?', 
            [user_id]
        );
        res.status(200).json({ expenses });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.deleteExpense = async (req, res) => {
    try {
        const { expense_id } = req.params; // Use expense_id to match the route
        const user_id = req.user.userid;  // Access user ID from req.user
        console.log(`${expense_id}`);

        // Check if the expense belongs to the authenticated user
        const [expense] = await db.query(
            'SELECT * FROM expenses WHERE id = ? AND user_id = ?', 
            [expense_id, user_id]
        );

        if (expense.length === 0) {
            return res.status(404).json({ message: "Expense not found or unauthorized" });
        }

        // Delete the expense from the database
        await db.query('DELETE FROM expenses WHERE id = ?', [expense_id]);

        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: "Server error" });
    }
};
// Get total expenses for all users (GET)
exports.getLeaderboard = async (req, res) => {
    try {
        // Fetch total expenses grouped by user_id, setting null sums to 0
        const [results] = await db.query(`
            SELECT u.username, IFNULL(SUM(e.product_price), 0) AS total_expenses 
            FROM usersdata u
            LEFT JOIN expenses e ON u.user_id = e.user_id
            GROUP BY u.user_id
            ORDER BY total_expenses DESC
        `);

        res.status(200).json({ expenses: results });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: "Server error" });
    }
};
