import React, { createContext, useContext, useState, useEffect } from 'react';

const OnboardingAuthContext = createContext(null);

export const OnboardingAuthProvider = ({ children }) => {
  const [onboardUser, setOnboardUser] = useState(null);
  const [isOnboardAuthenticated, setIsOnboardAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('onboard_token');
    const userStr = localStorage.getItem('onboard_user');
    if (token && userStr) {
      try {
        setOnboardUser(JSON.parse(userStr));
        setIsOnboardAuthenticated(true);
      } catch {
        localStorage.removeItem('onboard_token');
        localStorage.removeItem('onboard_user');
      }
    }
    setLoading(false);
  }, []);

  const onboardLogin = (token, userData) => {
    localStorage.setItem('onboard_token', token);
    localStorage.setItem('onboard_user', JSON.stringify(userData));
    setOnboardUser(userData);
    setIsOnboardAuthenticated(true);
  };

  const onboardLogout = () => {
    localStorage.removeItem('onboard_token');
    localStorage.removeItem('onboard_user');
    setOnboardUser(null);
    setIsOnboardAuthenticated(false);
  };

  return (
    <OnboardingAuthContext.Provider value={{ onboardUser, isOnboardAuthenticated, loading, onboardLogin, onboardLogout }}>
      {children}
    </OnboardingAuthContext.Provider>
  );
};

export const useOnboardingAuth = () => {
  const ctx = useContext(OnboardingAuthContext);
  if (!ctx) throw new Error('useOnboardingAuth must be used within OnboardingAuthProvider');
  return ctx;
};
