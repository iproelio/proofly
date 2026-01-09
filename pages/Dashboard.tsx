
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser, getSessionBusiness } from '../services/auth';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import ClientDashboard from './ClientDashboard';

const Dashboard: React.FC = () => {
  const user = getCurrentUser();
  const business = getSessionBusiness();

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case 'ADMIN':
      // Added business prop as it is required by AdminDashboard
      // Added: subview="logs" to satisfy AdminDashboard required props
      return business ? <AdminDashboard user={user} business={business} subview="logs" /> : <Navigate to="/login" />;
    case 'EMPLOYEE':
      // Added business prop as it is required by EmployeeDashboard
      return business ? <EmployeeDashboard user={user} business={business} /> : <Navigate to="/login" />;
    case 'CLIENT':
      return <ClientDashboard user={user} />;
    default:
      return <Navigate to="/login" />;
  }
};

export default Dashboard;
