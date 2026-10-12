import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ReportLost from '../pages/ReportLost';
import ReportFound from '../pages/ReportFound';
import ItemDetails from '../pages/ItemDetails';
import UserDashboard from '../pages/UserDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import AdminClaimsPage from '../pages/AdminClaimsPage';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import Chats from '../pages/Chats';
import ChatRoom from '../pages/ChatRoom';

export default function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/item/:type/:id" element={<ItemDetails />} />

        {/* Authenticated */}
        <Route path="/report-lost"  element={<ProtectedRoute><ReportLost /></ProtectedRoute>} />
        <Route path="/report-found" element={<ProtectedRoute><ReportFound /></ProtectedRoute>} />
        <Route path="/dashboard"    element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/chats"        element={<ProtectedRoute><Chats /></ProtectedRoute>} />
        <Route path="/chats/:roomId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin"        element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/claims" element={<ProtectedRoute role="ADMIN"><AdminClaimsPage /></ProtectedRoute>} />
      </Routes>
    </MainLayout>
  );
}