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
            'Content-Type': 'application/json', // Correct the Content-Type
        },
        body: JSON.stringify({ email, password }), // Send email and password as JSON
    })
    .then(function (response) {
        if (!response.ok) {
            return response.text().then((message) => { throw new Error(message); });
        }
        return response.json(); // Parse the response as JSON if successful
    })
    .then(function (data) {
        console.log("Login success", data);
        alert('Login successful'); // Inform the user about successful login
        // Redirect or update the UI as needed (e.g., redirect to the dashboard)
    })
    .catch(function (error) {
        console.log("Login error", error);
        alert('Error: ' + error.message); // Inform the user about any error
    });
});
