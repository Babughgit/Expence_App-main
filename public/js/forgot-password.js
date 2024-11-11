document.getElementById("forgotPasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log('reset clicked')
    const email = document.getElementById("email").value;
    const response = await fetch("/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });
    
    const result = await response.json();
    alert(result.message);
});