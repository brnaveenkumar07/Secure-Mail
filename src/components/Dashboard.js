import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout, getInboxMessages } = useApp();
  const [inboxCount, setInboxCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      const loadMessages = async () => {
        try {
          const messages = await getInboxMessages();
          setInboxCount(messages.length);
        } catch (error) {
          console.error("Error loading inbox count:", error);
        }
      };
      loadMessages();
    }
  }, [currentUser, getInboxMessages]);

  if (!currentUser) {
    navigate("/");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold tracking-wider text-gray-800">
              SecureMail
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* User Info Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white bg-opacity-20 rounded-full">
              {currentUser.type === "individual" ? (
                <svg
                  className="w-12 h-12"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-12 h-12"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold">{currentUser.name}</h2>
              <p className="text-blue-100">
                {currentUser.type === "individual"
                  ? "👤 Individual Account"
                  : "🏢 Organization Account"}
              </p>
              {currentUser.signature && (
                <p className="text-sm text-blue-200 mt-1">
                  🔐 Digital Signature: {currentUser.signature}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Compose Message Card */}
          <div
            onClick={() => navigate("/compose")}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-2xl transition duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-green-100 rounded-full">
                <svg
                  className="w-10 h-10 text-green-600"
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
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Compose Message
            </h3>
            <p className="text-gray-600 mb-4">
              Send a secure message with Face ID verification
            </p>
            <div className="flex items-center text-green-600 font-semibold">
              <span>Start Composing</span>
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>

          {/* View Inbox Card */}
          <div
            onClick={() => navigate("/inbox")}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-2xl transition duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <svg
                  className="w-10 h-10 text-blue-600"
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
              {inboxCount > 0 && (
                <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  {inboxCount}
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              View Inbox
            </h3>
            <p className="text-gray-600 mb-4">
              {inboxCount === 0
                ? "No new messages"
                : `You have ${inboxCount} message${inboxCount > 1 ? "s" : ""}`}
            </p>
            <div className="flex items-center text-blue-600 font-semibold">
              <span>Open Inbox</span>
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Features Info */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            🔐 Security Features
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">✅</div>
              <div>
                <h4 className="font-semibold text-gray-800">
                  Face ID Verification
                </h4>
                <p className="text-sm text-gray-600">
                  All individual messages verified with biometric authentication
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🧾</div>
              <div>
                <h4 className="font-semibold text-gray-800">
                  Digital Signatures
                </h4>
                <p className="text-sm text-gray-600">
                  Organization messages signed with RSA encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
