import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-10 h-10 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = (user.role || '').toLowerCase();
  const normalizedAllowed = allowedRoles?.map(r => r.toLowerCase());

  if (normalizedAllowed && !normalizedAllowed.includes(userRole)) {
    const roleRoutes: Record<string, string> = {
      student: '/student',
      teacher: '/teacher',
      library_student: '/student',
      library_owner: '/library-owner',
      district_admin: '/district-admin',
      super_admin: '/super-admin',
      study_material_operator: '/operator/dashboard',
    };
    const target = roleRoutes[userRole] || '/';
    if (location.pathname.startsWith(target)) {
      return <Navigate to="/" replace />;
    }
    return <Navigate to={target} replace />;
  }

  return children ? <>{children}</> : null;
};
