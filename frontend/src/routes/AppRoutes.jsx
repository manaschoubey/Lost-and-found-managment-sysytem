import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ReportLost from '../pages/ReportLost';
import ReportFound from '../pages/ReportFound';
import ItemDetails from '../pages/ItemDetails';
import UserDashboard from '../pages/UserDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

export default function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/report-lost" element={
          <ProtectedRoute><ReportLost /></ProtectedRoute>} />
        <Route path="/report-found" element={
          <ProtectedRoute><ReportFound /></ProtectedRoute>} />
        <Route path="/item/:type/:id" element={<ItemDetails />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={
          <ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </MainLayout>
  );
}