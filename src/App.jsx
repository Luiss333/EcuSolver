import React, { useState, useContext, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, CssBaseline, IconButton } from "@mui/material";
import { Box, CircularProgress } from "@mui/material";
import { AuthContext } from "./context/AuthContext";
import { useModal } from "./hooks/useModal";
import { loginUser, registerUser } from "./services/api";
import { lightTheme, darkTheme } from "./theme";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LoginDialog from "./components/LoginDialog";
import RegisterDialog from "./components/RegisterDialog";
import ChangePasswordModal from "./components/ChangePasswordModal";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import "./App.css";

function App() {
  const { isAuthenticated, role, userData, login, logout } =
    useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [equations, setEquations] = useState(["", ""]);
  const [registroAlumno, setRegistroAlumno] = useState({
    correo: "",
    contraseña: "",
    nombre_s: "",
    apellidoP: "",
    apellidoM: "",
    boleta: "",
    codigoClase: "",
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const loginModal = useModal();
  const registerModal = useModal();

  // Estados para cambio de contraseña forzado
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token || token === "undefined" || token === "null") {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch("https://backend-tt-209366905887.us-central1.run.app/verify-token", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Token inválido o expirado");
        }

        const data = await response.json();

        // Aquí restauras el usuario y el rol en el contexto
        if (data.alumno) {
          login(data.alumno, "alumno", token);
        } else if (data.user) {
          login(data.user, data.role, token);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error al verificar el token:", error.message);
        localStorage.removeItem("token");
        logout();
        setIsLoading(false);
      }
    };

    verifyToken();
    // eslint-disable-next-line
  }, []);

  const handleLogin = async () => {
    try {
      const data = await loginUser(email, password);

      // Detecta si requiere cambio de contraseña
      const requiereCambio =
        (data.user && !!data.user.requiere_cambio) ||
        (data.alumno && !!data.alumno.requiere_cambio);

      if (requiereCambio) {
        setShowChangePasswordModal(true);
        setPendingUser({ correo: email, role: data.role });
        loginModal.closeModal();
        return;
      }

      login(data.user || data.alumno, data.role, data.token);
      loginModal.closeModal();
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      showSnackbar("Error al iniciar sesión: " + error.message, "error");
    }
  };

  const handleRegisterAlumno = async (e) => {
    e.preventDefault();
    try {
      await registerUser(registroAlumno);
      showSnackbar("Registro exitoso", "success");
      setRegistroAlumno({
        correo: "",
        contraseña: "",
        nombre_s: "",
        apellidoP: "",
        apellidoM: "",
        boleta: "",
        numeroEmpleado: "",
        codigoClase: "",
        rol: "alumno",
      });
      registerModal.closeModal();
    } catch (error) {
      showSnackbar("Error al registrar: " + error.message, "error");
    }
  };

  const handleChangePasswordSuccess = () => {
    setShowChangePasswordModal(false);
    setPendingUser(null);
    showSnackbar(
      "Contraseña cambiada correctamente. Ahora puedes iniciar sesión.",
      "success"
    );
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <Router>
          <div className="app-container">
            <IconButton
              onClick={toggleTheme}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                color: "inherit",
              }}
            >
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <AppRoutes
              isAuthenticated={isAuthenticated}
              role={role}
              userData={userData}
              equations={equations}
              setEquations={setEquations}
              handleLogout={logout}
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
              onLoginClick={loginModal.openModal}
              onRegisterClick={registerModal.openModal}
            />
            <LoginDialog
              open={loginModal.isOpen}
              onClose={loginModal.closeModal}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              role={role}
              onLogin={handleLogin}
            />
            <RegisterDialog
              open={registerModal.isOpen}
              onClose={registerModal.closeModal}
              registroAlumno={registroAlumno}
              setRegistroAlumno={setRegistroAlumno}
              onRegister={handleRegisterAlumno}
            />
            <ChangePasswordModal
              open={showChangePasswordModal}
              onClose={() => setShowChangePasswordModal(false)}
              correo={pendingUser?.correo}
              role={pendingUser?.role}
              onSuccess={handleChangePasswordSuccess}
            />
          </div>
        </Router>
      </ThemeProvider>
    </>
  );
}

export default App;
