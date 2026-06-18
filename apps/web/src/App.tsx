import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage     from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { useAuthStore } from './store/auth.store';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/dashboard" element={
          <PrivateRoute><DashboardPage /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
