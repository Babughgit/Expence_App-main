const expenseForm = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');

// Fetch expenses when the page loads
fetchExpenses();

expenseForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;

    const token = localStorage.getItem('token');

    fetch('/expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, description, category }),
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then((message) => { throw new Error(message); });
        }
        return response.text();
    })
    .then(data => {
        console.log("Expense added", data);
        fetchExpenses();
           // Clear input fields
           document.getElementById('amount').value = '';
           document.getElementById('description').value = '';
           document.getElementById('category').value = ''; // Refresh expense list
    })
    .catch(error => {
        console.log("Error adding expense", error.message);
    });
});


// Function to fetch expenses
function fetchExpenses() {
    const token = localStorage.getItem('token');

    fetch('/expenses', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch expenses');
        }
        return response.json();
    })
    .then(expenses => {
        expenseList.innerHTML = '';
        expenses.forEach(expense => {
            const li = document.createElement('li');
            li.textContent = `${expense.description}: ${expense.amount} (${expense.category})`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteExpense(expense.expense_id);
            li.appendChild(deleteButton);
            expenseList.appendChild(li);
        });
    })
    .catch(error => {
        console.log("Error fetching expenses", error.message);
    });
}

// Function to delete expense
function deleteExpense(expenseId) {
    const token = localStorage.getItem('token');

    fetch(`/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete expense');
        }
        fetchExpenses(); // Refresh expense list
    })
    .catch(error => {
        console.log("Error deleting expense", error.message);
    });
}
