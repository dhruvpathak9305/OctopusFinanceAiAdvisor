import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MOBILE_ROUTES } from '../../routes/mobileRoutes';

interface MobileProtectedRouteProps {
  children: React.ReactNode;
}

const MobileProtectedRoute: React.FC<MobileProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Redirect non-authenticated users to auth page
  if (!loading && !user) {
    return <Navigate to={MOBILE_ROUTES.AUTH} state={{ from: location.pathname }} replace />;
  }

  // Show loading indicator while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-pulse text-center">
          <div className="inline-block rounded-full h-12 w-12 border-4 border-l-emerald border-r-emerald border-b-transparent border-t-transparent animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default MobileProtectedRoute; 