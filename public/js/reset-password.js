document.getElementById("resetPasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById("newPassword").value;
    const token = new URLSearchParams(window.location.search).get("token");
    const response = await fetch("/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
    });
    const result = await response.json();
    alert(result.message);
});