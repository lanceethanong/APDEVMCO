let editMode = false;

const profileData = {
  name: "Juan Dela Cruz",
  email: "juan.delacruz@dlsu.edu.ph",
  role: "Student",
  idNumber: "12345678",
  contactNumber: "09123456789",
  isAnonymous: false,
  description: "Computer Science student specializing in AI",
};

const reservations = [
  {
    id: 1,
    lab: "Lab 1 (CCPROG3)",
    seat: "A12",
    date: "2025-06-20",
    time: "10:00-12:30",
    anonymous: false,
  },
  {
    id: 2,
    lab: "Lab 3 (STCHUIX)",
    seat: "B05",
    date: "2025-06-22",
    time: "14:00-16:00",
    anonymous: true,
  },
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

    <div class="profile-field">
      ${editMode
        ? `<label><input type="checkbox" id="isAnonymous" ${
            profileData.isAnonymous ? "checked" : ""
          } /> Make reservations anonymous</label>`
        : `<label>Reservations: ${
            profileData.isAnonymous ? "Anonymous" : "Not Anonymous"
          }</label>`}
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
    profileData.isAnonymous = document.getElementById("isAnonymous").checked;
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

function cancelReservation(id) {
  alert(`Reservation #${id} cancelled`);
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
      ${r.anonymous ? `<span class="anonymous">Anonymous</span>` : ""}
      <button onclick="cancelReservation(${r.id})">Cancel</button>
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

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("collapsed");
}

function navigateTo(target) {
  if (target === "dashboard") {
    window.location.href = "dashboard.html";
  } else if (target === "help") {
    window.location.href = "help.html";
  } else if (target === "logout") {
    alert("Logging out...");
    window.location.href = "login.html";
  }
}

// On page load
window.onload = () => {
  populateProfileFields();
  renderReservations();
};