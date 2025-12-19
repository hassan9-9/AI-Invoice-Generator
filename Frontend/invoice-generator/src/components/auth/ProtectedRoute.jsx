import { Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  // will integrate these values later
  // const isAuthenticated = true
  // const loading = false
  const { isAuthenticated, loading } = useAuth();

  console.log("🛡️ ProtectedRoute - Auth:", { isAuthenticated, loading });

   if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // if (!loading && !isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  // fixed version;

   // Check both context and localStorage as backup
  const token = localStorage.getItem('token');
  const actuallyAuthenticated = isAuthenticated || !!token;

  console.log("🛡️ ProtectedRoute - Final check:", { 
    contextAuth: isAuthenticated, 
    hasToken: !!token,
    actuallyAuthenticated 
  });

  if (!actuallyAuthenticated) {
    console.log("🛡️ Redirecting to login...");
    return <Navigate to="/login" replace />;
  }



  return <DashboardLayout>{children ? children : <Outlet />}</DashboardLayout>;
};

export default ProtectedRoute;
