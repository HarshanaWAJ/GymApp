import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

// Make sure these are all default exports in their respective files!
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import StoreAdminDashboard from './pages/StoreAdminDashboard';
import UserDashboard from './pages/UserDashboard';
import ProductManagement from './pages/ProductManagement';
import PurchaseHistory from './pages/PurchaseHistory';
import SalesHistory from './pages/SalesHistory';
import TrainerManagement from './pages/TrainerManagement';
import TimeSlotManagement from './pages/TimeSlotManagement';
import Appointments from './pages/Appointments';
import Reviews from './pages/Reviews';
import AppointmentManagement from './pages/AppointmentManagement';
import MyAppointments from './pages/MyAppointments';

const AppRoutes = () => {
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    setIsAuthenticated(!!token);
    setUserRole(user?.role || null);
    setLoading(false);
  }, [location]);

  const getDashboardRoute = () => {
    if (userRole === 'admin') return '/admin-dashboard';
    if (userRole === 'user') return '/user-dashboard';
    return '/login';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={getDashboardRoute()} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={getDashboardRoute()} />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to={getDashboardRoute()} />
            ) : (
              <Register />
            )
          }
        />

        {/* Admin only */}
        <Route
          path="/admin-dashboard"
          element={
            isAuthenticated && userRole === 'admin' ? (
              <StoreAdminDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* User only */}
        <Route
          path="/user-dashboard"
          element={
            isAuthenticated && userRole === 'user' ? (
              <UserDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Product Management - Admin only */}
        <Route
          path="/admin-product-management"
          element={
            isAuthenticated && userRole === 'admin' ? (
              <ProductManagement />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Purchase History - User only */}
        <Route
          path="/user-purchase-summary"
          element={
            isAuthenticated && userRole === 'user' ? (
              <PurchaseHistory />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Sales History - Admin only */}
        <Route
          path="/admin-sale-summary"
          element={
            isAuthenticated && userRole === 'admin' ? (
              <SalesHistory />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Trainer Management - Admin only */}
        <Route
          path="/admin-trainer-management"
          element={
            isAuthenticated && userRole === 'admin' ? (
              <TrainerManagement />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Trainer - Time Slots Management - Admin only */}
        <Route
          path="/admin-timeslot-management/:trainerId"
          element={
            isAuthenticated && userRole === 'admin' ? (
              <TimeSlotManagement />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        {/* Trainer - Time Slots Management - Admin only */}
        <Route
          path="/user-appointments"
          element={
            isAuthenticated && userRole === 'user' ? (
              <Appointments />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/user-rate-management/:username/:trainerId"
          element={
            isAuthenticated && userRole === 'user' ? (
              <Reviews />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
         <Route
          path="/admin-appointment-management"
          element={
            isAuthenticated && userRole === 'admin' ? (
              <AppointmentManagement />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/user-my-appointments"
          element={
            isAuthenticated && userRole === 'user' ? (
              <MyAppointments />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </>
  );
};

const App = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;
