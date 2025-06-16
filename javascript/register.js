document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const password = document.getElementById('password');
    const confirm = document.getElementById('confirm-password');
    const password_error = document.getElementById('confirm-password-error');
    const email_input = document.getElementById('email');
    const email_error = document.getElementById('emailError');
    const role = document.getElementById('role'); 

    let isValid = true;

    email_error.innerHTML = "";
    password_error.innerHTML = "";

    // Validate email
    if (!/@dlsu.edu.ph\s*$/.test(email_input.value)) {
      email_error.innerHTML = "Please enter an email from the accepted domain.";
      isValid = false;
    }

    // Validate password match
    if (password.value !== confirm.value) {
      password_error.innerHTML = "Please ensure to input the same password for both fields.";
      isValid = false;
    }

    // Validate role
    if (!role || !role.value) {
      alert("Please select a role.");
      isValid = false;
    }

    // If all valid, redirect based on role
    if (isValid) {
      if (role.value === "student") {
        window.location.href = "dashboard.html";
      } else if (role.value === "technician") {
        window.location.href = "technician-dashboard.html";
      }
    }
  });
});