document.getElementById('loginForm').addEventListener('submit',async function(e){
    e.preventDefault();

    const email=document.getElementById('email').value;
    const password=document.getElementById('password').value;
try{
    const response=await fetch('/auth/login',({
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(
            {
                email:email,
                password:password
            }
        ),
    }));

    const data=await response.json();
    if(response.ok)
    {
        alert("login successfull");
        localStorage.setItem('token',data.token);
        window.location.href='/dashboard';
    }
    else{
        alert(data.error || "login failed")

    }
}
catch(err)
{
    console.log("error during login");
    alert("error during login");
}
});