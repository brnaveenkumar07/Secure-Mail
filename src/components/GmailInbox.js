import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const GmailInbox = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    getInboxMessages,
    getSentMessages,
    allMessages,
    logout,
  } = useApp();

  // State management
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("inbox"); // inbox, sent, starred, important
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [starredMessageIds, setStarredMessageIds] = useState(new Set());
  const [importantMessageIds, setImportantMessageIds] = useState(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load messages when currentUser or activeTab changes
  useEffect(() => {
    if (!currentUser) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const [inbox, sent] = await Promise.all([
          getInboxMessages(),
          getSentMessages(),
        ]);
        setReceivedMessages(inbox);
        setSentMessages(sent);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [currentUser, getInboxMessages, getSentMessages]);

  // Filter messages based on active tab
  const displayMessages = useMemo(() => {
    let msgs = [];
    switch (activeTab) {
      case "inbox":
        msgs = receivedMessages;
        break;
      case "sent":
        msgs = sentMessages;
        break;
      case "starred":
        msgs = [...receivedMessages, ...sentMessages].filter((m) =>
          starredMessageIds.has(m.id)
        );
        break;
      case "important":
        msgs = [...receivedMessages, ...sentMessages].filter((m) =>
          importantMessageIds.has(m.id)
        );
        break;
      default:
        msgs = receivedMessages;
    }

    // Apply search filter
    if (searchQuery) {
      return msgs.filter(
        (m) =>
          m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.from.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return msgs;
  }, [
    activeTab,
    receivedMessages,
    sentMessages,
    searchQuery,
    starredMessageIds,
    importantMessageIds,
  ]);

  // Handlers
  const toggleStar = (messageId) => {
    setStarredMessageIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const toggleImportant = (messageId) => {
    setImportantMessageIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Redirect if not logged in (after all hooks)
  if (!currentUser) {
    navigate("/");
    return null;
  }

  const toggleSelectMessage = (messageId) => {
    setSelectedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const selectAllMessages = () => {
    if (selectedMessages.size === displayMessages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(displayMessages.map((m) => m.id)));
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (hours < 168) {
      // Less than a week
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Gmail Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-64"
        } flex flex-col`}
      >
        {/* Logo & Menu Toggle */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <span className="text-xl font-normal text-gray-700">
                  SecureMail
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Compose Button */}
        <div className="px-4 py-2">
          <button
            onClick={() => navigate("/gmail-compose")}
            className={`flex items-center space-x-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 ${
              sidebarCollapsed ? "px-3 py-3" : "px-6 py-3 w-full"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {!sidebarCollapsed && <span className="font-medium">Compose</span>}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {[
            {
              id: "inbox",
              icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
              label: "Inbox",
              count: receivedMessages.length,
            },
            {
              id: "starred",
              icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
              label: "Starred",
              count: starredMessageIds.size,
            },
            {
              id: "sent",
              icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
              label: "Sent",
              count: sentMessages.length,
            },
            {
              id: "important",
              icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
              label: "Important",
              count: importantMessageIds.size,
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSelectedMessage(null);
                setSelectedMessages(new Set());
              }}
              className={`flex items-center space-x-3 w-full px-4 py-2 rounded-r-full transition-all ${
                activeTab === item.id
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={item.icon}
                />
              </svg>
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                  {item.count > 0 && (
                    <span className="text-xs font-semibold">{item.count}</span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          {!sidebarCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                {getInitials(currentUser.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.name}
                </div>
                <div className="text-xs text-gray-500">{currentUser.type}</div>
              </div>
              <button
                onClick={logout}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="Logout"
              >
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="p-2 hover:bg-gray-100 rounded-full transition w-full flex justify-center"
              title="Logout"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Search Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search mail"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Email List Toolbar */}
        {!selectedMessage && (
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={
                  selectedMessages.size === displayMessages.length &&
                  displayMessages.length > 0
                }
                onChange={selectAllMessages}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
            </label>

            {selectedMessages.size > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  {selectedMessages.size} selected
                </span>
                <button
                  className="p-2 hover:bg-gray-100 rounded transition"
                  title="Delete"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </>
            )}

            <div className="flex-1"></div>

            <span className="text-sm text-gray-600">
              {displayMessages.length} messages
            </span>
          </div>
        )}

        {/* Messages List or Message View */}
        <div className="flex-1 overflow-hidden flex">
          {!selectedMessage ? (
            // Messages List
            <div className="flex-1 overflow-y-auto bg-white">
              {displayMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg
                    className="w-24 h-24 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-lg font-medium">
                    No messages in {activeTab}
                  </p>
                  <p className="text-sm">
                    Messages you receive will appear here
                  </p>
                </div>
              ) : (
                displayMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-center px-4 py-3 border-b border-gray-100 hover:shadow-md transition-all cursor-pointer ${
                      selectedMessages.has(message.id)
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    {/* Checkbox */}
                    <label
                      className="flex items-center mr-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMessages.has(message.id)}
                        onChange={() => toggleSelectMessage(message.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </label>

                    {/* Star */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(message.id);
                      }}
                      className="mr-3"
                    >
                      {starredMessageIds.has(message.id) ? (
                        <svg
                          className="w-5 h-5 text-yellow-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-400 hover:text-yellow-400 transition"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      )}
                    </button>

                    {/* Important */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleImportant(message.id);
                      }}
                      className="mr-4"
                    >
                      {importantMessageIds.has(message.id) ? (
                        <svg
                          className="w-5 h-5 text-yellow-500 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 19V5z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-400 hover:text-yellow-500 transition"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      )}
                    </button>

                    {/* Sender Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm mr-4">
                      {getInitials(message.from.name)}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 truncate">
                          {activeTab === "sent"
                            ? `To: ${message.to.name}`
                            : message.from.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-4">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-900 truncate font-medium">
                        {message.subject}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {message.message}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center space-x-2 ml-4">
                      {message.isFaceVerified && (
                        <span
                          className="text-green-600 text-xl"
                          title="Face Verified"
                        >
                          ✓
                        </span>
                      )}
                      {message.isDigitallyVerified && (
                        <span
                          className="text-blue-600 text-xl"
                          title="Digitally Signed"
                        >
                          🔒
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Message Detail View
            <div className="flex-1 overflow-y-auto bg-white">
              {/* Message Header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleStar(selectedMessage.id)}
                      className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                      {starredMessageIds.has(selectedMessage.id) ? (
                        <svg
                          className="w-5 h-5 text-yellow-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      )}
                    </button>

                    <button
                      className="p-2 hover:bg-gray-100 rounded-full transition"
                      title="Reply"
                    >
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                        />
                      </svg>
                    </button>

                    <button
                      className="p-2 hover:bg-gray-100 rounded-full transition"
                      title="Delete"
                    >
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <h1 className="text-2xl font-medium text-gray-900 mb-4">
                  {selectedMessage.subject}
                </h1>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {getInitials(selectedMessage.from.name)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {selectedMessage.from.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          to {selectedMessage.to.name}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(selectedMessage.timestamp).toLocaleString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}
                      </div>
                    </div>

                    {/* Verification Badges */}
                    <div className="flex items-center space-x-3 mt-2">
                      {selectedMessage.isFaceVerified && (
                        <div className="flex items-center space-x-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Face Verified</span>
                        </div>
                      )}
                      {selectedMessage.isDigitallyVerified && (
                        <div className="flex items-center space-x-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Digitally Signed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="px-6 py-8">
                <div className="prose max-w-none">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">
                    {selectedMessage.message}
                  </p>
                </div>

                {/* Digital Signature */}
                {selectedMessage.from.signature && (
                  <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-xs font-semibold text-gray-600 mb-2">
                      DIGITAL SIGNATURE
                    </div>
                    <div className="text-xs text-gray-800 font-mono break-all bg-white p-3 rounded border border-gray-200">
                      {selectedMessage.from.signature}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GmailInbox;
