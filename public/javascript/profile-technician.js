let editMode = false;

const profileData = {
  name: "admin123",
  email: "admin123@dlsu.edu.ph",
  role: "Technician",
  idNumber: "12212345",
  contactNumber: "09123456789",
  description: "Senior Lab Technician specializing in computer systems",
};

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

// Password Change Functions
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

// On page load
window.onload = () => {
  populateProfileFields();
  
  // Add change password form submission handler
  document.getElementById('change-password-form').onsubmit = function(e) {
    e.preventDefault();
    changePassword();
  };
};

// Add these functions to your existing profile-technician.js

// Delete Account Functions
// Delete Account Functions
function showDeleteModal() {
  document.getElementById('delete-modal').style.display = 'block';
}

function hideDeleteModal() {
  document.getElementById('delete-modal').style.display = 'none';
}

async function confirmDeleteAccount() {
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(profileData.name)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });

    if (response.ok) {
      alert('Account deleted successfully');
      window.location.href = '/login';
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete account');
    }
  } catch (error) {
    console.error('Error:', error);
    alert(error.message);
    hideDeleteModal();
  }
}

// Update the window.onload function
window.onload = () => {
  populateProfileFields();
  
  // Add change password form submission handler
  document.getElementById('change-password-form').onsubmit = function(e) {
    e.preventDefault();
    changePassword();
  };

  // Set up delete account button
  const deleteBtn = document.querySelector('.account-actions button:last-of-type');
  if (deleteBtn) {
    deleteBtn.onclick = showDeleteModal;
  }
};