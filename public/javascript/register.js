document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');

  form.addEventListener('submit', function (event) {
    const password = document.getElementById('password');
    const confirm = document.getElementById('confirmPassword');
    const password_error = document.getElementById('confirm-password-error');
    const email_input = document.getElementById('email');
    const email_error = document.getElementById('emailError');
    const role = document.getElementById('role'); 

    let isValid = true;

    email_error.innerHTML = "";
    password_error.innerHTML = "";

    // Validate email
    if (!/@dlsu.edu.ph\s*$/.test(email_input.value)) {
      email_error.innerHTML = "Please enter a DLSU email address";
      isValid = false;
    }

    // Validate password match
    if (password.value !== confirm.value) {
      password_error.innerHTML = "Passwords do not match.";
      isValid = false;
    }

    if (password.value.length < 8) {
      password_error.innerHTML = "Passwords must be at least 8 characters";
      isValid = false;
    }

    if (!role || !role.value) {
      alert("Please select a role.");
      isValid = false;
    }

    if (!isValid) {
      event.preventDefault(); // Only stop submission if invalid
    }
  });
});
