import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types";
import { supabase } from "./supabase";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem("access_token"),
  );
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = sessionStorage.getItem("user_data");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Sincronizar el token con el cliente de Supabase para RLS
  useEffect(() => {
    if (token) {
      // Configuramos la sesión en el cliente de Supabase para que Storage sepa quién es el usuario
      supabase.auth.setSession({
        access_token: token,
        refresh_token: "", // No manejamos refresh token manualmente aquí
      }).catch(err => console.error("Error setting supabase session:", err));
    }
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    sessionStorage.setItem("access_token", newToken);
    sessionStorage.setItem("user_data", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user_data");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
