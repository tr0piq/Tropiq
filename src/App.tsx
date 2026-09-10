import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VotePage from './pages/VotePage';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
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
      <Route path="/admin/login" element={<AdminLoginPage />} />
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
