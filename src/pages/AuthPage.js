import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase-config';
import AuthForm from '../components/AuthForm';
import ChatPage from './ChatPage';
import ProfileSetup from './ProfileSetup';
import ChatList from './ChatList';
import '../components/Auth.css';

const AuthPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        setProfileExists(userDoc.exists());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleProfileComplete = () => {
    setProfileExists(true);
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
  };

  const handleBack = () => {
    setCurrentChatId(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    if (!profileExists) {
      return (
        <div className="app-container">
          <div className="app-glass-container">
            <ProfileSetup onProfileComplete={handleProfileComplete} />
          </div>
        </div>
      );
    }

    if (currentChatId) {
      return (
        <div className="app-container">
          <div className="app-glass-container">
            <ChatPage chatId={currentChatId} onBack={handleBack} />
          </div>
        </div>
      );
    }

    return (
      <div className="app-container">
        <div className="app-glass-container">
          <ChatList onSelectChat={handleSelectChat} />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <AuthForm />
    </div>
  );
};

export default AuthPage;