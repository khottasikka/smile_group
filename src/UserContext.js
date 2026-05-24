import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data when app starts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user_data');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error("Failed to load user", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, []);

  // Login / Register / Profile Update
  const login = async (userData) => {
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
    } catch (e) {
      console.error("Failed to save user", e);
    }
  };

  // FIX: This is the missing function causing the "End Session" crash
  const updateBalance = async (newBalance) => {
    try {
      if (!user) return;
      const updatedUser = { ...user, balance: newBalance };
      
      // Save to phone memory
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      // Update the screen UI
      setUser(updatedUser);
    } catch (e) {
      console.error("Failed to update balance", e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user_data');
      setUser(null);
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      updateBalance // Now 'End Session' can find this!
    }}>
      {children}
    </UserContext.Provider>
  );
};