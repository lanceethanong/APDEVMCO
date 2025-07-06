let editMode = false;

const profileData = {
  name: "Juan Dela Cruz",
  email: "juan.delacruz@dlsu.edu.ph",
  role: "Student",
  idNumber: "12345678",
  contactNumber: "09123456789",
  description: "Computer Science student specializing in AI",
};

const reservations = [
  {
    id: 1,
    lab: "Lab 1 (CCPROG3)",
    seat: "A12",
    date: "2025-06-20",
    time: "10:00-12:30"
  },
  {
    id: 2,
    lab: "Lab 3 (STCHUIX)",
    seat: "B05",
    date: "2025-06-22",
    time: "14:00-16:00"
  }
];

function populateProfileFields() {
  const container = document.getElementById("profile-fields");
  container.innerHTML = `
    <h2>${profileData.name}</h2>
    <p class="info">${profileData.role}</p>
    <p class="info">${profileData.idNumber}</p>

    <div class="profile-field">
      <label>DLSU Email</label>
      <p>${profileData.email}</p>
    </div>

    <div class="profile-field">
      <label>Contact Number</label>
      ${editMode
        ? `<input type="tel" id="contactNumber" value="${profileData.contactNumber}" />`
        : `<p>${profileData.contactNumber}</p>`}
    </div>
  `;

  const about = document.getElementById("about-text");
  about.readOnly = !editMode;
  about.value = profileData.description;

  updateEditButtons();
}

function enableEditMode() {
  editMode = true;
  populateProfileFields();
}

function cancelEditMode() {
  editMode = false;
  populateProfileFields();
}

function saveProfile() {
  if (editMode) {
    profileData.contactNumber = document.getElementById("contactNumber").value;
    profileData.description = document.getElementById("about-text").value;
    alert("Profile updated successfully!");
    editMode = false;
    populateProfileFields();
  }
}

function updateEditButtons() {
  const editButtons = document.getElementById("edit-buttons");
  editButtons.innerHTML = editMode
    ? `<button onclick="saveProfile()">Save Changes</button>
       <button onclick="cancelEditMode()">Cancel</button>`
    : `<button onclick="enableEditMode()">Edit Profile</button>`;
}

function editReservation(id) {
  const reservation = reservations.find(r => r.id === id);
  if (reservation) {
    alert(`Editing reservation #${id}\nLab: ${reservation.lab}\nSeat: ${reservation.seat}\nDate: ${reservation.date}\nTime: ${reservation.time}`);
    // In a real implementation, you would open a modal here to edit the reservation
  }
}

function cancelReservation(id) {
  if (confirm("Are you sure you want to cancel this reservation?")) {
    alert(`Reservation #${id} cancelled`);
    // In a real implementation, you would remove the reservation from the array and update the UI
  }
}

function renderReservations() {
  const container = document.getElementById("reservations");
  container.innerHTML = reservations
    .map(
      (r) => `
    <div class="reservation-item">
      <p><strong>Lab:</strong> ${r.lab}</p>
      <p><strong>Seat:</strong> ${r.seat}</p>
      <p><strong>Date:</strong> ${r.date}</p>
      <p><strong>Time:</strong> ${r.time}</p>
      <div class="reservation-actions">
        <button class="edit-btn" onclick="editReservation(${r.id})">Edit</button>
        <button class="cancel-btn" onclick="cancelReservation(${r.id})">Cancel</button>
      </div>
    </div>
  `
    )
    .join("");
}

function deleteAccount() {
  if (confirm("Are you sure you want to delete your account? This will cancel all your reservations.")) {
    alert("Account deleted successfully!");
    window.location.href = "login.html";
  }
}

function openPasswordModal() {
  document.getElementById('password-modal').style.display = 'block';
}

function closePasswordModal() {
  document.getElementById('password-modal').style.display = 'none';
  document.getElementById('change-password-form').reset();
}

function togglePasswordVisibility(fieldId) {
  const field = document.getElementById(fieldId);
  field.type = field.type === 'password' ? 'text' : 'password';
}

function changePassword() {
  const oldPassword = document.getElementById('old-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (newPassword !== confirmPassword) {
    alert("New passwords don't match!");
    return false;
  }

  if (newPassword.length < 8) {
    alert("Password must be at least 8 characters long!");
    return false;
  }

  alert("Password changed successfully!");
  closePasswordModal();
  return false;
}

window.onload = () => {
  populateProfileFields();
  renderReservations();
  
  document.getElementById('change-password-form').onsubmit = function(e) {
    e.preventDefault();
    changePassword();
  };
};