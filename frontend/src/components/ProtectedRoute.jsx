import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ProtectedRoute - Requires authentication
 * Redirects to login if user is not authenticated
 */
export const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    // Redirect to login but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * RoleBasedRoute - Requires specific role(s)
 * Redirects to appropriate dashboard if user doesn't have required role
 */
export const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to user's appropriate dashboard based on their role
    const redirectPath = getRoleBasedRedirect(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

/**
 * PublicRoute - Only accessible when NOT authenticated
 * Redirects authenticated users to their dashboard
 */
export const PublicRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  if (user) {
    const redirectPath = getRoleBasedRedirect(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

/**
 * Helper function to get redirect path based on user role
 */
export const getRoleBasedRedirect = (role) => {
  switch (role) {
    case "ADMIN":
      return "/admin-dashboard";
    case "ENGINEER":
      return "/engineer-dashboard";
    case "RANGER":
    default:
      return "/user-dashboard";
  }
};

export default ProtectedRoute;
