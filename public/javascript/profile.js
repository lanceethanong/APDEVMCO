// Enable edit mode - shows editable fields
function enableEditMode() {
  // Make the about textarea editable
  const aboutTextarea = document.getElementById('about-text');
  aboutTextarea.readOnly = false;
  aboutTextarea.style.backgroundColor = 'white';
  aboutTextarea.style.border = '1px solid #ccc';
  
  // Change button text and functionality
  const editButton = document.querySelector('#edit-buttons button');
  editButton.textContent = 'Save Changes';
  editButton.onclick = saveProfileChanges;
  
  // Add cancel button
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.onclick = cancelEditMode;
  cancelButton.style.marginLeft = '10px';
  document.getElementById('edit-buttons').appendChild(cancelButton);
}

// Cancel edit mode - reverts to display mode
function cancelEditMode() {
  // Make the about textarea readonly again
  const aboutTextarea = document.getElementById('about-text');
  aboutTextarea.readOnly = true;
  aboutTextarea.style.backgroundColor = 'transparent';
  aboutTextarea.style.border = 'none';
  
  // Reset button
  const editButton = document.querySelector('#edit-buttons button');
  editButton.textContent = 'Edit Profile';
  editButton.onclick = enableEditMode;
  
  // Remove cancel button
  const cancelButton = document.querySelector('#edit-buttons button:last-child');
  if (cancelButton && cancelButton.textContent === 'Cancel') {
    cancelButton.remove();
  }
}

// Save profile changes to the server
async function saveProfileChanges() {
  const newAbout = document.getElementById('about-text').value;
  
  try {
    // Get username from the page
    const username = document.querySelector('.profile-info h2').textContent;
    
    const response = await fetch(`/api/users/${encodeURIComponent(username)}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: newAbout
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      alert('Profile updated successfully!');
      cancelEditMode();
    } else {
      alert(result.error || 'Failed to update profile');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while updating your profile');
  }
}

// Password change functionality
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

async function changePassword() {
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

  try {
    const username = document.querySelector('.profile-info h2').textContent;
    
    const response = await fetch(`/api/users/${encodeURIComponent(username)}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oldPassword,
        newPassword
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      alert("Password changed successfully!");
      closePasswordModal();
    } else {
      alert(result.error || "Failed to change password");
    }
  } catch (error) {
    console.error('Error:', error);
    alert("An error occurred while changing password");
  }

  return false;
}

// Delete modal functions
function showDeleteModal() {
  document.getElementById('delete-modal').style.display = 'block';
}

function hideDeleteModal() {
  document.getElementById('delete-modal').style.display = 'none';
}

async function confirmDeleteAccount() {
  try {
    // Get username from the profile page
    const username = document.querySelector('.profile-info h2').textContent.trim();
    
    console.log('Attempting to delete user:', username); // Debug log
    
    const response = await fetch(`/api/users/${encodeURIComponent(username)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      alert('Account deleted successfully');
      // Redirect to login page
      window.location.href = '/login';
    } else {
      console.error('Delete failed:', result); // Debug log
      alert(result.error || 'Failed to delete account');
      hideDeleteModal();
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    alert('An error occurred while deleting the account');
    hideDeleteModal();
  }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Set up password form submission
  const passwordForm = document.getElementById('change-password-form');
  if (passwordForm) {
    passwordForm.onsubmit = function(e) {
      e.preventDefault();
      changePassword();
    };
  }
  
  // Set up edit profile button
  const editButton = document.querySelector('#edit-buttons button');
  if (editButton) {
    editButton.onclick = enableEditMode;
  }
  
  // Set up delete account button
  const deleteBtn = document.querySelector('.account-actions button:last-of-type');
  if (deleteBtn) {
    deleteBtn.onclick = showDeleteModal;
  }
});