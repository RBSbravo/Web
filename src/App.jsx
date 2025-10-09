import React, { memo, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/layout/LoadingSpinner';
import useUser from './context/useUser';
import DebugEnv from './components/DebugEnv';

// Lazy load pages to reduce initial bundle size
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Tickets = lazy(() => import('./pages/Tickets'));
const Kanban = lazy(() => import('./pages/Kanban'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Reports = lazy(() => import('./pages/Reports'));
const Employees = lazy(() => import('./pages/Employees'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

const PageLoadingFallback = () => (
  <LoadingSpinner overlay message="Loading page..." />
);

  // Protected Route Component
  const ProtectedRoute = memo(({ children }) => {
  const { user } = useUser();
  
    if (!user || !user.isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
  
    return children;
  });
  ProtectedRoute.displayName = 'ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              {/* Public Route: Only login, registration is inline */}
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/register" element={<Navigate to="/login" replace />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              {/* Protected Routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={
                  <>
                    <DebugEnv />
                    <Dashboard />
                  </>
                } />
                <Route path="tasks/:id" element={<Tasks />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="tickets/:id" element={<Tickets />} />
                <Route path="tickets" element={<Tickets />} />
                <Route path="kanban" element={<Kanban />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="reports" element={<Reports />} />
                <Route path="employees" element={<Employees />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
