import { useState, useEffect } from "react";
import { FileText, X, Menu } from "lucide-react";
import ProfileDropdown from "../layout/ProfileDropdown";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  // const isAuthenticated = false;
  // const user = { name: "Alex", email: "alex@timetoprogram.com" };
  // const logout = () => {};
  const { isAuthenticated, user, logout } = useAuth();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-sm shadow-lg" : "bg-white/0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-900 rounded-md flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              AI Invoice App
            </span>
          </div>

          <div className="hidden lg:flex lg:items-center lg:space-x-8 absolute left-1/2 transform -translate-x-1/2 transition-all duration-700">
            <a
              href="#features"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-black after:transition-all hover:after:w-full"
              // className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-black after:transition-all hover:after:w-full"
            >
              Testimonials
            </a>
            <a
              href="#FAQ"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-black after:transition-all hover:after:w-full"
            >
              FAQ
            </a>
          </div>

          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {isAuthenticated ? (
              <ProfileDropdown
                isOpen={profileDropdownOpen}
                onToggle={(e) => {
                  e.stopPropagation();
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                avatar={user?.avatar || ""}
                companyName={user?.name || ""}
                email={user?.email || ""}
                onLogout={logout}
              />
            ) : (
              <>
                <a
                  href="/login"
                  className="text-black hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="bg-gradient-to-r from-blue-950 to-blue-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <a
              href="#features"
              className="block text-gray-600 hover:text-gray-900 font-medium py-2"
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="block text-gray-600 hover:text-gray-900 font-medium py-2"
            >
              Testimonials
            </a>
            <a
              href="#FAQ"
              className="block text-gray-600 hover:text-gray-900 font-medium py-2"
            >
              FAQ
            </a>

            {/* <hr /> */}
            <div className="border-t border-gray-200 my-4"></div>

            {isAuthenticated ? (
              <div className="lg:hidden absolute top-full left-0 bg-blue-950 border-b border-gray-200 shadow-lg w-full text-2xl px-4 py-4 items-center justify-center">
                <Button
                  className="block text-white items-center hover:text-gray-900 font-medium py-2 mx-auto"
                  onClick={() => navigate("/dashboard")}
                >
                  GO to Dashboard
                </Button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block w-full text-left bg-blue-950 hover:bg-gray-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
