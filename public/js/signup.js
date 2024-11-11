document.getElementById("SignupForm").addEventListener('submit', async function(e) { 
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Signup successful');
            window.location.href = '/login';
        } else {
            alert(data.error || 'Signup failed');
        }
        
    } catch (error) {
        console.log('Error during signup:', error);
    }
});
