document.getElementById('expenseForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent page reload on form submission

    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;

    // Sending the expense data to the server
    const response = await fetch('/expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, description, category }),
    });

    if (response.ok) {
        alert('Expense added successfully!');
        loadExpenses(); // Reload expenses list after adding a new expense
    } else {
        alert('Error adding expense');
    }
});

// Function to load and display expenses from the server
async function loadExpenses() {
    const response = await fetch('/expenses');
    const expenses = await response.json();

    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = ''; // Clear existing list

    expenses.forEach(expense => {
        const listItem = document.createElement('li');
        listItem.textContent = `${expense.description} - ${expense.amount} (${expense.category})`;

        // Add delete button for each expense
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.style.marginLeft = '10px';
        deleteButton.onclick = async () => {
            await deleteExpense(expense.id);
        };

        listItem.appendChild(deleteButton);
        expenseList.appendChild(listItem);
    });
}

// Function to send a DELETE request
async function deleteExpense(id) {
    const response = await fetch(`/expenses/${id}`, {
        method: 'DELETE',
    });

    if (response.ok) {
        alert('Expense deleted successfully!');
        loadExpenses(); // Reload expenses list after deleting an expense
    } else {
        alert('Error deleting expense');
    }
}

// Load expenses when the page loads
window.onload = loadExpenses;
