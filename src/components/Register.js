import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import FaceIDSignupModal from "./FaceIDSignupModal";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useApp();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    type: "individual",
    signature: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) {
      return;
    }
    setError("");

    // Validation
    if (
      !formData.username ||
      !formData.password ||
      !formData.name ||
      !formData.type
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    if (formData.type === "organization" && !formData.signature) {
      setError("Organizations must provide a digital signature");
      return;
    }

    try {
      // Prepare registration data
      const registrationData = {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        type: formData.type,
        ...(formData.type === "organization" && {
          signature: formData.signature,
        }),
      };

      if (formData.type === "organization") {
        setLoading(true);
        try {
          const result = await register(registrationData);
          if (result.success) {
            navigate("/gmail-dashboard");
          } else {
            setError(result.error || "Registration failed");
          }
        } catch (err) {
          setError("An error occurred during registration");
          console.error("Registration error:", err);
        } finally {
          setLoading(false);
        }
        return;
      }
      
      
      setPendingRegistration(registrationData);
      setIsFaceModalOpen(true);
    } catch (err) {
      setError("An error occurred while preparing registration");
      console.error("Registration prep error:", err);
    }
  };

  const handleFaceModalClose = () => {
    setIsFaceModalOpen(false);
    setPendingRegistration(null);
    setError("Face capture is required to complete sign-up.");
  };

  const completeRegistration = async (faceImage) => {
    if (!pendingRegistration) {
      return;
    }

    setIsFaceModalOpen(false);
    setLoading(true);
    setError("");

    try {
      const result = await register({
        ...pendingRegistration,
        faceImage,
      });

      if (result.success) {
        navigate("/gmail-dashboard");
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred during registration");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
      setPendingRegistration(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      {/* Back to Home Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2 backdrop-blur-sm"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>Back to Home</span>
      </button>

      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">Join Secure Messaging Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              User Gmail *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Enter Your Gmail"
              required
            />
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Enter Your Full Name"
              required
            />
          </div>

          {/* User Type */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Account Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="individual">👤 Individual</option>
              <option value="organization">🏢 Organization</option>
            </select>
          </div>

          {/* Digital Signature (for organizations) */}
          {formData.type === "organization" && (
            <div>
              <label
                htmlFor="signature"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Digital Signature *
              </label>
              <input
                type="text"
                id="signature"
                name="signature"
                value={formData.signature}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="e.g., signed_by_YourOrganization_RSA"
                required={formData.type === "organization"}
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be used to sign all your organization's messages
              </p>
            </div>
          )}

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Enter Password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Confirm Password"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "🎉 Create Account"}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Login here
            </button>
          </p>
        </div>
      </div>

      <FaceIDSignupModal
        isOpen={isFaceModalOpen}
        onClose={handleFaceModalClose}
        onCapture={completeRegistration}
      />
    </div>
  );
};

export default Register;
