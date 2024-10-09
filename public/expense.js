const expenseForm = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');

expenseForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;

    // Assuming you have a way to get the user_id from session/local storage
    const user_id = 1; // replace with actual user ID

    fetch('/expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, description, amount, category }),
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then((message) => { throw new Error(message); });
        }
        return response.text(); 
    })
    .then(() => {
        // Clear the input fields
        document.getElementById('amount').value = "";
        document.getElementById('description').value = "";
        document.getElementById('category').value = "";

        // Refresh the expenses
        loadExpenses();
    })
    .catch(error => {
        console.log("Add expense error", error.message);
    });
});

function loadExpenses() {
    fetch('/expenses')
        .then(response => response.json())
        .then(expenses => {
            expenseList.innerHTML = ''; // Clear current list
            expenses.forEach(expense => {
                const li = document.createElement('li');
                li.textContent = `${expense.description} - ${expense.amount} (${expense.category})`;

                // Create a delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = () => deleteExpense(expense.expense_id); // Attach delete function

                li.appendChild(deleteButton); // Append delete button to the list item
                expenseList.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Error fetching expenses:", error);
        });
}

function deleteExpense(expense_id) {
    fetch(`/expenses/${expense_id}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then((message) => { throw new Error(message); });
        }
        loadExpenses(); // Refresh the expenses after deletion
    })
    .catch(error => {
        console.error("Delete expense error:", error);
    });
}

// Load expenses when the page loads
window.onload = loadExpenses;
