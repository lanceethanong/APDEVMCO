document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('emailError');

  form.addEventListener('submit', function (event) {
    emailError.textContent = '';

    const email = emailInput.value.trim();

    // Check if email is a valid DLSU address
    if (!/@dlsu\.edu\.ph\s*$/.test(email)) {
      event.preventDefault(); // Stop form from submitting
      emailError.textContent = 'Please use your DLSU email address.';
    }
  });
});