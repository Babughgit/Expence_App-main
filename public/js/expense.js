function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

document.getElementById('expense_Form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const product_name = document.getElementById('description').value;
    const product_price = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
   

    try {
        const response = await fetch('/addExpense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ product_name, product_price, category })
        });

        const data = await response.json();
        if (response.ok) {
            console.log('Expense added successfully');
            document.getElementById('expense_Form').reset();
            fetchExpenses(); // Refresh the expense list
            loadAllUsersExpenses(); 
        } else {
            alert(data.err || "Failed to add expense");
        }
    } catch (err) {
        console.error('Error adding expense:', err);
        alert("Error adding expense");
    }
});

async function fetchExpenses() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/getExpense', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (response.ok) {
            const expenseList = document.getElementById('expenseList');
            expenseList.innerHTML = "";  // Clear existing expenses
            data.expenses.forEach(expense => {
                const listItem = document.createElement('li');
                listItem.textContent = `${expense.product_name} - Rs ${expense.product_price} (${expense.category})`;
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => deleteExpense(expense.id));
                listItem.appendChild(deleteButton);
                expenseList.appendChild(listItem);
            });
        } else {
            alert(data.error || 'Failed to fetch expenses');
        }
    } catch (err) {
        console.error('Error fetching expenses:', err);
    }
}

async function deleteExpense(expenseId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/deleteExpense/${expenseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            console.log('Expense deleted successfully');
            fetchExpenses(); // Refresh the expense list
            loadAllUsersExpenses(); // Refresh the leaderboard data instantly
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to delete expense');
        }
    } catch (err) {
        console.error('Error deleting expense', err);
        alert("Error deleting expense");
    }
}


async function checkUserPremiumStatus() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/checkPremium', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.isPremium) {
            showPremiumUserStatus();
        }
    } catch (error) {
        console.error("Error checking premium status:", error);
    }
}

function showPremiumUserStatus() {
    const buyPremiumButton = document.getElementById('buyPremiumButton');
    buyPremiumButton.textContent = "You are a Premium User";
    buyPremiumButton.disabled = true;
    document.getElementById('leaderboardSection').style.display = 'block';  // Show leaderboard for premium users
    loadAllUsersExpenses();
}

async function loadAllUsersExpenses() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/expense/leaderboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            displayExpensesLeaderboard(data.expenses);
        } else {
            console.error("Error loading leaderboard:", response.status);
        }
    } catch (error) {
        console.error("Error fetching leaderboard expenses:", error);
    }
}

function displayExpensesLeaderboard(expenses) {
    const leaderboardContainer = document.getElementById('leaderboard');
    leaderboardContainer.innerHTML = '';

    if (expenses.length === 0) {
        leaderboardContainer.textContent = "No expenses available.";
        return;
    }

    expenses.forEach(expense => {
        const userRow = document.createElement('div');
        userRow.className = 'user-expense-row';
        userRow.textContent = `${expense.username}: ₹${expense.total_expenses}`;
        leaderboardContainer.appendChild(userRow);
    });
}

function greetUser() {
    const token = localStorage.getItem('token');
    const userGreeting = document.getElementById('userGreeting');

    if (token) {
        const decodedToken = parseJwt(token);
        userGreeting.textContent = `Welcome, ${decodedToken.username}!`;
    } else {
        userGreeting.textContent = "Welcome, Guest!";
    }
}

document.getElementById('logoutbuttonid').addEventListener('click', function() {
    localStorage.removeItem('token');
    alert('You have been logged out!');
    window.location.href = '/login';
});

window.onload = function() {
    fetchExpenses();
    greetUser();
    checkUserPremiumStatus();
}
