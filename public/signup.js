signupForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!name || !email || !password) {
        alert('All fields are required');
        return;
    }

    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
    })
    .then((response) => {
        if (!response.ok) {
            return response.text().then((message) => { throw new Error(message); });
        }
        return response.json();
    })
    .then((data) => {
        console.log("success", data);
      

        // Clear input fields
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    })
    .catch((error) => {
        console.log("error", error);
       
    });
});
