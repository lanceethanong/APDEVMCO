import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [profileData, setProfileData] = useState({
    name: "Juan Dela Cruz",
    email: "juan.delacruz@dlsu.edu.ph",
    role: "Student",
    idNumber: "12345678",
    contactNumber: "09123456789",
    isAnonymous: false,
    description: "Computer Science student specializing in AI"
  });

  // Sample reservation data
  useEffect(() => {
    setReservations([
      {
        id: 1,
        lab: "Lab 1 (CCPROG3)",
        seat: "A12",
        date: "2025-06-20",
        time: "10:00-12:30",
        isAnonymous: false
      },
      {
        id: 2,
        lab: "Lab 3 (STCHUIX)",
        seat: "B05",
        date: "2025-06-22",
        time: "14:00-16:00",
        isAnonymous: true
      }
    ]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.oldPassword) {
      errors.oldPassword = "Current password is required";
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (validatePasswordForm()) {
      // Would include API call to change password in Phase 2
      alert("Password changed successfully!");
      setShowChangePassword(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    }
  };

  const handleSave = () => {
    setEditMode(false);
    alert("Profile updated successfully!");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This will cancel all your reservations.")) {
      alert("Account deleted successfully!");
      window.location.href = "/login";
    }
  };

  const cancelReservation = (reservationId) => {
    if (window.confirm("Are you sure you want to cancel this reservation?")) {
      setReservations(reservations.filter(r => r.id !== reservationId));
      alert("Reservation cancelled!");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Change Password</h2>
              <button 
                onClick={() => setShowChangePassword(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  className={`w-full p-2 border rounded ${passwordErrors.oldPassword ? 'border-red-500' : ''}`}
                />
                {passwordErrors.oldPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.oldPassword}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`w-full p-2 border rounded ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                />
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`w-full p-2 border rounded ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Content */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">User Profile</h1>
        {editMode ? (
          <div className="space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-green-600">
              <img
                src="./profile.png"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {editMode && (
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Change Photo
              </button>
            )}
            
            <div className="text-center">
              <h2 className="text-2xl font-bold">{profileData.name}</h2>
              <p className="text-gray-600">{profileData.role}</p>
              <p className="text-gray-500 text-sm mt-2">{profileData.idNumber}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">DLSU Email</label>
              <p className="p-2 bg-gray-100 rounded">{profileData.email}</p>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Contact Number</label>
              {editMode ? (
                <input
                  type="tel"
                  name="contactNumber"
                  value={profileData.contactNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="p-2 bg-gray-100 rounded">{profileData.contactNumber}</p>
              )}
            </div>

            {editMode && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isAnonymous"
                  id="isAnonymous"
                  checked={profileData.isAnonymous}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="isAnonymous" className="text-gray-700">
                  Make reservations anonymous by default
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Details and Reservations */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">About</h2>
            {editMode ? (
              <textarea
                name="description"
                value={profileData.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded h-32"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-700">{profileData.description || "No description provided."}</p>
            )}
          </div>

          {/* Reservations Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">My Reservations</h2>
              <Link to="/reservations" className="text-blue-600 hover:text-blue-800">
                View All
              </Link>
            </div>

            {reservations.length > 0 ? (
              <div className="space-y-4">
                {reservations.slice(0, 3).map(reservation => (
                  <div key={reservation.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{reservation.lab} - Seat {reservation.seat}</h3>
                        <p className="text-gray-600">{reservation.date} | {reservation.time}</p>
                        {reservation.isAnonymous && (
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">Anonymous</span>
                        )}
                      </div>
                      <button
                        onClick={() => cancelReservation(reservation.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">You have no upcoming reservations.</p>
            )}
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Account Actions</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-yellow-800">Change Password</h3>
              <p className="text-sm text-yellow-700">Update your account password</p>
            </div>
            <button 
              onClick={() => setShowChangePassword(true)}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Change Password
            </button>
          </div>

          <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-red-800">Delete Account</h3>
              <p className="text-sm text-red-700">
                Permanently delete your account and cancel all reservations
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}