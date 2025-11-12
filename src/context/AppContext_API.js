import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI, messageAPI } from "../services/api";

const AppContext = createContext();

const STORAGE_KEYS = {
  CURRENT_USER: "secureMessaging_currentUser",
  TOKEN: "secureMessaging_token",
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  });

  const [messages, setMessages] = useState([]);
  const [allEntities, setAllEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load current user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    
    if (token && user) {
      console.log("Restored session:", JSON.parse(user).name);
    }
  }, []);

  // Fetch all users when currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetchAllUsers();
    }
  }, [currentUser]);

  const fetchAllUsers = async () => {
    try {
      const response = await authAPI.getAllUsers();
      setAllEntities(response.data);
      console.log("Fetched users:", response.data.length);
    } catch (err) {
      console.error("Error fetching users:", err);
      setAllEntities([]);
    }
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      // Convert type format for API
      const response = await authAPI.login({ username, password });
      
      const { user, token } = response.data;

      // Normalize user type for frontend
      const normalizedUser = {
        ...user,
        type: user.type.toLowerCase(), // API returns "INDIVIDUAL", frontend uses "individual"
      };

      // Store user and token
      setCurrentUser(normalizedUser);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(normalizedUser));
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);

      console.log("Login successful:", normalizedUser.name);
      return { success: true, user: normalizedUser };
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Login failed";
      console.error("Login error:", errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Convert type format for API
      const apiData = {
        ...userData,
        type: userData.type.toUpperCase(), // Frontend uses "individual", API expects "INDIVIDUAL"
      };

      const response = await authAPI.register(apiData);
      
      const { user, token } = response.data;

      // Normalize user type for frontend
      const normalizedUser = {
        ...user,
        type: user.type.toLowerCase(),
      };

      // Store user and token
      setCurrentUser(normalizedUser);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(normalizedUser));
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);

      console.log("Registration successful:", normalizedUser.name);
      return { success: true, user: normalizedUser };
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Registration failed";
      console.error("Registration error:", errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log("Logout:", currentUser?.name);
    setCurrentUser(null);
    setMessages([]);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  };

  const sendMessage = async (messageData) => {
    try {
      setLoading(true);
      
      // Prepare data for API
      const apiData = {
        receiverId: messageData.to.id,
        subject: messageData.subject,
        message: messageData.message,
        isFaceVerified: messageData.isFaceVerified || false,
        isDigitallyVerified: messageData.isDigitallyVerified || false,
      };

      const response = await messageAPI.sendMessage(apiData);
      const newMessage = response.data.data;

      console.log("Message sent:", newMessage.subject);
      
      // Add to local state
      setMessages((prev) => [newMessage, ...prev]);
      
      return newMessage;
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to send message";
      console.error("Send message error:", errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getInboxMessages = async () => {
    try {
      const response = await messageAPI.getInbox();
      const messages = response.data;
      
      // Sort by timestamp
      const sortedMessages = messages.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      console.log("Fetched inbox messages:", sortedMessages.length);
      return sortedMessages;
    } catch (err) {
      console.error("Get inbox error:", err);
      return [];
    }
  };

  const getSentMessages = async () => {
    try {
      const response = await messageAPI.getSent();
      const messages = response.data;
      
      // Sort by timestamp
      const sortedMessages = messages.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      console.log("Fetched sent messages:", sortedMessages.length);
      return sortedMessages;
    } catch (err) {
      console.error("Get sent error:", err);
      return [];
    }
  };

  const getAllRecipients = () => {
    return allEntities.filter(
      (entity) => !currentUser || entity.id !== currentUser.id
    );
  };

  const clearAllData = () => {
    console.log("Clear all data");
    logout();
    window.location.href = "/";
  };

  const getStorageInfo = () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return {
      isLoggedIn: !!currentUser && !!token,
      user: currentUser,
      messagesCount: messages.length,
      usersCount: allEntities.length,
      organizationsCount: allEntities.filter((e) => e.type === "ORGANIZATION").length,
    };
  };

  const value = {
    currentUser,
    allMessages: messages,
    allEntities,
    loading,
    error,
    login,
    register,
    logout,
    sendMessage,
    getInboxMessages,
    getSentMessages,
    getAllRecipients,
    clearAllData,
    getStorageInfo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};


