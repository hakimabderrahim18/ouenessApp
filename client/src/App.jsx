import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleGuard from './components/common/RoleGuard';
import MainLayout from './components/layout/MainLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WarehouseDashboard from './pages/WarehouseDashboard';
import DriverMobile from './pages/DriverMobile';
import SeniorManagement from './pages/SeniorManagement';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Inventory from './pages/Inventory';
import Shipments from './pages/Shipments';
import Tracking from './pages/Tracking';
import RoutesPage from './pages/Routes';
import Documents from './pages/Documents';
import AiAssistant from './pages/AiAssistant';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Home / Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes wrapped in MainLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/warehouse" element={<WarehouseDashboard />} />
              <Route path="/driver-mobile" element={<DriverMobile />} />
              <Route path="/senior-management" element={<SeniorManagement />} />

              <Route
                path="/users"
                element={
                  <RoleGuard permission="users:view">
                    <Users />
                  </RoleGuard>
                }
              />

              <Route
                path="/roles"
                element={
                  <RoleGuard permission="roles:view">
                    <Roles />
                  </RoleGuard>
                }
              />

              <Route
                path="/inventory"
                element={
                  <RoleGuard permission="inventory:view">
                    <Inventory />
                  </RoleGuard>
                }
              />

              <Route
                path="/shipments"
                element={
                  <RoleGuard permission="shipments:view">
                    <Shipments />
                  </RoleGuard>
                }
              />

              <Route
                path="/tracking"
                element={
                  <RoleGuard permission="tracking:view">
                    <Tracking />
                  </RoleGuard>
                }
              />

              <Route
                path="/routes"
                element={
                  <RoleGuard permission="shipments:view">
                    <RoutesPage />
                  </RoleGuard>
                }
              />

              <Route
                path="/ai-assistant"
                element={
                  <RoleGuard permission="ai_assistant:view">
                    <AiAssistant />
                  </RoleGuard>
                }
              />

              <Route
                path="/documents"
                element={
                  <RoleGuard permission="documents:view">
                    <Documents />
                  </RoleGuard>
                }
              />

              <Route
                path="/reports"
                element={
                  <RoleGuard permission="reports:view">
                    <Reports />
                  </RoleGuard>
                }
              />

              <Route
                path="/audit"
                element={
                  <RoleGuard permission="audit:view">
                    <AuditLogs />
                  </RoleGuard>
                }
              />
            </Route>

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
