const loginForm=document.getElementById('loginForm');
loginForm.addEventListener('submit',function(e)
{
    e.preventDefault();
    const email=document.getElementById('email').value;
    const password=document.getElementById('password').value;
    console.log(email,password);

    fetch('/login',
        {
            method:'POST',
            headers:{
                'Content-Type':'Application/json'
            },
            body:JSON.stringify({email,password})
        }
    ).then(function(response)
{
    return response.json();
}).then(function(data)
{
    console.log("login success",data);
})
})