import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout/Layout';
import { Login } from './pages/Login/Login';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Damnificados } from './pages/Damnificados/Damnificados';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/damnificados" element={<Damnificados />} />
              {/* Fallback de layout */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
          
          {/* Default redir */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
