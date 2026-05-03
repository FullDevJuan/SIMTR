import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './lib/AuthContext';
import { AlertProvider } from './lib/AlertContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout/Layout';
import { Login } from './pages/Login/Login';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Damnificados } from './pages/Damnificados/Damnificados';
import { DamnificadoForm } from './pages/Damnificados/DamnificadoForm';
import { DamnificadoDetalle } from './pages/Damnificados/DamnificadoDetalle';
import { Albergues } from './pages/Albergues/Albergues';
import { AlbergueForm } from './pages/Albergues/AlbergueForm';
import { AlbergueDetalle } from './pages/Albergues/AlbergueDetalle';
import { Usuarios } from './pages/Configuracion/Usuarios';
import { UsuarioForm } from './pages/Configuracion/UsuarioForm';
import { Alertas } from './pages/Alertas/Alertas';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={
              <AlertProvider>
                <Toaster />
                <Layout />
              </AlertProvider>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              
              <Route path="/damnificados" element={<Damnificados />} />
              <Route path="/damnificados/nuevo" element={<DamnificadoForm />} />
              <Route path="/damnificados/:id/editar" element={<DamnificadoForm />} />
              <Route path="/damnificados/:id" element={<DamnificadoDetalle />} />

              <Route path="/albergues" element={<Albergues />} />
              <Route path="/albergues/nuevo" element={<AlbergueForm />} />
              <Route path="/albergues/:id/editar" element={<AlbergueForm />} />
              <Route path="/albergues/:id" element={<AlbergueDetalle />} />
              
              <Route path="/alertas" element={<Alertas />} />

              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/configuracion/usuarios" element={<Usuarios />} />
                <Route path="/configuracion/usuarios/nuevo" element={<UsuarioForm />} />
                <Route path="/configuracion/usuarios/:id/editar" element={<UsuarioForm />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
