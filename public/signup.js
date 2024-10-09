// Get the error display element
const errorDisplay = document.getElementById('errorDisplay');

// Event listener for the signup form submission
signupForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
    })
    .then(response => response.json()) // Parse response as JSON
    .then((data) => {
        // Check for a redirect indication in the response
        if (data.redirect) {
            errorDisplay.textContent = 'Email already registered'; // Show error message
            errorDisplay.style.display = 'block'; // Display the error message
            // Redirect to the login page after 2 seconds
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000); // 2000 milliseconds = 2 seconds
        } else if (data.message) {
            console.log("Signup success", data.message);
            // Clear form fields after successful signup
            document.getElementById('name').value = "";
            document.getElementById('email').value = "";
            document.getElementById('password').value = "";
            window.location.href = '/login'; // Redirect to login page on successful signup
        }
    })
    .catch((error) => {
        console.log("Signup error", error.message);
        errorDisplay.textContent = error.message; // Display the error message on the webpage
        errorDisplay.style.display = 'block'; // Show the error message element
    });
});
