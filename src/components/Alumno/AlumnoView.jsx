import React, { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Paper,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
  CssBaseline,
} from "@mui/material";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AssignmentIcon from "@mui/icons-material/Assignment";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import CloseIcon from "@mui/icons-material/Close";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import MenuIcon from "@mui/icons-material/Menu";
import SchoolIcon from "@mui/icons-material/School";

import Simulador from "../Simulador/Simulador";
import About from "../About";
import ChatWindow from "../ChatWindow";
import Contact from "../Contact";
import EjerciciosTable from "./EjerciciosTable";
import Footer from "../Footer";
import CuentaAlumnoView from "./CuentaAlumnoView";
import "./AlumnoView.css";
import FAQ from "./FAQ";
import MultimediosAlumno from "./MultimediosAlumno";
import Tooltip from "@mui/material/Tooltip";

import { Tabs, Tab, TextField } from "@mui/material";

import SimulacionesTable from "./SimulacionesTable";
import { guardarSimulacion } from "../api/simulaciones";

import {
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const ChatBubble = ({ onClick, isVisible }) => {
  // Detecta modo dark desde el theme de MUI
  const isDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return (
    isVisible && (
      <Tooltip title="Abrir chat grupal" placement="left" arrow>
        <Box
          onClick={onClick}
          sx={{
            position: "fixed",
            bottom: { xs: 24, sm: 32 },
            right: { xs: 16, sm: 32 },
            width: { xs: 54, sm: 64 },
            height: { xs: 54, sm: 64 },
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(124,58,237,0.95)" // morado oscuro translúcido
                : "rgba(30,60,114,0.95)", // azul translúcido
            border: (theme) =>
              `2.5px solid ${
                theme.palette.mode === "dark" ? "#ffd700" : "#7c3aed"
              }`,
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: (theme) =>
              theme.palette.mode === "dark" ? "#ffd700" : "#fff",
            cursor: "pointer",
            boxShadow:
              "0 6px 24px 0 rgba(30,60,114,0.18), 0 1.5px 6px 0 rgba(0,0,0,0.10)",
            transition: "box-shadow 0.2s, transform 0.2s",
            "&:hover": {
              boxShadow:
                "0 8px 32px 0 rgba(124,58,237,0.25), 0 2px 8px 0 rgba(0,0,0,0.15)",
              transform: "scale(1.08)",
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(124,58,237,1)"
                  : "rgba(30,60,114,1)",
            },
            zIndex: 1300,
          }}
        >
          <ChatBubbleIcon sx={{ fontSize: { xs: 30, sm: 36 } }} />
        </Box>
      </Tooltip>
    )
  );
};

function AlumnoView({
  userData,
  equations,
  setEquations,
  onLogout,
  isDarkMode,
  toggleTheme,
}) {
  const [archivos, setArchivos] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentView, setCurrentView] = useState("home");
  const [openChats, setOpenChats] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [idAlumno, setIdAlumno] = useState(null);
  const [links, setLinks] = useState([]);
  const tiposMultimedia = ["Video", "Audio", "Imagen", "PDF", "Otro"];
  const [tabIndex, setTabIndex] = useState(0);
  const [tipoTabIndex, setTipoTabIndex] = useState(0);
  const [defaultValues, setDefaultValues] = useState({});
  const [refreshSimulaciones, setRefreshSimulaciones] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [simName, setSimName] = useState("");
  const [simDesc, setSimDesc] = useState("");

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await fetch(
          "https://backend-tt-209366905887.us-central1.run.app/links-multimedia-publico"
        );
        const data = await res.json();
        setLinks(data.links);
      } catch (e) {
        console.error("Error al obtener links:", e);
      }
    };
    fetchLinks();
  }, []);

  useEffect(() => {
    const fetchAlumnoId = async () => {
      const alumnoId = await obtenerAlumnoId();

      if (alumnoId) {
        //console.log(`El ID del alumno es: ${alumnoId}`);
        setIdAlumno(alumnoId);
      }
    };

    fetchAlumnoId();
  }, []);

  // useEffect(() => {
  //   console.log("userData en AlumnoView:", userData);
  // }, []);

  useEffect(() => {
    const fetchArchivos = async () => {
      try {
        const response = await fetch(
          `https://backend-tt-209366905887.us-central1.run.app/archivos/${userData.grupoAL}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        setArchivos(data.archivos);
        //console.log("Archivos obtenidos:", data.archivos);
      } catch (error) {
        console.error("Error al obtener los archivos:", error);
      }
    };

    fetchArchivos();
  }, [userData.grupoAL]);

  const obtenerAlumnoId = async () => {
    try {
      const token = localStorage.getItem("token"); // Obtén el token del almacenamiento local
      const response = await fetch(`https://backend-tt-209366905887.us-central1.run.app/alumno/id`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al obtener el ID del alumno:", errorData.message);
        return null;
      }

      const data = await response.json();
      //console.log("ID del alumno obtenido:", data.alumnoId);
      return data.alumnoId;
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      return null;
    }
  };

  const handleDownload = async (rutaArchivo, nombreArchivo) => {
    try {
      const response = await fetch(`https://backend-tt-209366905887.us-central1.run.app/${rutaArchivo}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al descargar el archivo");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
    }
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const openChat = (groupName) => {
    if (!openChats.includes(groupName)) {
      setOpenChats([...openChats, groupName]);
    }
    setIsChatOpen(true);
  };

  const closeChat = (groupName) => {
    setOpenChats(openChats.filter((chat) => chat !== groupName));
    setIsChatOpen(false);
  };

  if (!userData) {
    return <p>Cargando datos del usuario...</p>;
  }

  function getSaludoPorHora() {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 12) return "Buenos días";
    if (hora >= 12 && hora < 19) return "Buenas tardes";
    return "Buenas noches";
  }

  return (
    <>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={4}
        sx={{
          background: isDarkMode
            ? "linear-gradient(90deg, #232526 0%, #414345 100%)"
            : "linear-gradient(90deg, #00BFFF 0%, #BA55D3 100%)",
          color: isDarkMode ? "grey.300" : "white",
          boxShadow: "0 4px 24px rgba(40,62,81,0.15)",
          borderBottomLeftRadius: "18px",
          borderBottomRightRadius: "18px",
          height: "64px",
          justifyContent: "center",
        }}
      >
        <Toolbar
          sx={{ px: 2, minHeight: "64px !important", display: "flex", gap: 2 }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          {/* Bienvenido a la izquierda, ocupa el espacio necesario */}
          <Box
            sx={{
              minWidth: 0,
              flexShrink: 1,
              flexGrow: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                letterSpacing: 1,
                textShadow: "0 1px 4px rgba(0,0,0,0.15)",
                maxWidth: { xs: 180, sm: 320, md: 420, lg: 600 },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Estudiante:{" "}
              {`${userData.nombre_s} ${userData.apellidoP} ${userData.apellidoM}`}
            </Typography>
          </Box>
          {/* Tabs a la derecha, ocupan todo el espacio restante */}
          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Tabs
              value={[
                "home",
                "simulador",
                "faq",
                "multimedios",
                "contact",
                "about",
              ].indexOf(currentView)}
              onChange={(_, idx) => {
                const views = [
                  "home",
                  "simulador",
                  "faq",
                  "multimedios",
                  "contact",
                  "about",
                ];
                setCurrentView(views[idx]);
              }}
              textColor="inherit"
              TabIndicatorProps={{
                style: { backgroundColor: "#f4f4f4" },
              }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 48,
                "& .MuiTab-root": { minHeight: 48, fontWeight: 500 },
                ml: 2,
              }}
            >
              <Tab label="Inicio" />
              <Tab label="Simulador" />
              <Tab label="FAQ" />
              <Tab label="Multimedios" />
              <Tab label="Contacto" />
              <Tab label="Acerca de" />
            </Tabs>
          </Box>
          {/* Botón de tema alineado al extremo derecho */}
          <IconButton onClick={toggleTheme} color="inherit" sx={{ ml: 2 }}>
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          style: {
            top: 64,
            background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
            color: "white",
            borderTopRightRadius: "20px",
            width: "260px",
            boxShadow: "0 8px 24px rgba(30,60,114,0.2)",
          },
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 16px 0 8px",
          }}
        >
          <IconButton onClick={toggleDrawer(false)} style={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" style={{ marginLeft: 8, fontWeight: 600 }}>
            Menú
          </Typography>
        </div>
        <List>
          <ListItem
            button
            onClick={() => {
              setCurrentView("ejercicios");
              setDrawerOpen(false);
            }}
          >
            <AssignmentIcon style={{ marginRight: 16 }} />
            <ListItemText primary="Ejercicios" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setCurrentView("cuenta");
              setDrawerOpen(false);
            }}
          >
            <AccountCircleIcon style={{ marginRight: 16 }} />
            <ListItemText primary="Cuenta" />
          </ListItem>
          <ListItem button onClick={onLogout}>
            <ExitToAppIcon style={{ marginRight: 16 }} />
            <ListItemText primary="Cerrar Sesión" />
          </ListItem>
        </List>
      </Drawer>
      <div style={{ padding: "20px", marginTop: "64px" }}>
        {currentView === "home" && (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: { xs: 180, sm: 220, md: 250 },
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
                    : "linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)",
                borderRadius: { xs: 2, sm: 4 },
                boxShadow: "0 4px 24px rgba(30,60,114,0.10)",
                color: (theme) =>
                  theme.palette.mode === "dark" ? "#fff" : "#232526",
                mb: 4,
                p: { xs: 2, sm: 4 },
                width: "100%",
                maxWidth: 600,
                mx: "auto",
                textAlign: "center",
                transition: "background 0.3s",
              }}
            >
              <SchoolIcon
                sx={{
                  fontSize: { xs: 44, sm: 60 },
                  mb: 2,
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#ffd700" : "#7c3aed",
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  fontSize: { xs: 22, sm: 28 },
                  letterSpacing: 0.5,
                }}
              >
                {getSaludoPorHora()}, Estudiante
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 400,
                  opacity: 0.92,
                  fontSize: { xs: 16, sm: 20 },
                }}
              >
                Selecciona una opción del menú para comenzar.
              </Typography>
            </Box>
          </>
        )}
        {currentView === "simulador" && (
          <Box>
            <Simulador
              equations={equations}
              setEquations={setEquations}
              isDarkMode={isDarkMode}
              defaultValues={defaultValues}
            />
            {/* Botón para guardar simulación centrado */}
            <Box
              sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}
            >
              <Button
                variant="contained"
                onClick={() => setSaveDialogOpen(true)}
              >
                Guardar simulación
              </Button>
            </Box>
            <SimulacionesTable
              alumnoId={userData.id}
              onLoadSimulacion={({ equations, defaultValues }) => {
                setEquations(equations);
                setDefaultValues(defaultValues);
              }}
              refreshKey={refreshSimulaciones}
            />
          </Box>
        )}

        {/* Dialog para guardar simulación */}
        <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
          <DialogTitle>Guardar simulación</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre de la simulación"
              fullWidth
              value={simName}
              onChange={(e) => setSimName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Descripción (opcional)"
              fullWidth
              value={simDesc}
              onChange={(e) => setSimDesc(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaveDialogOpen(false)} color="secondary">
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!simName.trim()) {
                  setSnackbar({
                    open: true,
                    message: "El nombre es obligatorio",
                    severity: "warning",
                  });
                  return;
                }
                await guardarSimulacion({
                  alumno_id: userData.id,
                  name: simName,
                  description: simDesc,
                  equations,
                });
                setRefreshSimulaciones((prev) => prev + 1);
                setSnackbar({
                  open: true,
                  message: "Simulación guardada",
                  severity: "success",
                });
                setSaveDialogOpen(false);
                setSimName("");
                setSimDesc("");
              }}
              variant="contained"
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        {currentView === "multimedios" && (
          <MultimediosAlumno
            archivos={archivos}
            handleDownload={handleDownload}
            links={links}
            tabIndex={tabIndex}
            setTabIndex={setTabIndex}
            tipoTabIndex={tipoTabIndex}
            setTipoTabIndex={setTipoTabIndex}
            tiposMultimedia={tiposMultimedia}
          />
        )}
        {currentView === "ejercicios" && (
          <>
            <EjerciciosTable
              id={userData.id}
              grupoAL={userData.grupoAL}
              token={localStorage.getItem("token")}
              equations={equations}
              setEquations={setEquations}
            />
          </>
        )}
        {openChats.map((groupName, index) => (
          <ChatWindow
            key={groupName}
            groupName={groupName}
            userData={userData}
            token={localStorage.getItem("token")}
            onClose={() => closeChat(groupName)}
            className={`chat-window ${isChatOpen ? "open" : "closed"}`}
            style={{ right: `${index * 310}px` }}
          />
        ))}
        {currentView === "about" && <About isDarkMode={isDarkMode} />}
        {currentView === "contact" && <Contact isDarkMode={isDarkMode} />}
        {currentView === "cuenta" && (
          <CuentaAlumnoView userData={userData} onUpdate={() => {}} />
        )}
        {currentView === "faq" && <FAQ isDarkMode={isDarkMode} />}
      </div>
      <Box
        sx={{
          position: "fixed",
          right: { xs: 16, sm: 32 },
          bottom: { xs: 80, sm: 90 },
          zIndex: 1300,
        }}
      >
        {/* Solo muestra la burbuja si el alumno tiene grupo */}
        {userData.grupoAL && (
          <ChatBubble
            onClick={() => openChat(userData.grupoAL)}
            isVisible={!isChatOpen}
          />
        )}
      </Box>
      <Footer isDarkMode={isDarkMode} />
    </>
  );
}

export default AlumnoView;
