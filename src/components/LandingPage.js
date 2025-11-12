import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Add custom gradient animation styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .gradient-text {
        background: linear-gradient(90deg, #fde047, #f9a8d4, #c084fc);
        background-size: 200% auto;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: gradient 3s ease infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleLogoClick = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-cycle through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: (
        <svg
          className="w-16 h-16"
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
      ),
      title: "Military-Grade Security",
      description:
        "Advanced biometric authentication and cutting-edge encryption protect your communications with the highest level of security available.",
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
    },
    {
      icon: (
        <svg
          className="w-16 h-16"
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
      ),
      title: "Digital Signatures",
      description:
        "Military-grade RSA encryption ensures your organization's messages are verified and tamper-proof. Enterprise-ready security.",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
    {
      icon: (
        <svg
          className="w-16 h-16"
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
      ),
      title: "Secure Storage",
      description:
        "Your messages are encrypted at rest with military-grade encryption standards, ensuring complete privacy and security.",
      gradient: "bg-gradient-to-br from-green-500 to-emerald-500",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO",
      company: "TechCorp Inc.",
      image: "👩‍💼",
      text: "The digital signature feature has revolutionized how we handle secure communications. Absolutely essential!",
    },
    {
      name: "Michael Chen",
      role: "Security Officer",
      company: "CyberShield",
      image: "👨‍💻",
      text: "Face ID verification gives us the peace of mind we need. No more worrying about unauthorized access. The security is unmatched.",
    },
    {
      name: "Emily Rodriguez",
      role: "Healthcare Admin",
      company: "MedSecure",
      image: "👩‍⚕️",
      text: "HIPAA compliance made easy. Our patient communications are now fully secure and traceable. Game changer.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-md shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Exact Dashboard Style */}
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-3 focus:outline-none"
            >
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
              <h1 className="font-poppins text-3xl md:text-4xl font-extrabold tracking-wider text-gray-800">
                SecureMail
              </h1>

            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className={`transition-colors hover:text-blue-600 font-medium ${
                  scrolled ? "text-gray-600" : "text-white"
                }`}
              >
                Features
              </a>
              <a
                href="#testimonials"
                className={`transition-colors hover:text-blue-600 font-medium ${
                  scrolled ? "text-gray-600" : "text-white"
                }`}
              >
                Testimonials
              </a>
              <button
                onClick={() => navigate("/login")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  scrolled
                    ? "text-gray-600 hover:text-blue-600"
                    : "text-white hover:text-blue-200"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transform hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 pt-20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 pt-20 pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-white space-y-8">
              <div className="inline-flex items-center bg-white/20 backdrop-blur-xl px-5 py-3 rounded-full border border-white/30 shadow-xl">
                <span className="text-sm font-black">
                  🔒 MILITARY-GRADE SECURITY
                </span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tight">
                Secure Messaging
                <span className="block gradient-text mt-2">Redefined</span>
              </h1>

              <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-xl">
                Face ID verification and digital signatures ensure your messages
                are always secure, verified, and private.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/register")}
                  className="group relative bg-white text-blue-600 px-8 py-4 rounded-xl font-black text-lg hover:shadow-2xl transform hover:-translate-y-2 hover:shadow-blue-500/30 transition-all duration-300 ease-out overflow-hidden"
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="space-y-4">
                  <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5 border border-white/30 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full shadow-lg"></div>
                      <div>
                        <div className="font-black text-white">John Doe</div>
                        <div className="text-xs text-blue-200 flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                          Face ID Verified
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-4 text-sm font-medium">
                      Your message is encrypted and verified! 🔐
                    </div>
                  </div>

                  <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5 border border-white/30 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full shadow-lg"></div>
                      <div>
                        <div className="font-black text-white">TechCorp</div>
                        <div className="text-xs text-blue-200 flex items-center">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                          Digitally Signed
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 text-sm font-medium">
                      Organization verified with RSA signature ✓
                    </div>
                  </div>
                </div>

                <div className="absolute -top-5 -right-5 bg-green-400 text-white px-5 py-2 rounded-full text-sm font-black shadow-2xl animate-bounce">
                  ✓ Verified
                </div>
                <div className="absolute -bottom-5 -left-5 bg-yellow-400 text-gray-900 px-5 py-2 rounded-full text-sm font-black shadow-2xl animate-pulse">
                  🔒 Encrypted
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-10 h-16 border-2 border-white rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-6">
              Military-Grade Security
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to keep your communications secure and
              verified
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 ease-out transform hover:-translate-y-2 cursor-pointer border-2 ${
                  activeFeature === index
                    ? "border-blue-500 scale-105 shadow-blue-500/30"
                    : "border-transparent hover:border-gray-200"
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div
                  className={`inline-block p-5 rounded-2xl ${feature.gradient} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-32 bg-gradient-to-b from-white to-gray-50"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-6">
              Trusted by Thousands
            </h2>
            <p className="text-2xl text-gray-600">
              See what our customers have to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 ease-out transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-200"
              >
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-6 h-6 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-700 mb-8 text-lg italic font-medium leading-relaxed">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center space-x-4">
                  <div className="text-5xl">{testimonial.image}</div>
                  <div>
                    <div className="font-black text-gray-900 text-lg">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 font-bold">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-blue-600 font-medium">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl"></div>
        </div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            Secure Your Communications
          </h2>
          <p className="text-2xl md:text-3xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join organizations worldwide who trust SecureMail for their sensitive
            communications
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => navigate("/register")}
              className="group relative bg-white text-blue-600 px-12 py-6 rounded-2xl font-black text-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <span className="text-white text-3xl font-black">
                SecureMail
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Military-grade security for your communications
            </p>
            <div className="border-t border-gray-800 w-24 mb-6"></div>
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} SecureMail. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
