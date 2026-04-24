import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import ClientDashboard from './dashboards/ClientDashboard';
import CompanyDashboard from './dashboards/CompanyDashboard';
import PersonnelDashboard from './dashboards/PersonnelDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-300 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  // Redirect to specific dashboard UI based on role
  if (role === 'client') return <Navigate to="/dashboard/client" replace />;
  if (role === 'company') return <Navigate to="/dashboard/company" replace />;
  if (role === 'personnel') return <Navigate to="/dashboard/personnel" replace />;
  if (role === 'admin') return <Navigate to="/dashboard/admin" replace />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-zinc-400">Setting up your account...</p>
      </div>
    </div>
  );
}
