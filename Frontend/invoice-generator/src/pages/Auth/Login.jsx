import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  FileText,
  ArrowRight,
} from "lucide-react";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { validateEmail, validatePassword } from "../../utils/helper";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (error) setError("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    // Validate field on blur
    if (name === "email") {
      setFieldErrors((prev) => ({
        ...prev,
        email: validateEmail(value),
      }));
    } else if (name === "password") {
      setFieldErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
      }));
    }
  };

  const isFormValid = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    return !emailError && !passwordError && formData.email && formData.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setFieldErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("🔍 Sending login request to:", API_PATHS.AUTH.LOGIN);
      console.log("📧 Login data:", {
        email: formData.email,
        password: "***", // Don't log actual password
      });

      // Add timeout and better error handling
      const response = await axiosInstance.post(
        API_PATHS.AUTH.LOGIN,
        {
          email: formData.email,
          password: formData.password,
        },
        {
          timeout: 10000, // 10 second timeout
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Full API response:", response);
      console.log("📊 Response data:", response.data);
      console.log("🔢 Response status:", response.status);

      // Handle different success response formats
      if (response.status === 200 || response.status === 201) {
        const responseData = response.data;

        // Format 1: Direct token in response
        if (responseData.token) {
          console.log("🎯 Using token format");
          setSuccess("Login successful!");
          login({
            token: responseData.token,
            user: responseData.user || {
              id: responseData.id,
              name: responseData.name,
              email: formData.email,
            },
          });
        }
        // Format 2: Token in data object with success flag
        else if (responseData.data && responseData.data.token) {
          console.log("🎯 Using data.token format");
          setSuccess("Login successful!");
          login(responseData.data);
        }
        // Format 3: Success flag with data
        else if (responseData.success && responseData.data) {
          console.log("🎯 Using success.data format");
          setSuccess("Login successful!");
          login(responseData.data);
        }
        // Format 4: Simple success
        else if (responseData.success) {
          console.log("🎯 Using simple success format");
          setSuccess("Login successful!");
          login(responseData);
        }
        // Format 5: Assume success if we got 200/201
        else {
          console.log("🎯 Using fallback format");
          setSuccess("Login successful!");
          login(responseData);
        }

        // Redirect after success
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        console.warn("⚠️ Unexpected response status:", response.status);
        setError(response.data?.message || "Unexpected response from server");
      }
    } catch (err) {
      console.error("❌ Login error details:", err);

      // Handle different error types
      if (err.code === "ECONNABORTED") {
        setError(
          "Request timeout. Please check your connection and try again."
        );
      } else if (err.response) {
        // Server responded with error status
        console.error("🚨 Server error response:", err.response);

        const status = err.response.status;
        const message = err.response.data?.message;

        switch (status) {
          case 400:
            setError(message || "Invalid request format.");
            break;
          case 401:
            setError(message || "Invalid email or password.");
            break;
          case 403:
            setError(message || "Access denied.");
            break;
          case 404:
            setError(message || "User not found.");
            break;
          case 422:
            setError(message || "Validation failed.");
            break;
          case 500:
            setError(message || "Server error. Please try again later.");
            break;
          default:
            setError(message || `Login failed (${status}).`);
        }
      } else if (err.request) {
        // Request was made but no response received
        console.error("🌐 Network error - no response:", err.request);
        setError("Network error. Please check your internet connection.");
      } else {
        // Other errors (including browser extension interference)
        console.error("⚡ Other error:", err.message);

        if (
          err.message.includes("asynchronous response") ||
          err.message.includes("message channel closed")
        ) {
          setError(
            "Browser extension interference detected. Please try in incognito mode or disable extensions."
          );
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-950 to-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Login to Your Account
          </h1>
          <p className="text-gray-600 text-sm">
            Welcome back to Invoice Generator
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                  fieldErrors.email
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-black"
                }`}
                placeholder="Enter your email"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                  fieldErrors.password
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-black"
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-red-600 text-sm mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className="w-full bg-gradient-to-r from-blue-950 to-blue-900 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-900 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              className="text-black font-medium hover:underline"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
