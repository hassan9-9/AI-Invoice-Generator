import React, { useState, useMemo } from "react";
import {
    Eye,
    EyeOff,
    Loader2,
    Mail,
    Lock,
    FileText,
    ArrowRight,
    User
} from "lucide-react";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { validateEmail, validatePassword } from "../../utils/helper";

const SignUp = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fieldErrors, setFieldErrors] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [touched, setTouched] = useState({
        name: false,
        email: false,
        password: false,
        confirmPassword: false,
    });

    // Validation functions
    const validateName = (name) => {
        if (!name.trim()) return "Name is required";
        if (name.trim().length < 2) return "Name must be at least 2 characters";
        return "";
    };

    const validateConfirmPassword = (confirmPassword, password) => {
        if (!confirmPassword) return "Please confirm your password";
        if (confirmPassword !== password) return "Passwords do not match";
        return "";
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // console.log(e.target.name, e.target.value);
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
        setError(""); // Clear general error when user types
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        let error = "";
        switch (name) {
            case "name":
                error = validateName(value);
                break;
            case "email":
                error = validateEmail(value);
                break;
            case "password":
                error = validatePassword(value);
                break;
            case "confirmPassword":
                error = validateConfirmPassword(value, formData.password);
                break;
            default:
                break;
        }

        setFieldErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const isFormValid = useMemo(() => {
        const nameError = validateName(formData.name);
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);
        const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);

        return !nameError && !emailError && !passwordError && !confirmPasswordError;
    }, [formData.name, formData.email, formData.password, formData.confirmPassword]);

    const validateForm = () => {
        const nameError = validateName(formData.name);
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);
        const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);

        const errors = {
            name: nameError,
            email: emailError,
            password: passwordError,
            confirmPassword: confirmPasswordError
        };

        setFieldErrors(errors);
        return !nameError && !emailError && !passwordError && !confirmPasswordError;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateForm()) {
            setTouched({
                name: true,
                email: true,
                password: true,
                confirmPassword: true
            });
            return;
        }

        setIsLoading(true);

        try {
            console.log("Attempting registration with:", {
                name: formData.name,
                email: formData.email,
                password: "***" // Don't log actual password
            });

            // Use the correct API path
            const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            console.log("Registration response:", response.data);

            setSuccess("Account created successfully! Redirecting...");
            
            // Try to auto-login
            try {
                const loginResponse = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
                    email: formData.email,
                    password: formData.password
                });

                if (loginResponse.data) {
                    login(loginResponse.data);
                    setTimeout(() => {
                        navigate("/dashboard");
                    }, 2000);
                }
            } catch (loginError) {
                console.warn("Auto-login failed, redirecting to login page");
                setSuccess("Account created! Please log in.");
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
                console.log("Login error:", loginError);
            }

        } catch (err) {
            console.error("Registration error:", err);
            console.error("Error response:", err.response);
            
            let errorMessage = "Registration failed. Please try again.";
            
               if (err.response) {
                // Server responded with error status - MATCHING YOUR BACKEND
                if (err.response.status === 400) {
                    if (err.response.data?.message === "User already exists") {
                        errorMessage = "Email already exists. Please use a different email or login.";
                    } else if (err.response.data?.message === "Please fill all fields") {
                        errorMessage = "Please fill in all required fields.";
                    } else {
                        errorMessage = err.response.data?.message || "Invalid data. Please check your information.";
                    }
                } else if (err.response.status === 500) {
                    errorMessage = "Server error. Please try again later.";
                } else if (err.response.data?.message) {
                    errorMessage = err.response.data.message;
                }
            } else if (err.request) {
                // Request was made but no response received
                errorMessage = "Network error. Please check your connection and try again.";
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-950 to-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                        Create Account
                    </h1>
                    <p className="text-gray-600 text-sm">Join Invoice Generator today</p>
                </div>

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                                    fieldErrors.name && touched.name
                                        ? "border-red-300 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-black"
                                }`}
                                placeholder="Enter your full name"
                            />
                        </div>
                        {fieldErrors.name && touched.name && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                        )}
                    </div>

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
                                    fieldErrors.email && touched.email
                                        ? "border-red-300 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-black"
                                }`}
                                placeholder="Enter your email"
                            />
                        </div>
                        {fieldErrors.email && touched.email && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
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
                                    fieldErrors.password && touched.password
                                        ? "border-red-300 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-black"
                                }`}
                                placeholder="Create a password"
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
                        {fieldErrors.password && touched.password && (
                            <p className="mt-1 text-sm text-red-600">
                                {fieldErrors.password}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                                    fieldErrors.confirmPassword && touched.confirmPassword
                                        ? "border-red-300 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-black"
                                }`}
                                placeholder="Confirm your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {fieldErrors.confirmPassword && touched.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">
                                {fieldErrors.confirmPassword}
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

                    {/* Terms & Conditions */}
                    <div className="flex items-start pt-2">
                        <input
                            type="checkbox"
                            id="terms"
                            className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black mt-1"
                            required
                        />
                        <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                            I agree to the{" "}
                            <button type="button" className="text-black hover:underline">
                                Terms of Service
                            </button>{" "}
                            and{" "}
                            <button type="button" className="text-black hover:underline">
                                Privacy Policy
                            </button>
                        </label>
                    </div>

                    {/* Sign Up Button */}
                    <button
                        type="submit"
                        disabled={isLoading || !isFormValid}
                        className="w-full bg-gradient-to-r from-blue-950 to-blue-900 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-900 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            <>
                                Create Account
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{" "}
                        <button
                            type="button"
                            className="text-black font-medium hover:underline"
                            onClick={() => navigate("/login")}
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;