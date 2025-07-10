// Utility function to get username reliably
function getUsername() {
  // Try to get from DOM first
  const usernameElement = document.querySelector('.profile-info h2');
  if (usernameElement) {
    return usernameElement.textContent.trim();
  }
  
  console.error('Could not determine username from DOM');
  return null;
}

// Search functionality
let searchTimeout;

async function searchUsers(query) {
  const resultsContainer = document.getElementById('search-results');
  
  if (!query || query.length < 2) {
    resultsContainer.innerHTML = '';
    resultsContainer.classList.remove('show');
    return;
  }

  clearTimeout(searchTimeout);
  
  // Debounce the search to avoid too many requests
  searchTimeout = setTimeout(async () => {
    try {
      const response = await fetch(`/api/users/search/${encodeURIComponent(query)}`);
      const users = await response.json();
      
      if (users.length === 0) {
        resultsContainer.innerHTML = '<div class="search-result-item">No users found</div>';
        resultsContainer.classList.add('show');
        return;
      }
      
      resultsContainer.innerHTML = users.map(user => `
        <div class="search-result-item" onclick="viewUserProfile('${user.username}')">
          <img src="/assets/profile.png" alt="${user.username}" class="search-result-pic">
          <div class="search-result-info">
            <strong>${user.username}</strong>
            <small>${user.email}</small>
            <div class="user-role-badge">${user.role}</div>
          </div>
        </div>
      `).join('');
      
      resultsContainer.classList.add('show');
      
    } catch (error) {
      console.error('Search failed:', error);
      resultsContainer.innerHTML = '<div class="search-result-item">Error loading results</div>';
      resultsContainer.classList.add('show');
    }
  }, 300);
}

function viewUserProfile(username) {
  const currentRole = '{{role}}'.toLowerCase().includes('technician') ? 'technician' : 'student';
  window.location.href = `/dashboard/${currentRole}/profile?username=${encodeURIComponent(username)}`;
}

// Delete Account Functions
function showDeleteModal() {
  document.getElementById('delete-modal').style.display = 'block';
}

function hideDeleteModal() {
  document.getElementById('delete-modal').style.display = 'none';
}

