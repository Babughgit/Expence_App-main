const loginForm = document.getElementById('loginForm');
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
    }).then(function (response) {
        if (!response.ok) {
            return response.text().then((message) => { throw new Error(message); });
        }
        return response.text(); 
    })
    .then(function (data) {
        console.log("Login success", data);
        // Redirect to the expense page
        window.location.href = '/expense'; 
    })
    .catch(function (error) {
        console.log("Login error", error.message);
    });
});
