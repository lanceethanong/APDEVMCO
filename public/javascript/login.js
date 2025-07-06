document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');

  // Sample Users
  const allowedUsers = [
    { email: 'dlsustudent@dlsu.edu.ph', password: 'dlsu1234!', role: 'Student' },
    { email: 'kingvon@dlsu.edu.ph', password: 'kingvon666', role: 'Student' },
    { email: 'sga@dlsu.edu.ph', password: 'droppedbyshaisaura', role: 'Student' },
    { email: 'admin123@dlsu.edu.ph', password: '@dmin123456', role: 'Technician' },
    { email: 'juandelacruz@dlsu.edu.ph', password: 'joserizal1234 ', role: 'Student' }
  ];

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    const email_input = document.getElementById('email');
    const password_input = document.getElementById('password');
    const email_error = document.getElementById('emailError');
    email_error.innerHTML = ""; // Reset previous errors

    const email = email_input.value.trim();
    const password = password_input.value;

    // Check if user has a dlsu email
    if (!/@dlsu.edu.ph\s*$/.test(email)) {
      email_error.innerHTML = "Please enter your DLSU email address.";
      return;
    }

    // Check if email/password match a valid user
    const user = allowedUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      email_error.innerHTML = "Invalid email or password.";
      return;
    }

    // Redirect based on role
    if (user.role === 'Technician') {
      window.location.href = '/dashboard/technician';
    } else {
      window.location.href = '/dashboard/student';
    }
  });
});
