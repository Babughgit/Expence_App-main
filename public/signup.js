const signupForm = document.getElementById('signupForm');
const messageDisplay = document.getElementById('message');

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
    .then(response => {
        if (!response.ok) {
            return response.json().then((data) => { throw new Error(data.error); });
        }
        return response.json();
    })
    .then((data) => {
        console.log("Signup success", data);
        // Display the success message
        messageDisplay.textContent = "Signup successful!";
        messageDisplay.style.display = 'block'; // Show the message
        
        // Clear form fields
        document.getElementById('name').value = "";
        document.getElementById('email').value = "";
        document.getElementById('password').value = "";
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000); // 2000 milliseconds = 2 seconds
    })
    .catch((error) => {
        console.log("Signup error", error.message);
        messageDisplay.textContent = error.message; // Display error message on the webpage
        messageDisplay.style.display = 'block'; // Show the error message element
    });
});
