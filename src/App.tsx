import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import VotePage from './pages/VotePage';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import AdPopup from './components/AdPopup';

function App() {
  const [showGlobalAd, setShowGlobalAd] = useState(false);

  useEffect(() => {
    const adInterval = setInterval(() => {
      // Don't show on admin routes
      if (!window.location.pathname.startsWith('/admin')) {
        setShowGlobalAd(true);
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(adInterval);
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vote" element={<VotePage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* /admin/login now just redirects to regular login */}
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
      </Routes>
      <AdPopup show={showGlobalAd} onClose={() => setShowGlobalAd(false)} />
    </>
  );
}

export default App;
