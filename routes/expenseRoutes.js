const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController'); // Ensure this file exists and exports the right functions
const authenticateJWT = require('../middleWares/authMiddleware'); // Correct path for middleware

// Route to add an expense (POST request, requires authentication)
router.post('/addExpense', authenticateJWT, expenseController.addExpense);

// Route to get expenses (GET request, requires authentication)
router.get('/getExpense', authenticateJWT, expenseController.getExpense);

// Route to delete a specific expense (DELETE request, requires authentication)
// :expense_id is a route parameter for identifying which expense to delete
router.delete('/deleteExpense/:expense_id', authenticateJWT, expenseController.deleteExpense);
router.get('/expense/leaderboard', authenticateJWT, expenseController.getLeaderboard);

module.exports = router;
