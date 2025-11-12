import React, { createContext, useState, useContext, useEffect } from "react";

const AppContext = createContext();

const STORAGE_KEYS = {
  CURRENT_USER: "secureMessaging_currentUser",
  MESSAGES: "secureMessaging_messages",
  USERS: "secureMessaging_users",
  ORGANIZATIONS: "secureMessaging_organizations",
  SESSION_TIMESTAMP: "secureMessaging_sessionTimestamp",
  INITIALIZED: "secureMessaging_initialized",
};

const SEED_USERS = [
  {
    id: 1,
    name: "John Doe",
    username: "john_doe",
    password: "1234",
    type: "individual",
  },
  {
    id: 2,
    name: "Jane Smith",
    username: "jane_smith",
    password: "5678",
    type: "individual",
  },
  {
    id: 3,
    name: "Alice Johnson",
    username: "alice_j",
    password: "pass123",
    type: "individual",
  },
];

const SEED_ORGANIZATIONS = [
  {
    id: 101,
    name: "TechCorp",
    username: "techcorp",
    password: "abcd",
    type: "organization",
    signature: "signed_by_TechCorp_RSA",
  },
  {
    id: 102,
    name: "HealthPlus",
    username: "healthplus",
    password: "xyz789",
    type: "organization",
    signature: "signed_by_HealthPlus_RSA",
  },
  {
    id: 103,
    name: "FinanceHub",
    username: "financehub",
    password: "fin2024",
    type: "organization",
    signature: "signed_by_FinanceHub_RSA",
  },
];

const SEED_MESSAGES = [
  {
    id: 1,
    from: { id: 2, name: "Jane Smith", type: "individual" },
    to: { id: 1, name: "John Doe" },
    subject: "Welcome!",
    message: "Hi John! Welcome to the secure messaging platform.",
    isFaceVerified: true,
    timestamp: new Date("2025-10-27T10:30:00").toISOString(),
  },
  {
    id: 2,
    from: {
      id: 101,
      name: "TechCorp",
      type: "organization",
      signature: "signed_by_TechCorp_RSA",
    },
    to: { id: 1, name: "John Doe" },
    subject: "Security Update",
    message: "Dear user, we have updated our security protocols.",
    isDigitallyVerified: true,
    timestamp: new Date("2025-10-27T14:15:00").toISOString(),
  },
  {
    id: 3,
    from: { id: 3, name: "Alice Johnson", type: "individual" },
    to: { id: 2, name: "Jane Smith" },
    subject: "Meeting Request",
    message: "Can we schedule a meeting for tomorrow?",
    isFaceVerified: true,
    timestamp: new Date("2025-10-28T09:00:00").toISOString(),
  },
];

const getFromStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return defaultValue;
  }
};

const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
  }
};

const initializeAppData = () => {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!isInitialized) {
    console.log("First time initialization...");
    setToStorage(STORAGE_KEYS.USERS, SEED_USERS);
    setToStorage(STORAGE_KEYS.ORGANIZATIONS, SEED_ORGANIZATIONS);
    setToStorage(STORAGE_KEYS.MESSAGES, SEED_MESSAGES);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");
    console.log("Seed data initialized!");
  } else {
    console.log("Loading from localStorage...");
  }
};

export const AppProvider = ({ children }) => {
  useEffect(() => {
    initializeAppData();
  }, []);

  const [currentUser, setCurrentUser] = useState(() =>
    getFromStorage(STORAGE_KEYS.CURRENT_USER, null)
  );

  const [messages, setMessages] = useState(() =>
    getFromStorage(STORAGE_KEYS.MESSAGES, SEED_MESSAGES)
  );

  const [users] = useState(() =>
    getFromStorage(STORAGE_KEYS.USERS, SEED_USERS)
  );

  const [organizations] = useState(() =>
    getFromStorage(STORAGE_KEYS.ORGANIZATIONS, SEED_ORGANIZATIONS)
  );

  const allEntities = [...users, ...organizations];

  useEffect(() => {
    if (messages.length >= 0) {
      setToStorage(STORAGE_KEYS.MESSAGES, messages);
      console.log("Messages persisted:", messages.length);
    }
  }, [messages]);

  useEffect(() => {
    if (currentUser) {
      setToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
      setToStorage(STORAGE_KEYS.SESSION_TIMESTAMP, Date.now());
      console.log("Session saved:", currentUser.name);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.SESSION_TIMESTAMP);
    }
  }, [currentUser]);

  useEffect(() => {
    console.log("State:", {
      user: currentUser?.name || "Not logged in",
      messages: messages.length,
    });
  }, [currentUser, messages, users, organizations]);

  const login = (username, password) => {
    const user = allEntities.find(
      (entity) => entity.username === username && entity.password === password
    );
    if (user) {
      setCurrentUser(user);
      console.log("Login:", user.name);
      return { success: true };
    }
    console.log("Login failed");
    return { success: false, error: "Invalid credentials" };
  };

  const logout = () => {
    console.log("Logout:", currentUser?.name);
    setCurrentUser(null);
  };

  const sendMessage = (messageData) => {
    const newMessage = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      ...messageData,
      timestamp: new Date().toISOString(),
    };
    console.log("Sending:", newMessage.subject);
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const getInboxMessages = (userId) => {
    const userMessages = messages
      .filter((msg) => msg.to.id === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    console.log(`Inbox (${userId}):`, userMessages.length);
    return userMessages;
  };

  const getSentMessages = (userId) => {
    const sentMessages = messages
      .filter((msg) => msg.from.id === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    console.log(`Sent (${userId}):`, sentMessages.length);
    return sentMessages;
  };

  const getAllRecipients = () => {
    return allEntities.filter(
      (entity) => !currentUser || entity.id !== currentUser.id
    );
  };

  const clearAllData = () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    setCurrentUser(null);
    setMessages([]);
    console.log("All data cleared");
    window.location.reload();
  };

  const resetToSeedData = () => {
    setToStorage(STORAGE_KEYS.MESSAGES, SEED_MESSAGES);
    setMessages(SEED_MESSAGES);
    setCurrentUser(null);
    console.log("Reset to seed data");
    window.location.reload();
  };

  const getStorageInfo = () => {
    const sessionTimestamp = localStorage.getItem(
      STORAGE_KEYS.SESSION_TIMESTAMP
    );
    return {
      isLoggedIn: !!currentUser,
      user: currentUser,
      sessionStart: sessionTimestamp
        ? new Date(parseInt(sessionTimestamp))
        : null,
      messagesCount: messages.length,
      usersCount: users.length,
      organizationsCount: organizations.length,
    };
  };

  const value = {
    currentUser,
    allMessages: messages,
    allEntities,
    login,
    logout,
    sendMessage,
    getInboxMessages,
    getSentMessages,
    getAllRecipients,
    clearAllData,
    resetToSeedData,
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
