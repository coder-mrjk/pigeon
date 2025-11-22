import React, { useState } from 'react';
import { auth, db } from '../firebase/firebase-config';
import { doc, setDoc } from 'firebase/firestore';
import './ProfileSetup.css';

const ProfileSetup = ({ onProfileComplete }) => {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!displayName || bio.length > 50) {
      alert("Please enter a display name and ensure your bio is under 50 words.");
      return;
    }

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, {
        displayName: displayName,
        bio: bio,
        email: auth.currentUser.email,
        uid: auth.currentUser.uid,
      });
      onProfileComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return (
    <div className="profile-setup-container">
      <h1 className="profile-setup-heading">Complete Your Profile</h1>
      <form onSubmit={handleProfileSubmit} className="profile-setup-form">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your display name"
          required
          className="profile-setup-input"
        />
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Enter a short bio (under 50 words)"
          maxLength="50"
          className="profile-setup-textarea"
        />
        <button type="submit" className="profile-setup-button">Save Profile</button>
      </form>
    </div>
  );
};

export default ProfileSetup;