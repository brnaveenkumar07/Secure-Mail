import React, { useState } from "react";
import { useApp } from "../context/AppContext";

const AdminPanel = () => {
  const {
    getStorageInfo,
    clearAllData,
    resetToSeedData,
    allMessages,
    currentUser,
  } = useApp();
  const [showPanel, setShowPanel] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);

  const handleGetInfo = () => {
    const info = getStorageInfo();
    setStorageInfo(info);
  };

  const handleClearData = () => {
    if (
      window.confirm(
        "⚠️ This will delete ALL data and refresh the page. Continue?"
      )
    ) {
      clearAllData();
    }
  };

  const handleResetData = () => {
    if (
      window.confirm(
        "🔄 This will reset to initial seed data and refresh the page. Continue?"
      )
    ) {
      resetToSeedData();
    }
  };

  const handleExportData = () => {
    const data = {
      messages: allMessages,
      timestamp: new Date().toISOString(),
      user: currentUser?.name,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `secure-messaging-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        className="fixed bottom-4 right-4 bg-gray-800 hover:bg-gray-900 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-50"
        title="Open Admin Panel"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl p-6 w-96 z-50 border-2 border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Admin Panel</span>
        </h3>
        <button
          onClick={() => setShowPanel(false)}
          className="text-gray-500 hover:text-gray-700 transition"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {/* Storage Info */}
        <button
          onClick={handleGetInfo}
          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2"
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Get Storage Info</span>
        </button>

        {storageInfo && (
          <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
            <div>
              <strong>Status:</strong>{" "}
              {storageInfo.isLoggedIn ? "✅ Logged In" : "❌ Not Logged In"}
            </div>
            <div>
              <strong>User:</strong> {storageInfo.user?.name || "None"}
            </div>
            <div>
              <strong>Messages:</strong> {storageInfo.messagesCount}
            </div>
            <div>
              <strong>Users:</strong> {storageInfo.usersCount}
            </div>
            <div>
              <strong>Organizations:</strong> {storageInfo.organizationsCount}
            </div>
            {storageInfo.sessionStart && (
              <div>
                <strong>Session:</strong>{" "}
                {storageInfo.sessionStart.toLocaleString()}
              </div>
            )}
          </div>
        )}

        {/* Export Data */}
        <button
          onClick={handleExportData}
          className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2"
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
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Export Data</span>
        </button>

        {/* Reset to Seed Data */}
        <button
          onClick={handleResetData}
          className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Reset to Seed Data</span>
        </button>

        {/* Clear All Data */}
        <button
          onClick={handleClearData}
          className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span>Clear All Data</span>
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
