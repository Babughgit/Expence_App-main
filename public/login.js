const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Basic validation to check if fields are filled
    if (!email || !password) {
        alert('Please fill out both email and password fields.');
        return;
    }

    // Send the login request
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(function (response) {
        if (!response.ok) {
            return response.text().then((message) => { throw new Error(message); });
        }
        return response.text(); // Parse the response as JSON if successful
    })
    .then(function (data) {
        console.log("Login success", data);
        alert('Login successful');
        window.location.href = '/expense'; // Redirect to the expense page after login
    })
    .catch(function (error) {
        console.log("Login error", error);
        alert('Error: ' + error.message); // Display error message to the user
    });
});
