import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const GmailDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, getInboxMessages, getSentMessages, logout } = useApp();
  const [inboxCount, setInboxCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      const loadCounts = async () => {
        try {
          const [inbox, sent] = await Promise.all([
            getInboxMessages(),
            getSentMessages(),
          ]);
          setInboxCount(inbox.length);
          setSentCount(sent.length);
        } catch (error) {
          console.error("Error loading counts:", error);
        }
      };
      loadCounts();
    }
  }, [currentUser, getInboxMessages, getSentMessages]);

  if (!currentUser) {
    navigate("/");
    return null;
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const stats = [
    {
      title: "Inbox",
      count: inboxCount,
      icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      color: "from-blue-500 to-blue-600",
      action: () => navigate("/gmail-inbox"),
    },
    {
      title: "Sent",
      count: sentCount,
      icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
      color: "from-green-500 to-green-600",
      action: () => navigate("/gmail-inbox"),
    },
    {
      title: "Compose",
      count: "+",
      icon: "M12 4v16m8-8H4",
      color: "from-purple-500 to-purple-600",
      action: () => navigate("/gmail-compose"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  SecureMail
                </h1>
                <p className="text-xs text-gray-500">
                  Secure Messaging Platform
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold shadow">
                  {getInitials(currentUser.name)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {currentUser.type}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition flex items-center space-x-2"
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {currentUser.name.split(" ")[0]}! 👋
          </h2>
          <p className="text-lg text-gray-600">
            Manage your secure messages with advanced encryption and
            verification
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              onClick={stat.action}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden group"
            >
              <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={stat.icon}
                      />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold text-gray-900">
                      {stat.count}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {stat.title}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {stat.title === "Inbox" &&
                    `You have ${stat.count} message${
                      stat.count !== 1 ? "s" : ""
                    }`}
                  {stat.title === "Sent" &&
                    `${stat.count} message${stat.count !== 1 ? "s" : ""} sent`}
                  {stat.title === "Compose" && "Create new message"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/gmail-inbox")}
              className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
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
              <div className="text-left">
                <div className="font-semibold text-gray-900 text-lg">
                  View All Messages
                </div>
                <div className="text-sm text-gray-600">
                  Open Gmail-style inbox
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/compose")}
              className="flex items-center space-x-4 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all group"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
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
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 text-lg">
                  Compose Message
                </div>
                <div className="text-sm text-gray-600">Send secure message</div>
              </div>
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center space-x-3 mb-3">
              <svg
                className="w-8 h-8 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <h4 className="font-bold text-gray-900">Face ID Verified</h4>
            </div>
            <p className="text-sm text-gray-600">
              Biometric authentication ensures message sender identity
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center space-x-3 mb-3">
              <svg
                className="w-8 h-8 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <h4 className="font-bold text-gray-900">Digital Signatures</h4>
            </div>
            <p className="text-sm text-gray-600">
              RSA signatures verify organization authenticity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GmailDashboard;
