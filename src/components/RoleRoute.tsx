import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRole: string;
}

export default function RoleRoute({ children, allowedRole }: RoleRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-300 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 pt-20">
      {children}
    </div>
  );
}
