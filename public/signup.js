
signupForm = document.getElementById('signupForm');
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
    }).then(function (response) {
        if (!response.ok) {
            return response.text().then((message) => { throw new Error(message); });
        }
        return response.json(); // Parse the response as JSON if successful
    })
    .then(function (data) {
        console.log("Signup success", data);
        const name=document.getElementById('name').value="";
        const email=document.getElementById('email').value="";
        const password=document.getElementById('password').value="";
        window.location.href = '/login'; 
    })
    .catch(function (error) {
        console.log("Signup error", error); 
    });
});
