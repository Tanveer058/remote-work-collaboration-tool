import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContex';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import RootRedirect from './components/auth/RootRedirect';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import TeamLeadDashboard from './pages/teamLead/TeamLeadDashboard';
import MemberDashboard from './pages/member/MemeberDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Toast Container */}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              style={{
                position: 'fixed',
                top: '80px',
                right: '20px',
                zIndex: 9999,
              }}
            />
            
            <Routes>
              {/* Public routes with protection for logged-in users */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
              
              {/* Root path redirects based on auth status */}
              <Route 
                path="/" 
                element={<RootRedirect />} 
              />
              
              {/* Manager routes */}
              <Route
                path="/manager/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Team Lead routes */}
              <Route
                path="/teamlead/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['teamlead']}>
                    <TeamLeadDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Member routes */}
              <Route
                path="/member/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['member']}>
                    <MemberDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Additional routes for managers */}
              <Route
                path="/manager/*"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Additional routes for team leads */}
              <Route
                path="/teamlead/*"
                element={
                  <ProtectedRoute allowedRoles={['teamlead']}>
                    <TeamLeadDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Additional routes for members */}
              <Route
                path="/member/*"
                element={
                  <ProtectedRoute allowedRoles={['member']}>
                    <MemberDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Unauthorized page */}
              <Route
                path="/unauthorized"
                element={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Unauthorized
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        You don't have permission to access this page.
                      </p>
                    </div>
                  </div>
                }
              />
              
              {/* Catch all route */}
              <Route 
                path="*" 
                element={<RootRedirect />} 
              />
            </Routes>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
