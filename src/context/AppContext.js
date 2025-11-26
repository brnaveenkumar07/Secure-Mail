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
      // Normalize user types for frontend compatibility
      const normalizedUsers = response.data.map((user) => ({
        ...user,
        type: user.type.toLowerCase(),
      }));
      setAllEntities(normalizedUsers);
      console.log("Fetched users:", normalizedUsers.length);
    } catch (err) {
      console.error("Error fetching users:", err);
      setAllEntities([]);
    }
  };

  const login = async (username, password, faceImage = null) => {
    try {
      setLoading(true);
      setError(null);

      // Create FormData if faceImage is present or just JSON if not?
      // Since backend now expects multipart/form-data for login route (due to upload.single),
      // we should use FormData even if no image is sent, or ensure backend handles JSON too.
      // But upload.single might expect multipart. Let's use FormData for consistency.

      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      if (faceImage) {
        // Convert base64 to blob
        const response = await fetch(faceImage);
        const blob = await response.blob();
        formData.append('image', blob, 'face.jpg');
      }

      const response = await authAPI.login(formData);

      // Check if face auth is required
      if (response.data.requireFaceAuth) {
        return { success: false, requireFaceAuth: true };
      }

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

      // Create FormData
      const formData = new FormData();
      formData.append('username', userData.username);
      formData.append('password', userData.password);
      formData.append('name', userData.name);
      formData.append('type', userData.type.toUpperCase()); // API expects uppercase

      if (userData.signature) {
        formData.append('signature', userData.signature);
      }

      if (userData.faceImage) {
        // Convert base64 to blob
        const response = await fetch(userData.faceImage);
        const blob = await response.blob();
        formData.append('image', blob, 'face.jpg');
      }

      const response = await authAPI.register(formData);

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

      // Create FormData
      const formData = new FormData();
      formData.append('receiverId', messageData.to.id);
      formData.append('subject', messageData.subject);
      formData.append('message', messageData.message);
      formData.append('isDigitallyVerified', messageData.isDigitallyVerified || false);
      // isFaceVerified is determined by backend based on verification result

      if (messageData.faceImage) {
        // Convert base64 to blob
        const response = await fetch(messageData.faceImage);
        const blob = await response.blob();
        formData.append('image', blob, 'face.jpg');
      }

      const response = await messageAPI.sendMessage(formData);
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

