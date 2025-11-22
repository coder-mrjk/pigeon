// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOPfMKbNZcRqHbxwW55Rx6Ee6iJydSlWY",
  authDomain: "pigeon-161212.firebaseapp.com",
  projectId: "pigeon-161212",
  storageBucket: "pigeon-161212.firebasestorage.app",
  messagingSenderId: "312022261590",
  appId: "1:312022261590:web:3dfd2f2cc519b6c11700f7",
  measurementId: "G-0TXLCST25B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Export the services you'll use in your app
export {
  auth,
  db
};