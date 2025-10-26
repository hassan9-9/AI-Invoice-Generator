import { useState, useEffect, useRef } from 'react';
import { User, LogOut, Settings, FileText, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown = ({ 
  isOpen, 
  onToggle, 
  avatar, 
  companyName, 
  email, 
  onLogout 
}) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isOpen) {
          onToggle(event);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={onToggle}
        className="flex items-center  space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-950 to-blue-900 flex items-center justify-center text-white font-semibold">
          {avatar ? (
            <img 
              src={avatar} 
              alt={companyName} 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-sm">
              {companyName ? companyName.charAt(0).toUpperCase() : 'U'}
            </span>
          )}
        </div>
        
        {/* Name and Email */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">
            {companyName || 'User'}
          </div>
          <div className="text-xs text-gray-500">
            {email || 'No email'}
          </div>
        </div>
        
        {/* Chevron Icon */}
        <ChevronDown 
          className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-950 to-blue-900 flex items-center justify-center text-white font-semibold">
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt={companyName} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span>
                    {companyName ? companyName.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {companyName || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {email || 'No email'}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <a
              onClick={() => navigate("/profile")}  
              className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-150"
            >
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">My Profile</span>
            </a>
            
            <a
              onClick={() => navigate("/invoices")}
              className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-150"
            >
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">My Invoices</span>
            </a>
            
            <a
              href="/settings"
              className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-150"
            >
              <Settings className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Settings</span>
            </a>
          </div>

          {/* Logout Section */}
          <div className="border-t border-gray-200 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
              }}
              className="flex items-center space-x-3 px-4 py-2.5 w-full hover:bg-red-50 transition-colors duration-150 text-left"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600 font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;