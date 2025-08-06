
import React from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AlertsManager from '@/components/alerts/AlertsManager';

const AlertsPage = () => {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6">
        <AlertsManager />
      </div>
    </ProtectedRoute>
  );
};

export default AlertsPage;
