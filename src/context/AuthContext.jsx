import React, { createContext, useState, useEffect } from "react";

// Crear el contexto
export const AuthContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState("maestro");
  const [userData, setUserData] = useState(null);

  // Cargar datos de autenticación desde localStorage al iniciar
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserData = localStorage.getItem("userData");
    const storedRole = localStorage.getItem("role");

    if (token && storedUserData && storedRole) {
      setUserData(JSON.parse(storedUserData));
      setRole(storedRole);
      setIsAuthenticated(true);
    }
  }, []);

  // Función para iniciar sesión
  const login = (user, userRole, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userData", JSON.stringify(user));
    localStorage.setItem("role", userRole);

    setUserData(user);
    setRole(userRole);
    setIsAuthenticated(true);
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.clear();
    setUserData(null);
    setRole("maestro");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        userData,
        login,
        logout,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
