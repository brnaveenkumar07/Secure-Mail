import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import FaceIDModal from "./FaceIDModal";

const GmailCompose = () => {
  const navigate = useNavigate();
  const { currentUser, getAllRecipients, sendMessage } = useApp();

  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [showFaceID, setShowFaceID] = useState(false);
  const [messageData, setMessageData] = useState(null);

  // Early return AFTER all hooks
  if (!currentUser) {
    navigate("/");
    return null;
  }

  const recipients = getAllRecipients();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📝 GmailCompose - handleSubmit called");

    if (!recipient || !subject || !message) {
      console.warn("⚠️ Missing required fields:", {
        recipient,
        subject,
        message,
      });
      alert("Please fill in all fields");
      return;
    }

    const selectedRecipient = recipients.find(
      (r) => r.id === parseInt(recipient)
    );

    if (!selectedRecipient) {
      console.error("❌ Invalid recipient ID:", recipient);
      alert("Invalid recipient selected");
      return;
    }

    console.log("✅ Recipient found:", selectedRecipient);

    const newMessageData = {
      from: {
        id: currentUser.id,
        name: currentUser.name,
        type: currentUser.type,
        ...(currentUser.signature && { signature: currentUser.signature }),
      },
      to: {
        id: selectedRecipient.id,
        name: selectedRecipient.name,
        type: selectedRecipient.type,
      },
      subject,
      message,
      isFaceVerified: currentUser.type === "individual",
      isDigitallyVerified: currentUser.type === "organization",
    };

    console.log("📧 Message Data:", newMessageData);

    if (currentUser.type === "individual") {
      console.log("👤 Individual user - showing Face ID modal");
      setMessageData(newMessageData);
      setShowFaceID(true);
    } else {
      console.log("🏢 Organization user - sending directly");
      try {
        await sendMessage(newMessageData);
        alert("Message sent successfully!");
        navigate("/gmail-inbox");
      } catch (err) {
        alert("Failed to send message: " + err.message);
      }
    }
  };

  const handleFaceVerified = async (faceImage) => {
    console.log("✅ Face ID verified! Sending message...");
    if (messageData) {
      // Add face image to message data
      const dataToSend = {
        ...messageData,
        faceImage: faceImage
      };

      console.log("📧 Sending message data with face image");
      try {
        await sendMessage(dataToSend);
        setShowFaceID(false);
        alert("Message sent successfully with Face ID verification!");
        navigate("/gmail-inbox");
      } catch (err) {
        alert("Failed to send message: " + err.message);
        setShowFaceID(false); // Close modal on error so user can try again
      }
    } else {
      console.error("❌ No message data available");
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
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/gmail-dashboard")}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">
                  New Message
                </h1>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {getInitials(currentUser.name)}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {currentUser.type}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compose Form */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <form onSubmit={handleSubmit}>
              {/* To Field */}
              <div className="border-b border-gray-200 px-6 py-4 flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700 w-16">
                  To:
                </label>
                <div className="flex-1 relative">
                  <select
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                    required
                  >
                    <option value="">Select recipient</option>
                    <optgroup label="👤 Individuals">
                      {recipients
                        .filter((r) => r.type === "individual")
                        .map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.username})
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="🏢 Organizations">
                      {recipients
                        .filter((r) => r.type === "organization")
                        .map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name} ({org.username})
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Subject Field */}
              <div className="border-b border-gray-200 px-6 py-4 flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700 w-16">
                  Subject:
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Message subject"
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Message Body */}
              <div className="px-6 py-6">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows="16"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition text-sm leading-relaxed"
                  required
                ></textarea>
              </div>

              {/* Verification Info */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  {currentUser.type === "individual" ? (
                    <>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          Face ID Verification Required
                        </div>
                        <div className="text-xs text-gray-600">
                          Your message will be verified with biometric
                          authentication
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          Digital Signature Enabled
                        </div>
                        <div className="text-xs text-gray-600">
                          Message will be signed: {currentUser.signature}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/gmail-dashboard")}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>

                <div className="flex items-center space-x-3">


                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
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
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Tips Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-semibold text-blue-900">Tip</span>
              </div>
              <p className="text-xs text-blue-800">
                Individual users require Face ID verification before sending
                messages
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-semibold text-green-900">
                  Secure
                </span>
              </div>
              <p className="text-xs text-green-800">
                Your messages are securely stored and protected for future access.
              </p>

            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-semibold text-purple-900">
                  Verified
                </span>
              </div>
              <p className="text-xs text-purple-800">
                Organizations automatically sign messages with digital
                signatures
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Face ID Modal */}
      <FaceIDModal
        isOpen={showFaceID}
        onVerified={handleFaceVerified}
        onClose={() => setShowFaceID(false)}
      />
    </>
  );
};

export default GmailCompose;
