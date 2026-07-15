import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Loader2 } from "lucide-react";

/**
 * Route guard with:
 * - Auth loading state (#7) — shows spinner while hydrating from storage
 * - Role-based access control (#6) — restricts routes by role
 * - Redirect to /login if unauthenticated
 * - Redirect to /dashboard if authenticated but unauthorized role
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useAuth();

  // Still hydrating from localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-accent-500" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role check
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role?.toUpperCase?.() || user.role;
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
