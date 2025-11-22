import React, { useState, useEffect, useRef, useCallback } from 'react';
import { auth, db } from '../firebase/firebase-config';
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc, updateDoc, arrayUnion, where, getDocs, deleteDoc, serverTimestamp, limit, startAfter } from 'firebase/firestore';
import ProfilePopup from '../components/ProfilePopup';
import './Chat.css';

const ChatPage = ({ chatId, onBack }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [usersData, setUsersData] = useState({});
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [chatHeader, setChatHeader] = useState('');
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentView, setCurrentView] = useState('chat');
  const messagesEndRef = useRef(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [otherUserId, setOtherUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUsersForMessages = useCallback(async (msgs) => {
    const uids = new Set(msgs.map(msg => msg.uid));
    const newUsersData = { ...usersData };
    const profilePromises = [];
    for (const uid of uids) {
      if (!newUsersData[uid]) {
        const userDocRef = doc(db, 'users', uid);
        profilePromises.push(getDoc(userDocRef));
      }
    }
    const profiles = await Promise.all(profilePromises);
    profiles.forEach(userDoc => {
      if (userDoc.exists()) {
        newUsersData[userDoc.id] = userDoc.data();
      }
    });
    setUsersData(newUsersData);
  }, [usersData]);

  const loadInitialMessages = useCallback(async () => {
    setLoading(true);
    const messagesCollectionRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesCollectionRef, orderBy('createdAt', 'desc'), limit(20));
    const querySnapshot = await getDocs(q);
    const initialMessages = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).reverse();
    setMessages(initialMessages);
    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setHasMoreMessages(querySnapshot.docs.length === 20);
    await fetchUsersForMessages(initialMessages);
    setLoading(false);
  }, [chatId, fetchUsersForMessages]);

  const loadMoreMessages = async () => {
    if (!hasMoreMessages) return;
    setLoading(true);
    const messagesCollectionRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesCollectionRef, orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(20));
    const querySnapshot = await getDocs(q);
    const newMessages = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setMessages(prevMessages => [...newMessages.reverse(), ...prevMessages]);
    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setHasMoreMessages(newMessages.length === 20);
    await fetchUsersForMessages(newMessages);
    setLoading(false);
  };

  const fetchGroupMembers = async (memberIds) => {
    const membersData = [];
    for (const memberId of memberIds) {
      const userDocRef = doc(db, 'users', memberId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        membersData.push({ id: userDoc.id, ...userDoc.data() });
      }
    }
    setGroupMembers(membersData);
  };

  useEffect(() => {
    const fetchChatDetails = async () => {
      const chatDocRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatDocRef);
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        setIsGroupChat(chatData.isGroupChat);
        if (chatData.isGroupChat) {
          setChatHeader(chatData.name);
          fetchGroupMembers(chatData.members);
        } else {
          const otherMemberUid = chatData.members.find(uid => uid !== auth.currentUser.uid);
          setOtherUserId(otherMemberUid);
          if (otherMemberUid) {
            const userDocRef = doc(db, 'users', otherMemberUid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setChatHeader(userData.displayName);
              setUsersData(prevUsersData => ({
                ...prevUsersData,
                [otherMemberUid]: userData
              }));
            } else {
              setChatHeader('Unknown User');
            }
          }
        }
      }
    };
    fetchChatDetails();

    if (currentView === 'chat') {
      loadInitialMessages();
      const qNewMessages = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
      const unsubscribe = onSnapshot(qNewMessages, (querySnapshot) => {
        const newMessages = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setMessages(newMessages);
        fetchUsersForMessages(newMessages);
      });
      return () => unsubscribe();
    }
  }, [chatId, currentView, loadInitialMessages, fetchUsersForMessages]);

  useEffect(() => {
    if (currentView === 'chat') {
      scrollToBottom();
    }
  }, [messages, currentView]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        if (showProfilePopup) {
          setShowProfilePopup(false);
        } else if (showAddMemberForm) {
          setShowAddMemberForm(false);
        } else if (currentView === 'members') {
          setCurrentView('chat');
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [showProfilePopup, showAddMemberForm, currentView]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() === '') return;
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: message,
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        createdAt: serverTimestamp(),
        type: 'text'
      });
      setMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const showProfile = async (uid) => {
    if (uid) {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSelectedUser(userData);
        setShowProfilePopup(true);
      }
    }
  };

  const hideProfile = () => {
    setShowProfilePopup(false);
    setSelectedUser(null);
  };

  const addMemberToGroup = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', newMemberEmail));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        alert("No user found with that email.");
        return;
      }
      const newMemberUid = querySnapshot.docs[0].id;
      const chatDocRef = doc(db, 'chats', chatId);
      await updateDoc(chatDocRef, {
        members: arrayUnion(newMemberUid)
      });
      setNewMemberEmail('');
      setShowAddMemberForm(false);
      alert("Member added successfully!");
    } catch (error) {
      console.error("Error adding new member:", error);
      alert("Failed to add member. Please try again.");
    }
  };

  const handleEditClick = (message) => {
    setEditingMessage(message);
    setEditedText(message.text);
  };

  const handleSaveEdit = async () => {
    if (editedText.trim() === '') return;
    try {
      const msgDocRef = doc(db, 'chats', chatId, 'messages', editingMessage.id);
      await updateDoc(msgDocRef, {
        text: editedText,
        editedAt: serverTimestamp()
      });
      setEditingMessage(null);
      setEditedText('');
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  const handleDeleteClick = async (messageId) => {
    try {
      const msgDocRef = doc(db, 'chats', chatId, 'messages', messageId);
      await deleteDoc(msgDocRef);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <div className="chat-page-container">
      <div className="chat-header-container">
        <button onClick={onBack} className="chat-back-button">Back to Chats</button>
        <h2 className="chat-header-title">{chatHeader}</h2>
        {isGroupChat ? (
          <div className="chat-tabs">
            <button
              onClick={() => setCurrentView('chat')}
              className={`chat-tab-button ${currentView === 'chat' ? 'active' : ''}`}
            >
              Chat
            </button>
            <button
              onClick={() => setCurrentView('members')}
              className={`chat-tab-button ${currentView === 'members' ? 'active' : ''}`}
            >
              Members
            </button>
            <button onClick={() => setShowAddMemberForm(true)} className="chat-add-member-button">
              Add Member
            </button>
          </div>
        ) : (
          <button
            onClick={() => showProfile(otherUserId)}
            className="chat-about-me-button"
          >
            About Me
          </button>
        )}
      </div>

      {currentView === 'chat' ? (
        <>
          <div className="chat-messages-list">
            {hasMoreMessages && (
              <button onClick={loadMoreMessages} className="load-more-button" disabled={loading}>
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
            {messages.map((msg) => {
              const isCurrentUser = msg.uid === auth.currentUser.uid;
              const senderProfile = usersData[msg.uid];
              return (
                <div key={msg.id} className={`message ${isCurrentUser ? 'sent' : 'received'}`}>
                  <div className="message-bubble">
                    <span className="sender-name" onClick={() => showProfile(msg.uid)}>
                      {senderProfile ? senderProfile.displayName : msg.email}
                    </span>
                    {msg.type === 'text' ? (
                      <p>{msg.text}</p>
                    ) : (
                      <img src={msg.content} alt="sent GIF" className="message-image" />
                    )}
                    {isCurrentUser && (
                      <div className="message-actions">
                        <button className="action-button" onClick={() => handleEditClick(msg)}>Edit</button>
                        <button className="action-button" onClick={() => handleDeleteClick(msg.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {editingMessage ? (
            <form onSubmit={handleSaveEdit} className="message-input-form">
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                placeholder="Edit your message..."
                required
                className="message-input"
              />
              <button type="submit" className="message-send-button">Save</button>
            </form>
          ) : (
            <form onSubmit={sendMessage} className="message-input-form">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="message-input"
              />
              <button type="submit" className="message-send-button">Send</button>
            </form>
          )}
        </>
      ) : (
        <div className="members-list">
          <h3>Group Members</h3>
          <ul>
            {groupMembers.map(member => (
              <li key={member.id} onClick={() => showProfile(member.id)}>
                {member.displayName}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showAddMemberForm && (
        <div className="popup-overlay">
          <form onSubmit={addMemberToGroup} className="popup-content">
            <h3>Add Member to Group</h3>
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="Enter member's email"
              required
              className="add-member-input"
            />
            <div className="popup-buttons">
              <button type="submit" className="add-member-button">Add</button>
              <button type="button" onClick={() => setShowAddMemberForm(false)} className="cancel-button">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showProfilePopup && selectedUser && (
        <ProfilePopup profile={selectedUser} onClose={hideProfile} />
      )}
    </div>
  );
};

export default ChatPage;