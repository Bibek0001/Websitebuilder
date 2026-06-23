import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { PrimaryColorProvider } from './context/PrimaryColorContext';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import PublicProfile from './pages/PublicProfile';
import BlogPostPage from './pages/BlogPost';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Regular users only — superadmins are redirected to /admin
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isSuperAdmin, authLoading } = useAuth();
  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isSuperAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

// Superadmin only — regular users are redirected to /dashboard
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isSuperAdmin, authLoading } = useAuth();
  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <PrimaryColorProvider>
            <AuthProvider>
              <ToastProvider>
                <BrowserRouter>
                  <Routes>
                    {/* ── Public marketing landing page ── */}
                    <Route path="/" element={<LandingPage />} />

                    {/* ── Each user's live personal website ── */}
                    <Route path="/site/:slug" element={<PublicProfile />} />
                    <Route path="/site/:slug/blog/:id" element={<BlogPostPage />} />

                    {/* ── Auth ── */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* ── User dashboard ── */}
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/dashboard/:tab" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

                    {/* ── SuperAdmin panel ── */}
                    <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                    <Route path="/admin/:tab" element={<AdminRoute><AdminPanel /></AdminRoute>} />

                    {/* ── Legacy redirect ── */}
                    <Route path="/profile/:slug" element={<PublicProfile />} />

                    {/* ── Catch all ── */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </BrowserRouter>
              </ToastProvider>
            </AuthProvider>
          </PrimaryColorProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
