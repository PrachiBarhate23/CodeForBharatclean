// context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (email === 'admin@health.com' && password === 'admin123') {
        setUser({ id: 1, email, name: 'Admin User', isPremium: true });
        return { success: true };
      }
      return { success: false, message: 'Invalid credentials' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => setUser(null);

  const value = {
    user,
    isAuthenticated: !!user,
    isPremium: user?.isPremium || false,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};