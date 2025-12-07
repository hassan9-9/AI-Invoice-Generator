// /* eslint-disable react-refresh/only-export-components */
// import React, { createContext, useContext, useState, useEffect, version } from "react";

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   // 🔍 Debug: log every time auth changes
//   useEffect(() => {
//     console.log("Auth status changed:", {
//       isAuthenticated,
//       user,
//       token: localStorage.getItem("token"),
//     });
//   }, [isAuthenticated, user]);

//   const checkAuthStatus = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const userStr = localStorage.getItem("user");

//       if (token && userStr) {
//         const userData = JSON.parse(userStr);
//         setUser(userData);
//         setIsAuthenticated(true);
//       }
//     } catch (error) {
//       console.error("Auth check failed:", error);
//       logout();
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Updated version: takes an object { user, token }
//   const login = ({ user, token }) => {
//     if (!token || !user) {
//       console.error("Invalid login parameters:", { user, token });
//       return;
//     }
//     localStorage.setItem("token", token);
//     localStorage.setItem("user", JSON.stringify(user));
//     setUser(user);
//     setIsAuthenticated(true);
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("refreshToken");
//     localStorage.removeItem("user");
//     setUser(null);
//     setIsAuthenticated(false);
//     window.location.href = "/";
//   };

//   const updateUser = (updatedUserData) => {
//     const newUserData = { ...user, ...updatedUserData };
//     localStorage.setItem("user", JSON.stringify(newUserData));
//     setUser(newUserData);
//   };

//   const value = {
//     user,
//     loading,
//     isAuthenticated,
//     login,
//     logout,
//     updateUser,
//     checkAuthStatus,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };




// updated version

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 🔍 Debug: log every time auth changes
  useEffect(() => {
    console.log("Auth status changed:", {
      isAuthenticated,
      user,
      token: localStorage.getItem("token"),
    });
  }, [isAuthenticated, user]);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      console.log("🔐 checkAuthStatus - Token:", !!token, "User:", !!userStr);

      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
          setIsAuthenticated(true);
          console.log("✅ Auth check successful");
        } catch (parseError) {
          console.error("Failed to parse user data:", parseError);
          // Don't logout here - just set as not authenticated
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log("❌ No auth data found in localStorage");
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // DON'T call logout() here - it creates an infinite loop
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Updated version: takes an object { user, token }
  const login = ({ user, token }) => {
    if (!token || !user) {
      console.error("Invalid login parameters:", { user, token });
      return;
    }
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    setIsAuthenticated(true);
    console.log("✅ Login successful");
  };

  const logout = () => {
    console.log("🔐 Logout initiated");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    // Don't redirect here - let the component handle it
    console.log("✅ Logout completed");
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    localStorage.setItem("user", JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};