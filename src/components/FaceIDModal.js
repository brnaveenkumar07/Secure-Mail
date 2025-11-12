import React, { useState, useEffect } from "react";
import Webcam from "react-webcam";

const FaceIDModal = ({ isOpen, onClose, onVerified }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("idle"); // idle, verifying, success, failed

  useEffect(() => {
    if (!isOpen) {
      setVerificationStatus("idle");
      setIsVerifying(false);
    }
  }, [isOpen]);

  const handleVerify = () => {
    setIsVerifying(true);
    setVerificationStatus("verifying");

    // Simulate face verification with 2-second delay
    setTimeout(() => {
      setVerificationStatus("success");
      setIsVerifying(false);

      // Wait 1 second to show success, then callback
      setTimeout(() => {
        onVerified();
      }, 1000);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        {verificationStatus !== "verifying" && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-3">
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
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Face ID Verification
          </h2>
          <p className="text-gray-600 mt-2">Position your face in the frame</p>
        </div>

        {/* Webcam Preview */}
        <div className="mb-6 rounded-xl overflow-hidden bg-gray-900 relative">
          {verificationStatus === "idle" ||
          verificationStatus === "verifying" ? (
            <div className="relative">
              <Webcam
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full h-64 object-cover"
                videoConstraints={{
                  width: 640,
                  height: 480,
                  facingMode: "user",
                }}
              />
              {/* Face Frame Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-4 border-blue-500 rounded-full w-48 h-48 opacity-50"></div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              {verificationStatus === "success" && (
                <div className="text-center">
                  <div className="inline-block p-6 bg-green-100 rounded-full mb-4">
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
                  <h3 className="text-2xl font-bold text-green-600">
                    Verified!
                  </h3>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Messages */}
        {verificationStatus === "verifying" && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-blue-700 font-semibold">
                Analyzing facial features...
              </span>
            </div>
          </div>
        )}

        {verificationStatus === "success" && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <span className="text-green-700 font-semibold">
              ✅ Face verified successfully!
            </span>
          </div>
        )}

        {/* Action Button */}
        {verificationStatus === "idle" && (
          <button
            onClick={handleVerify}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
            disabled={isVerifying}
          >
            🔍 Verify Face
          </button>
        )}

        {/* Info */}
        {verificationStatus === "idle" && (
          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 Simulated verification using OpenCV/DeepFace
          </p>
        )}
      </div>
    </div>
  );
};

export default FaceIDModal;