async function confirmDeleteAccount() {
  const username = getUsername();
  if (!username) {
    alert('Could not determine your username');
    return;
  }

  try {
    const response = await fetch(`/api/users/${encodeURIComponent(username)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      window.location.href = '/login?accountDeleted=true';
    } else {
      const errorData = await response.json();
      alert(`Failed to delete account: ${errorData.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    alert('An error occurred while trying to delete your account. Please try again.');
  } finally {
    hideDeleteModal();
  }
}

// Edit Profile Functions
function enableEditMode() {
  const aboutText = document.getElementById('about-text');
  aboutText.readOnly = false;
  aboutText.focus();
  
  const editButtons = document.getElementById('edit-buttons');
  editButtons.innerHTML = `
    <button onclick="saveProfileChanges()" class="save-btn">Save Changes</button>
    <button onclick="cancelEditMode()" class="cancel-btn">Cancel</button>
  `;
}

function cancelEditMode() {
  const aboutText = document.getElementById('about-text');
  aboutText.readOnly = true;
  
  const editButtons = document.getElementById('edit-buttons');
  editButtons.innerHTML = `<button onclick="enableEditMode()" class="edit-btn">Edit Profile</button>`;
}

async function saveProfileChanges() {
  const username = getUsername();
  if (!username) {
    alert('Could not determine your username');
    return;
  }

  const description = document.getElementById('about-text').value;
  
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(username)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description })
    });

    if (response.ok) {
      cancelEditMode();
      alert('Profile updated successfully!');
    } else {
      const errorData = await response.json();
      alert(`Failed to update profile: ${errorData.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('An error occurred while updating your profile. Please try again.');
  }
}

// Password Change Functions
function openPasswordModal() {
  if (!document.getElementById('password-modal')) {
    createPasswordModal();
  }
  document.getElementById('password-modal').style.display = 'block';
}

function closePasswordModal() {
  document.getElementById('password-modal').style.display = 'none';
}

function createPasswordModal() {
  const modal = document.createElement('div');
  modal.id = 'password-modal';
  modal.className = 'modal';
  
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="closePasswordModal()">&times;</span>
      <h2>Change Password</h2>
      <form id="password-form">
        <div class="form-group">
          <label for="current-password">Current Password</label>
          <div class="password-input">
            <input type="password" id="current-password" required>
            <span class="toggle-password" onclick="togglePasswordVisibility('current-password')">👁️</span>
          </div>
        </div>
        <div class="form-group">
          <label for="new-password">New Password</label>
          <div class="password-input">
            <input type="password" id="new-password" required minlength="8">
            <span class="toggle-password" onclick="togglePasswordVisibility('new-password')">👁️</span>
          </div>
          <small class="password-hint">Minimum 8 characters</small>
        </div>
        <div class="form-group">
          <label for="confirm-password">Confirm New Password</label>
          <div class="password-input">
            <input type="password" id="confirm-password" required minlength="8">
            <span class="toggle-password" onclick="togglePasswordVisibility('confirm-password')">👁️</span>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" onclick="closePasswordModal()" class="cancel-btn">Cancel</button>
          <button type="submit" class="submit-btn">Change Password</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('password-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    await changePassword();
  });
}

async function changePassword() {
  const username = getUsername();
  if (!username) {
    alert('Could not determine your username');
    return;
  }

  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  if (newPassword !== confirmPassword) {
    alert('New passwords do not match!');
    return;
  }
  
  if (newPassword.length < 8) {
    alert('Password must be at least 8 characters long');
    return;
  }
  
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(username)}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (response.ok) {
      alert('Password changed successfully!');
      closePasswordModal();
    } else {
      const errorData = await response.json();
      alert(`Failed to change password: ${errorData.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error changing password:', error);
    alert('An error occurred while changing your password. Please try again.');
  }
}

function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  input.type = input.type === 'password' ? 'text' : 'password';
}

// Close modals when clicking outside
window.onclick = function(event) {
  const deleteModal = document.getElementById('delete-modal');
  if (event.target === deleteModal) {
    hideDeleteModal();
  }
  
  const passwordModal = document.getElementById('password-modal');
  if (passwordModal && event.target === passwordModal) {
    closePasswordModal();
  }

  // Close search results when clicking outside
  if (!event.target.closest('.search-wrapper') && !event.target.closest('#search-results')) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    resultsContainer.classList.remove('show');
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  // Make sure buttons are properly bound
  document.getElementById('edit-buttons').innerHTML = `
    <button onclick="enableEditMode()" class="edit-btn">Edit Profile</button>
  `;
  
  // Add event listeners for account actions
  document.querySelector('.account-actions button:first-of-type').onclick = openPasswordModal;
  document.querySelector('.account-actions button:last-of-type').onclick = showDeleteModal;
  
  // Add input event listener to close search results when input is cleared
  const searchInput = document.getElementById('user-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      if (this.value.length < 2) {
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '';
        resultsContainer.classList.remove('show');
      }
    });
  }
});

// Make functions available globally
window.searchUsers = searchUsers;
window.viewUserProfile = viewUserProfile;
window.showDeleteModal = showDeleteModal;
window.hideDeleteModal = hideDeleteModal;
window.enableEditMode = enableEditMode;
window.cancelEditMode = cancelEditMode;
window.saveProfileChanges = saveProfileChanges;
window.confirmDeleteAccount = confirmDeleteAccount;
window.openPasswordModal = openPasswordModal;
window.closePasswordModal = closePasswordModal;
window.changePassword = changePassword;
window.togglePasswordVisibility = togglePasswordVisibility;