import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import FaceIDModal from "./FaceIDModal";

const ComposeMessage = () => {
  const navigate = useNavigate();
  const { currentUser, sendMessage, getAllRecipients } = useApp();

  const [recipientQuery, setRecipientQuery] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [isRecipientFocused, setIsRecipientFocused] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [showFaceIDModal, setShowFaceIDModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const recipients = useMemo(() => {
    if (!currentUser) {
      return [];
    }
    return getAllRecipients();
  }, [currentUser, getAllRecipients]);

  const filteredRecipients = useMemo(() => {
    if (!recipientQuery.trim()) {
      return recipients.slice(0, 6);
    }

    const query = recipientQuery.toLowerCase();
    return recipients
      .filter((recipient) => {
        return (
          recipient.name.toLowerCase().includes(query) ||
          (recipient.username &&
            recipient.username.toLowerCase().includes(query))
        );
      })
      .slice(0, 6);
  }, [recipientQuery, recipients]);

  if (!currentUser) {
    navigate("/");
    return null;
  }

  const handleRecipientSelect = (recipient) => {
    setSelectedRecipient(recipient);
    setRecipientQuery(
      recipient.name + (recipient.username ? ` <${recipient.username}>` : "")
    );
    setIsRecipientFocused(false);
  };

  const handleRecipientInputChange = (value) => {
    setRecipientQuery(value);
    setSelectedRecipient(null);
    setError("");
  };

  const handleSendClick = (e) => {
    e.preventDefault();
    setError("");

    if (!selectedRecipient || !subject || !message) {
      setError("Please complete all fields before sending.");
      return;
    }

    // Show Face ID modal
    setShowFaceIDModal(true);
  };

  const handleFaceVerified = async () => {
    setShowFaceIDModal(false);

    const recipient = selectedRecipient;
    if (!recipient) {
      setError("Please select a recipient.");
      return;
    }

    const messageData = {
      from: {
        id: currentUser.id,
        name: currentUser.name,
        type: currentUser.type,
        ...(currentUser.signature && { signature: currentUser.signature }),
      },
      to: {
        id: recipient.id,
        name: recipient.name,
      },
      subject,
      message,
      isFaceVerified: currentUser.type === "individual",
      isDigitallyVerified: currentUser.type === "organization",
    };

    // Enhanced logging
    console.log("📤 Sending Message:");
    console.log("  From:", currentUser.name, "(ID:", currentUser.id, ")");
    console.log("  To:", recipient.name, "(ID:", recipient.id, ")");
    console.log("  Subject:", subject);
    console.log("  Message Data:", messageData);

    try {
      await sendMessage(messageData);
      setSuccess(true);

      // Reset form after 2 seconds and navigate to inbox
      setTimeout(() => {
        navigate("/inbox");
      }, 2000);
    } catch (err) {
      setError("Failed to send message: " + err.message);
      console.error("Send message error:", err);
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
            <h1 className="text-2xl font-bold text-gray-800">
              Compose Message
            </h1>
          </div>
          <div className="text-sm text-gray-600">
            Logged in as:{" "}
            <span className="font-semibold">{currentUser.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {success ? (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-green-100 rounded-full mb-6">
                <svg
                  className="w-16 h-16 text-green-600"
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
              </div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">
                Message Sent Successfully!
              </h2>
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 mb-1">
                  <strong>To:</strong> {selectedRecipient?.name}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Subject:</strong> {subject}
                </p>
              </div>
              <p className="text-gray-600 mb-2">
                {currentUser.type === "individual"
                  ? "✅ Verified with Face ID"
                  : "🧾 Signed with Digital Signature"}
              </p>
              <p className="text-sm text-gray-500">Redirecting to inbox...</p>
            </div>
          ) : (
            <form onSubmit={handleSendClick} className="space-y-6">
              {/* Recipient Selection */}
              <div className="relative">
                <label
                  htmlFor="recipient"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  To
                </label>
                <div
                  className={`flex items-center gap-2 rounded-lg border ${
                    isRecipientFocused
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-300"
                  } bg-white px-3 py-2 transition-shadow`}
                >
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-600">
                    To
                  </span>
                  <input
                    id="recipient"
                    type="text"
                    value={recipientQuery}
                    onChange={(e) => handleRecipientInputChange(e.target.value)}
                    onFocus={() => setIsRecipientFocused(true)}
                    onBlur={() =>
                      setTimeout(() => setIsRecipientFocused(false), 150)
                    }
                    placeholder="Search contacts"
                    className="flex-1 border-none bg-transparent text-sm text-gray-700 outline-none"
                    autoComplete="off"
                  />
                </div>

                {isRecipientFocused && filteredRecipients.length > 0 && (
                  <div className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl">
                    <div className="py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <div className="px-4">Suggested recipients</div>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {filteredRecipients.map((recipient) => (
                        <li key={recipient.id} className="hover:bg-blue-50">
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleRecipientSelect(recipient)}
                            className="flex w-full items-center justify-between px-4 py-3 text-left"
                          >
                            <div>
                              <p className="font-semibold text-gray-800">
                                {recipient.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {recipient.username || "SecureMsg user"}
                              </p>
                            </div>
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500">
                              {recipient.type === "individual"
                                ? "Individual"
                                : "Organization"}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedRecipient && (
                  <div className="mt-2 flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <svg
                        className="h-5 w-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 14c-4.418 0-8 2.015-8 4.5V20h16v-1.5c0-2.485-3.582-4.5-8-4.5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        {selectedRecipient.name}
                      </p>
                      <p className="text-xs text-blue-700">
                        {selectedRecipient.username || "SecureMsg user"} ·{" "}
                        {selectedRecipient.type === "individual"
                          ? "Individual account"
                          : "Organization"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Subject:
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter message subject"
                />
              </div>

              {/* Message Body */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Message:
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Type your message here..."
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Security Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-6 h-6 text-blue-600 mt-0.5"
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
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">
                      Security Verification
                    </h4>
                    <p className="text-sm text-blue-700">
                      {currentUser.type === "individual"
                        ? "Your message will be verified with Face ID before sending."
                        : `Your message will be digitally signed with: ${currentUser.signature}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
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
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Face ID Modal */}
      <FaceIDModal
        isOpen={showFaceIDModal}
        onClose={() => setShowFaceIDModal(false)}
        onVerified={handleFaceVerified}
      />
    </div>
  );
};

export default ComposeMessage;
