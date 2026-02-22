/**
 * =============================================================================
 * PROTECTED ROUTE COMPONENT - TODO: NATALIA
 * =============================================================================
 * File: frontend/src/components/ui/ProtectedRoute.jsx
 * Assigned to: NATALIA
 * Status: TODO 🟡
 *
 * REFERENCE: See branch 'pablo-working-backup' for working implementation
 * =============================================================================
 *
 * WHAT THIS FILE DOES:
 * - Wraps routes that require authentication
 * - If user is logged in: render the child component
 * - If user is NOT logged in: redirect to /login
 * - Pass current location so login can redirect back after success
 *
 * USAGE IN App.jsx:
 *   <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
 *
 * =============================================================================
 * IMPLEMENTATION HINTS:
 * =============================================================================
 *
 * 1. GET FROM AuthContext:
 *    const { isAuthenticated, isLoading } = useAuth();
 *
 * 2. GET CURRENT LOCATION:
 *    const location = useLocation();
 *
 * 3. IF isLoading IS TRUE:
 *    - Return a loading spinner div
 *    - This prevents flash of redirect while checking auth
 *
 * 4. IF NOT isAuthenticated:
 *    - Return <Navigate to="/login" state={{ from: location, message: 'Please sign in...' }} replace />
 *    - The state passes info to Login page about where user came from
 *
 * 5. IF isAuthenticated:
 *    - Return children (the protected component)
 *
 * =============================================================================
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // TODO: Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // TODO: Redirect to login if not authenticated
  // HINT: Use Navigate component with state prop
  // state={{ from: location, message: 'Please sign in to access this page' }}
  if (!isAuthenticated) {
    // TODO: Return Navigate to /login with state
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: "Please sign in to access this page",
        }}
        replace
      />
    );
  }

  // TODO: Render protected content if authenticated
  return children;
};

export default ProtectedRoute;
