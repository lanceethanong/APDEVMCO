document.addEventListener('DOMContentLoaded', () =>{
    const form = document.getElementById('login-form');

    form.addEventListener('submit', function(event){
        event.preventDefault();
        const email_input = document.getElementById('email');
        const email_error = document.getElementById('emailError');
        if(!/@dlsu.edu.ph\s*$/.test(email_input.value)){
            email_error.innerHTML = "Please enter an email from the accepted domain.";
        }
        else
            form.submit();
    });
});


