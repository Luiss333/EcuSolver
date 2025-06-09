import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AlumnoView from "../components/Alumno/AlumnoView";
import MaestroView from "../components/Maestro/MaestroView";
import GuestView from "../components/Invitado/GuestView";
import WelcomeScreen from "../components/WelcomeScreen";

const AppRoutes = ({
  isAuthenticated,
  role,
  userData,
  grupos,
  equations,
  setEquations,
  handleLogout,
  isDarkMode,
  toggleTheme,
  onLoginClick,
  onRegisterClick,
}) => {
  return (
    <Routes>
      {/* Ruta pública para la pantalla de bienvenida */}
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <WelcomeScreen
              onLoginClick={onLoginClick}
              onRegisterClick={onRegisterClick}
              isDarkMode={isDarkMode}

            />
          ) : (
            <Navigate to={role === "maestro" ? "/maestro" : "/alumno"} />
          )
        }
      />

      {/* Ruta pública para invitados */}
      <Route
        path="/guest"
        element={
          <GuestView
            equations={equations}
            setEquations={setEquations}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
          />
        }
      />

      {/* Rutas privadas */}
      <Route
        path="/maestro"
        element={
          isAuthenticated && role === "maestro" ? (
            <MaestroView
              userData={userData}
              grupos={grupos}
              equations={equations}
              setEquations={setEquations}
              onLogout={handleLogout}
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/alumno"
        element={
          isAuthenticated && role === "alumno" ? (
            <AlumnoView
              userData={userData}
              equations={equations}
              setEquations={setEquations}
              onLogout={handleLogout}
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* Ruta por defecto para redirigir a la pantalla de bienvenida */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
