import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastContainer } from './components/common/ToastContainer';
import { DevRoleSwitcher } from './components/common/DevRoleSwitcher';
import { AppRoutes } from './routes/AppRoutes';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-brand-500 selection:text-white">
              <ErrorBoundary>
                <AppRoutes />
              </ErrorBoundary>
              <ToastContainer />
              <DevRoleSwitcher />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
