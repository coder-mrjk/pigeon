import React, { useState } from 'react';
import { auth } from '../firebase/firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import './Auth.css';

const AuthForm = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onAuthSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <h1 className="auth-heading">PIGEON</h1>
        <p className="auth-subheading">A premium chat application</p>
        <form onSubmit={handleEmailAuth} className="auth-form">
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          {error && <p className="auth-error">{error}</p>}
          <div className="auth-input-container">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="auth-input"
            />
          </div>
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="auth-input"
            />
            <button
              type="button"
              className="show-password-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <button type="submit" className="auth-button">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
          <p>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span className="auth-toggle" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
          <hr className="auth-divider" />
          <p className="auth-divider-text">or</p>
        </form>
        <button onClick={handleGoogleAuth} className="google-auth-button">
          <img src="/google-logo.svg" alt="Google logo" className="google-logo" />
          Sign In with Google
        </button>
      </div>
      <p className="password-reset-note">
        For password reset, please mail to: tonightgamermrjk@gmail.com
      </p>
    </div>
  );
};

export default AuthForm;