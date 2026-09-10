import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VotePage from './pages/VotePage';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';

function App() {
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
    </>
  );
}

export default App;
