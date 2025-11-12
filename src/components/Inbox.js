import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const Inbox = () => {
  const navigate = useNavigate();
  const { currentUser, getInboxMessages, getSentMessages, allMessages } =
    useApp();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [activeTab, setActiveTab] = useState("received"); // "received" or "sent"
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load messages
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

  if (!currentUser) {
    navigate("/");
    return null;
  }

  const messages = activeTab === "received" ? receivedMessages : sentMessages;

  // Debug logging
  console.log("🔍 Inbox Debug:", {
    currentUserId: currentUser.id,
    currentUserName: currentUser.name,
    receivedMessagesCount: receivedMessages.length,
    sentMessagesCount: sentMessages.length,
    totalMessagesInSystem: allMessages?.length || 0,
  });

  const formatDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = Math.floor((now - messageDate) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          messageDate.getFullYear() !== now.getFullYear()
            ? "numeric"
            : undefined,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Inbox</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{messages.length}</span> message
              {messages.length !== 1 ? "s" : ""}
            </div>
            {/* Debug Toggle */}
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-semibold transition"
              title="Toggle Debug Info"
            >
              🐛 Debug
            </button>
          </div>
        </div>
      </header>

      {/* Debug Panel */}
      {showDebug && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="container mx-auto px-6">
            <h3 className="font-bold text-yellow-800 mb-2">
              🐛 Debug Information
            </h3>
            <div className="text-sm space-y-1">
              <p>
                <strong>Current User ID:</strong> {currentUser.id}
              </p>
              <p>
                <strong>Current User Name:</strong> {currentUser.name}
              </p>
              <p>
                <strong>Received Messages:</strong> {receivedMessages.length}
              </p>
              <p>
                <strong>Sent Messages:</strong> {sentMessages.length}
              </p>
              <p>
                <strong>Total Messages in System:</strong>{" "}
                {allMessages?.length || 0}
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer font-semibold text-yellow-800">
                  All Messages in System
                </summary>
                <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto max-h-64">
                  {JSON.stringify(allMessages, null, 2)}
                </pre>
              </details>
              <details className="mt-2">
                <summary className="cursor-pointer font-semibold text-yellow-800">
                  Received Messages
                </summary>
                <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto max-h-64">
                  {JSON.stringify(receivedMessages, null, 2)}
                </pre>
              </details>
              <details className="mt-2">
                <summary className="cursor-pointer font-semibold text-yellow-800">
                  Sent Messages
                </summary>
                <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto max-h-64">
                  {JSON.stringify(sentMessages, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* Tabs for Received/Sent */}
      <div className="container mx-auto px-6">
        <div className="flex space-x-2 mb-6 mt-6">
          <button
            onClick={() => {
              setActiveTab("received");
              setSelectedMessage(null);
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === "received"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            📥 Received ({receivedMessages.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("sent");
              setSelectedMessage(null);
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === "sent"
                ? "bg-green-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            📤 Sent ({sentMessages.length})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {messages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block p-6 bg-gray-100 rounded-full mb-6">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Messages Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Your inbox is empty. Start a conversation!
            </p>
            <button
              onClick={() => navigate("/compose")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 inline-flex items-center space-x-2"
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
              <span>Compose Message</span>
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer transition duration-200 hover:shadow-lg ${
                    selectedMessage?.id === msg.id ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {activeTab === "received" ? (
                          <span className="text-xs text-gray-500 mr-1">
                            From:
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 mr-1">
                            To:
                          </span>
                        )}
                        <h3 className="font-semibold text-gray-800 truncate">
                          {activeTab === "received"
                            ? msg.from.name
                            : msg.to.name}
                        </h3>
                        {msg.isFaceVerified && (
                          <span
                            className="text-green-600"
                            title="Face Verified"
                          >
                            ✅
                          </span>
                        )}
                        {msg.isDigitallyVerified && (
                          <span
                            className="text-blue-600"
                            title="Digitally Verified"
                          >
                            🧾
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {msg.subject}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate mb-2">
                    {msg.message}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(msg.timestamp)}
                  </p>
                </div>
              ))}
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-2">
              {selectedMessage ? (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  {/* Message Header */}
                  <div className="border-b pb-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                          {selectedMessage.subject}
                        </h2>
                        <div className="flex flex-col space-y-3">
                          {/* From Field */}
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 font-semibold min-w-[60px]">
                              From:
                            </span>
                            {selectedMessage.from.type === "individual" ? (
                              <div className="p-2 bg-blue-100 rounded-full">
                                <svg
                                  className="w-4 h-4 text-blue-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <div className="p-2 bg-purple-100 rounded-full">
                                <svg
                                  className="w-4 h-4 text-purple-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-800">
                                {selectedMessage.from.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {selectedMessage.from.type === "individual"
                                  ? "Individual"
                                  : "Organization"}
                              </p>
                            </div>
                          </div>

                          {/* To Field */}
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 font-semibold min-w-[60px]">
                              To:
                            </span>
                            {selectedMessage.to.type === "individual" ? (
                              <div className="p-2 bg-blue-100 rounded-full">
                                <svg
                                  className="w-4 h-4 text-blue-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <div className="p-2 bg-purple-100 rounded-full">
                                <svg
                                  className="w-4 h-4 text-purple-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-800">
                                {selectedMessage.to.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {selectedMessage.to.type === "individual"
                                  ? "Individual"
                                  : "Organization"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {formatDate(selectedMessage.timestamp)}
                        </p>
                      </div>
                    </div>

                    {/* Verification Badges */}
                    <div className="flex flex-wrap gap-2">
                      {selectedMessage.isFaceVerified && (
                        <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-sm font-semibold">
                            Face ID Verified
                          </span>
                        </div>
                      )}
                      {selectedMessage.isDigitallyVerified && (
                        <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                          <span className="text-sm font-semibold">
                            Digitally Verified Organization
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Digital Signature */}
                    {selectedMessage.from.signature && (
                      <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1 font-semibold">
                          Digital Signature:
                        </p>
                        <p className="text-xs text-gray-800 font-mono break-all">
                          {selectedMessage.from.signature}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Message Body */}
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center h-full flex items-center justify-center">
                  <div>
                    <div className="inline-block p-6 bg-blue-100 rounded-full mb-4">
                      <svg
                        className="w-12 h-12 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700">
                      Select a message to read
                    </h3>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inbox;
