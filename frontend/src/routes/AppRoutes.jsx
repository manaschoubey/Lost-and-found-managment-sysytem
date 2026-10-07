import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ReportLost from '../pages/ReportLost';
import ReportFound from '../pages/ReportFound';
import ItemDetails from '../pages/ItemDetails';
import UserDashboard from '../pages/UserDashboard';
import AdminDashboard from '../pages/AdminDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/report-lost" element={<ProtectedRoute><ReportLost /></ProtectedRoute>} />
        <Route path="/report-found" element={<ProtectedRoute><ReportFound /></ProtectedRoute>} />
        <Route path="/items/:type/:id" element={<ProtectedRoute><ItemDetails /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

        {/* Admin only */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
