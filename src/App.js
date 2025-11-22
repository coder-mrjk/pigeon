import React, { useState, useEffect } from 'react';
import './App.css';
import AuthPage from './pages/AuthPage';
import IntroMessage from './components/IntroMessage';

function App() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    // Check local storage on initial load
    const introDismissed = localStorage.getItem('introDismissed');
    if (!introDismissed) {
      setShowIntro(true);
    }
  }, []);

  const handleDismissIntro = () => {
    setShowIntro(false);
  };

  return (
    <div className="App">
      {showIntro && <IntroMessage onDismiss={handleDismissIntro} />}
      <AuthPage />
    </div>
  );
}

export default App;