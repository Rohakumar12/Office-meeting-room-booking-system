import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import MainLayout from './layouts/MainLayout';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import PublicRoute from './routes/PublicRoute';

// Public Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Employee Pages
import Dashboard from './pages/employee/Dashboard';
import Rooms from './pages/employee/Rooms';
import RoomDetailsPage from './pages/employee/RoomDetailsPage';
import BookRoom from './pages/employee/BookRoom';
import MyBookings from './pages/employee/MyBookings';
import BookingDetailsPage from './pages/employee/BookingDetailsPage';
import Profile from './pages/employee/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRooms from './pages/admin/AdminRooms';
import AddRoom from './pages/admin/AddRoom';
import EditRoom from './pages/admin/EditRoom';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// 404
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1e293b',
            fontSize: '13px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow:
              '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        }}
      />

      <Routes>
        {/* Public Routes (accessible only when not logged in) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Authenticated Routes with MainLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Authenticated employee and admin routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetailsPage />} />
            <Route path="/book-room" element={<BookRoom />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/bookings/:id" element={<BookingDetailsPage />} />
            <Route path="/profile" element={<Profile />} />

            {/* Admin Restricted Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/rooms" element={<AdminRooms />} />
              <Route path="/admin/rooms/add" element={<AddRoom />} />
              <Route path="/admin/rooms/:id/edit" element={<EditRoom />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
            </Route>
          </Route>
        </Route>

        {/* 404 Catch All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
