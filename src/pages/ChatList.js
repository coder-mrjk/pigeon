import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase-config';
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './ChatList.css';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import sashAILogo from '../assets/sash-ai-logo.png';

const ChatList = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [newChatEmail, setNewChatEmail] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);
  const [showSashAIPopup, setShowSashAIPopup] = useState(false); // State for the AI popup

  useEffect(() => {
    const q = query(
      collection(db, 'chats'),
      where('members', 'array-contains', auth.currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const chatsData = [];
      for (const chatDoc of querySnapshot.docs) {
        const chatData = chatDoc.data();
        let chatName = 'Unknown Chat';

        if (chatData.isGroupChat) {
          chatName = chatData.name;
        } else {
          const otherMemberUid = chatData.members.find(
            (uid) => uid !== auth.currentUser.uid
          );
          if (otherMemberUid) {
            const userDocRef = doc(db, 'users', otherMemberUid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              chatName = userDoc.data().displayName;
            }
          }
        }
        chatsData.push({ id: chatDoc.id, name: chatName, ...chatData });
      }
      setChats(chatsData);
    });
    return () => unsubscribe();
  }, []);

  const handleStartNewChat = async (e) => {
    e.preventDefault();
    if (newChatEmail.trim() === '') return;

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', newChatEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert('No user found with that email.');
      return;
    }

    const otherMember = querySnapshot.docs[0].id;
    const members = [auth.currentUser.uid, otherMember].sort();

    const existingChatQuery = query(
      collection(db, 'chats'),
      where('members', '==', members)
    );
    const existingChatSnapshot = await getDocs(existingChatQuery);

    if (!existingChatSnapshot.empty) {
      const existingChatId = existingChatSnapshot.docs[0].id;
      onSelectChat(existingChatId);
      return;
    }

    const chatRef = await addDoc(collection(db, 'chats'), {
      members: members,
      isGroupChat: false,
      createdAt: new Date(),
    });
    onSelectChat(chatRef.id);
    setNewChatEmail('');
    setShowNewChatForm(false);
  };
  
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (newGroupName.trim() === '') return;
    try {
      const chatRef = await addDoc(collection(db, 'chats'), {
        name: newGroupName,
        members: [auth.currentUser.uid],
        isGroupChat: true,
        createdAt: new Date(),
        creator: auth.currentUser.uid,
      });
      onSelectChat(chatRef.id);
      setNewGroupName('');
      setShowCreateGroupForm(false);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <div className="chatlist-container">
      <div className="chatlist-header">
        <h1 className="chatlist-heading">My Chats</h1>
        <div className="chatlist-button-group">
          <button
            onClick={() => {
              setShowNewChatForm(!showNewChatForm);
              setShowCreateGroupForm(false);
            }}
            className="chatlist-button"
          >
            Start New Chat
          </button>
          <button
            onClick={() => {
              setShowCreateGroupForm(!showCreateGroupForm);
              setShowNewChatForm(false);
            }}
            className="chatlist-button"
          >
            Create Group
          </button>
          <button
            onClick={() => setShowSashAIPopup(true)} // Changed to show the popup
            className="chatlist-button chatlist-ai-chat-button"
          >
            Start AI Chat
          </button>
          <button
            onClick={handleLogout}
            className="chatlist-button chatlist-logout-button"
          >
            Log Out
          </button>
        </div>
      </div>

      {(showNewChatForm || showCreateGroupForm) && (
        <div className="chatlist-form-overlay">
          <div className="chatlist-form-container">
            {showNewChatForm && (
              <form onSubmit={handleStartNewChat} className="chatlist-form">
                <h3>Start a New Chat</h3>
                <input
                  type="email"
                  value={newChatEmail}
                  onChange={(e) => setNewChatEmail(e.target.value)}
                  placeholder="Enter user email"
                  required
                  className="chatlist-input"
                />
                <button type="submit" className="chatlist-form-button">
                  Start Chat
                </button>
              </form>
            )}
            {showCreateGroupForm && (
              <form onSubmit={handleCreateGroup} className="chatlist-form">
                <h3>Create a New Group</h3>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  required
                  className="chatlist-input"
                />
                <button type="submit" className="chatlist-form-button">
                  Create Group
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="chatlist-content">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="chat-card"
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="chat-avatar">{chat.name.charAt(0).toUpperCase()}</div>
            <div className="chat-info">
              <div className="chat-title">{chat.name}</div>
            </div>
          </div>
        ))}
      </div>

      {/* SASH AI Assistant Icon */}
      <div className="sash-ai-icon" onClick={() => setShowSashAIPopup(true)}>
        <img src={sashAILogo} alt="SASH AI" />
      </div>

      {/* SASH AI Popup */}
      {showSashAIPopup && (
        <div className="sash-ai-popup-overlay">
          <div className="sash-ai-popup-content">
            <div className="sash-ai-popup-header">
              <h3>SASH AI</h3>
              <button className="sash-ai-close-button" onClick={() => setShowSashAIPopup(false)}>
                &times;
              </button>
            </div>
            <div className="sash-ai-popup-body">
              <p>SASH AI is in training! <br />
              Stay tuned for updates!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;