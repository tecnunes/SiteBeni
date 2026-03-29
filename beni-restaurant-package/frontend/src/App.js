import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Menu from './pages/Menu';
import WeeklyMenu from './pages/WeeklyMenu';
import Gallery from './pages/Gallery';
import Reservations from './pages/Reservations';
import EventPage from './pages/EventPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import './App.css';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-white/50">Chargement...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

// Layout for public pages
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

function AppContent() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          } 
        />
        <Route 
          path="/about" 
          element={
            <PublicLayout>
              <About />
            </PublicLayout>
          } 
        />
        <Route 
          path="/menu" 
          element={
            <PublicLayout>
              <Menu />
            </PublicLayout>
          } 
        />
        <Route 
          path="/weekly-menu" 
          element={
            <PublicLayout>
              <WeeklyMenu />
            </PublicLayout>
          } 
        />
        <Route 
          path="/gallery" 
          element={
            <PublicLayout>
              <Gallery />
            </PublicLayout>
          } 
        />
        <Route 
          path="/reservations" 
          element={
            <PublicLayout>
              <Reservations />
            </PublicLayout>
          } 
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

        {/* Event Page (Hidden - only accessible via direct link) */}
        <Route path="/evento/:linkCode" element={<EventPage />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#121212',
            color: '#f5f5f0',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      />
    </BrowserRouter>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
