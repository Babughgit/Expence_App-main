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
        
        // Log expense id
        console.log('Expense ID:', expense.expense_id); // Check that this matches your database field name
        
        deleteButton.onclick = async () => {
            await deleteExpense(expense.expense_id); // Ensure this matches your database field name
        };

        listItem.appendChild(deleteButton);
        expenseList.appendChild(listItem);
    });
}

// Function to send a DELETE request
async function deleteExpense(id) {
    console.log('Deleting expense with ID:', id); // Debugging line to check the value

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

// Event listener for form submission
document.getElementById('expenseForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent page reload on form submission

    const user_id = 1; // Assuming you have the user ID available in your context
    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;

    // Sending the expense data to the server
    const response = await fetch('/expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, amount, description, category }), // Include user_id here
    });

    if (response.ok) {
        alert('Expense added successfully!');
        loadExpenses(); // Call loadExpenses after adding a new expense
    } else {
        alert('Error adding expense');
    }
});

// Load expenses when the page loads
window.onload = loadExpenses;
