document.addEventListener('DOMContentLoaded', () =>{
    const form = document.getElementById('register-form');

    form.addEventListener('submit', function(event){
        event.preventDefault();
        const password = document.getElementById('password');
        const confirm = document.getElementById('confirm-password');
        const password_error = document.getElementById('confirm-password-error');
        const email_input = document.getElementById('email');
        const email_error = document.getElementById('emailError');

        if(!/@dlsu.edu.ph\s*$/.test(email_input.value)){
            email_error.innerHTML = "Please enter an email from the accepted domain.";
        }

        if(password.value !== confirm.value){
            password_error.innerHTML = "Please ensure to input the same password for both fields.";
        }
        else
            form.submit();
    });
});