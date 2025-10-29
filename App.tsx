
import React, { useContext, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import Layout from './components/Layout';
import { AuthContext } from './contexts/AuthContext';
import { UserRole } from './types';

// Lazy load the large dashboard components to split them into separate chunks
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ParticipantDashboard = lazy(() => import('./pages/ParticipantDashboard'));

const App: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return <div>Loading...</div>;
  }
  const { user } = authContext;

  const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    return user && user.role === UserRole.ADMIN ? children : <Navigate to="/auth" />;
  };

  const ParticipantRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    return user && user.role === UserRole.PARTICIPANT ? children : <Navigate to="/auth" />;
  };

  const loadingFallback = (
    <div className="flex justify-center items-center w-full h-full p-20">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-400"></div>
    </div>
  );

  return (
    <HashRouter>
      <Layout>
        <Suspense fallback={loadingFallback}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/participant" 
              element={
                <ParticipantRoute>
                  <ParticipantDashboard />
                </ParticipantRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Layout>
    </HashRouter>
  );
};

export default App;