const loginForm = document.getElementById('loginForm');
const messageDisplay = document.getElementById('message'); // Make sure this element exists

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then((data) => { throw new Error(data.error); });
        }
        return response.json(); 
    })
    .then(data => {
        console.log("Login success", data);
        // Store the token and username if needed
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username); // Store username in local storage
        // Redirect to the expense page
        window.location.href = '/expense'; 
    })
    
    .catch(error => {
        console.log("Login error", error.message);
        messageDisplay.textContent = error.message; // Display error message
        messageDisplay.style.display = 'block'; // Show the error message element
    });
});
