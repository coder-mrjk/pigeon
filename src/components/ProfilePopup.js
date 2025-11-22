import React from 'react';
import './ProfilePopup.css';

const ProfilePopup = ({ profile, onClose }) => {
  if (!profile) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  };

  return (
    <div className="profile-popup-overlay">
      <div className="profile-popup-content">
        <button onClick={onClose} className="profile-popup-close-button">×</button>
        <div className="profile-info">
          <h3>{profile.displayName || 'User'}</h3>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Bio:</strong> {profile.bio || 'No bio provided.'}</p>
          <p><strong>Joined:</strong> {formatDate(profile.createdAt)}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePopup;