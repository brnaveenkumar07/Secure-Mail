import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user",
};

const FaceIDSignupModal = ({ isOpen, onClose, onCapture }) => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setCapturedImage(null);
      setError("");
    }
  }, [isOpen]);

  const handleCapture = () => {
    if (!webcamRef.current) {
      setError("Webcam not ready. Please allow camera access and try again.");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setError("Unable to capture your face. Please try again.");
      return;
    }

    setCapturedImage(imageSrc);
    setError("");
  };

  const handleConfirm = () => {
    if (!capturedImage) {
      setError("Please capture your face before continuing.");
      return;
    }

    onCapture(capturedImage);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setError("");
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close face capture"
        >
          <svg
            className="h-6 w-6"
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

        <div className="grid gap-8 p-6 md:grid-cols-[1.3fr_1fr] md:p-8">
          <div className="relative overflow-hidden rounded-2xl bg-gray-900">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured face"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="relative h-full min-h-[320px]">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-48 w-48 rounded-full border-4 border-blue-500/70 shadow-[0_0_40px_rgba(59,130,246,0.35)]"></div>
                </div>
                <div className="pointer-events-none absolute bottom-4 left-1/2 w-4/5 -translate-x-1/2 rounded-full bg-black/40 px-4 py-2 text-center text-sm text-white">
                  Align your face within the circle for the best capture
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Face Capture</h2>
              <p className="mt-2 text-sm text-gray-500">
                We securely store your facial template to enable Face ID
                verification for future logins and message approvals.
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
              <p className="font-semibold">Tips for a clear capture:</p>
              <ul className="mt-3 space-y-2 text-blue-600">
                <li className="flex items-start space-x-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-400"></span>
                  <span>
                    Make sure you are in a well-lit area without heavy
                    backlighting.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-400"></span>
                  <span>
                    Keep your face centered and look directly into the camera.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-400"></span>
                  <span>
                    Remove masks or accessories that could block facial
                    features.
                  </span>
                </li>
              </ul>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {capturedImage ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleRetake}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-600 transition hover:bg-gray-100"
                    type="button"
                  >
                    Retake Photo
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                    type="button"
                  >
                    Use This Photo
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCapture}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                  type="button"
                >
                  Capture Face
                </button>
              )}

              {!capturedImage && (
                <p className="text-xs text-gray-500">
                  We do not store video. A single frame is captured securely
                  after you confirm.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceIDSignupModal;
