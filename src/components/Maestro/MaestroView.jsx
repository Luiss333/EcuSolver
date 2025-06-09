import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  CssBaseline,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AssignmentIcon from "@mui/icons-material/Assignment";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import CloseIcon from "@mui/icons-material/Close";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import GroupIcon from "@mui/icons-material/Group";
import MenuIcon from "@mui/icons-material/Menu";
import SchoolIcon from "@mui/icons-material/School";

import About from "../About";
import ChatWindow from "../ChatWindow";
import Contact from "../Contact";
import EjerciciosView from "./EjerciciosView";
import Footer from "./Footer";
import GruposView from "./GruposView";
import MultimediosView from "./MultimediosView";
import Simulador from "../Simulador/Simulador";
import FAQ from "./FAQ";
import CuentaView from "./CuentaView";
import SimulacionesMaestroTable from "./SimulacionesMaestroTable";

function MaestroView({
  userData,
  equations,
  setEquations,
  onLogout,
  isDarkMode,
  toggleTheme,
}) {
  const [grupos, setGrupos] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentView, setCurrentView] = useState("home"); // Estado para controlar la vista actual
  const [openChats, setOpenChats] = useState([]);
  const [defaultValues, setDefaultValues] = useState({});
  const [refreshSimulaciones, setRefreshSimulaciones] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [simDialogOpen, setSimDialogOpen] = useState(false);
  const [simName, setSimName] = useState("");
  const [simDesc, setSimDesc] = useState("");
  const [simLoading, setSimLoading] = useState(false);

  const fetchGrupos = async () => {
    try {
      const response = await fetch("https://backend-tt-209366905887.us-central1.run.app/grupos", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al obtener los grupos:", errorData.message);

        if (errorData.message === "Token inválido o expirado") {
          setSnackbar({
            open: true,
            message:
              "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
            severity: "error",
          });
          localStorage.removeItem("token");
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
        }
        return;
      }

      const data = await response.json();
      setGrupos(data.grupos);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error en la solicitud de grupos.",
        severity: "error",
      });
      console.error("Error en la solicitud:", error);
    }
  };

  useEffect(() => {
    fetchGrupos();
  }, []);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  if (!userData) {
    return <p>Cargando datos del usuario...</p>;
  }

  const handleCreateExercise = async (exercise) => {
    try {
      const response = await fetch("https://backend-tt-209366905887.us-central1.run.app/ejercicios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(exercise),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.message || "Error al crear el ejercicio",
          severity: "error",
        });
        return;
      }

      setSnackbar({
        open: true,
        message: "Ejercicio creado con éxito",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error en la solicitud al crear el ejercicio",
        severity: "error",
      });
      console.error("Error en la solicitud:", error);
    }
  };

  const openChat = (groupName) => {
    if (!openChats.includes(groupName)) {
      setOpenChats([...openChats, groupName]);
    }
  };

  const closeChat = (groupName) => {
    setOpenChats(openChats.filter((chat) => chat !== groupName));
  };

  function getSaludoPorHora() {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 12) return "Buenos días";
    if (hora >= 12 && hora < 19) return "Buenas tardes";
    return "Buenas noches";
  }

  const guardarSimulacionMaestro = async ({ name, description, equations }) => {
    const token = localStorage.getItem("token");
    await fetch("https://backend-tt-209366905887.us-central1.run.app/simulaciones-maestro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description, equations }),
    });
  };

  return (
    <>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={4}
        sx={{
          background: isDarkMode
            ? "linear-gradient(90deg, #232526 0%, #414345 100%)"
            : "linear-gradient(90deg, #283e51 0%, #485563 100%)",
          color: isDarkMode ? "grey.300" : "white",
          boxShadow: "0 4px 24px rgba(40,62,81,0.15)",
          borderBottomLeftRadius: "18px",
          borderBottomRightRadius: "18px",
          height: "64px",
          justifyContent: "center",
        }}
      >
        <Toolbar
          sx={{ minHeight: "64px", display: "flex", alignItems: "center" }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{
              background: "rgba(255,255,255,0.08)",
              mr: 2,
              "&:hover": { background: "rgba(255,255,255,0.18)" },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: "1px",
              color: "#fff",
              textShadow: "0 2px 8px rgba(40,62,81,0.15)",
            }}
          >
            Docente:{" "}
            {`${userData.nombre_s} ${userData.apellidoP} ${userData.apellidoM}`}
          </Typography>
          <Button
            color="inherit"
            onClick={() => setCurrentView("home")}
            sx={{ fontWeight: 500, mx: 1 }}
          >
            Inicio
          </Button>
          <Button
            color="inherit"
            onClick={() => setCurrentView("simulador")}
            sx={{ fontWeight: 500, mx: 1 }}
          >
            Simulador
          </Button>
          <Button
            color="inherit"
            onClick={() => setCurrentView("FAQ")}
            sx={{ fontWeight: 500, mx: 1 }}
          >
            FAQ
          </Button>
          <Button
            color="inherit"
            onClick={() => setCurrentView("multimedios")}
            sx={{ fontWeight: 500, mx: 1 }}
          >
            Multimedios
          </Button>
          <Button
            color="inherit"
            onClick={() => setCurrentView("contact")}
            sx={{ fontWeight: 500, mx: 1 }}
          >
            Contacto
          </Button>
          <Button
            color="inherit"
            onClick={() => setCurrentView("about")}
            sx={{ fontWeight: 500, mx: 1 }}
          >
            Acerca de
          </Button>
          <IconButton
            onClick={toggleTheme}
            color="inherit"
            sx={{
              ml: 2,
              background: "rgba(255,255,255,0.08)",
              "&:hover": { background: "rgba(255,255,255,0.18)" },
            }}
          >
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
            background: isDarkMode
              ? "linear-gradient(90deg, #232526 0%, #414345 100%)"
              : "linear-gradient(90deg, #283e51 0%, #485563 100%)",
            color: isDarkMode ? "grey.300" : "white",
            borderTopRightRadius: "20px",
            width: "260px",
            boxShadow: "0 8px 24px rgba(40,62,81,0.2)",
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
              setCurrentView("grupos");
              setDrawerOpen(false);
            }}
          >
            <GroupIcon style={{ marginRight: 16 }} />
            <ListItemText primary="Grupos" />
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: { xs: 180, sm: 220, md: 250 },
              background: (theme) =>
                isDarkMode
                  ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
                  : "linear-gradient(135deg, #283e51 0%, #485563 100%)",
              borderRadius: { xs: 2, sm: 4 },
              boxShadow: "0 4px 24px rgba(30,60,114,0.10)",
              color: (theme) => (isDarkMode ? "#fff" : "#fff"),
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
                color: isDarkMode ? "#ffd700" : "#ffd700",
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
              {getSaludoPorHora()}, Docente
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
        )}
        {currentView === "grupos" && (
          <GruposView
            grupos={grupos}
            openChat={openChat}
            fetchGrupos={fetchGrupos}
          />
        )}
        {openChats.map((groupName, index) => (
          <ChatWindow
            key={groupName}
            groupName={groupName}
            userData={userData}
            token={localStorage.getItem("token")}
            onClose={() => closeChat(groupName)}
            style={{ right: `${index * 310}px` }} // Espaciado entre ventanas
          />
        ))}
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
                onClick={() => setSimDialogOpen(true)}
              >
                Guardar simulación
              </Button>
            </Box>
            <SimulacionesMaestroTable
              onLoadSimulacion={({
                equations,
                defaultValues,
                simulacionId,
              }) => {
                setEquations(equations);
                setDefaultValues(defaultValues);
              }}
              refreshKey={refreshSimulaciones}
            />
          </Box>
        )}
        {currentView === "ejercicios" && (
          <EjerciciosView
            grupos={grupos}
            onCreateExercise={handleCreateExercise}
            equations={equations}
            setEquations={setEquations}
            isDarkMode={isDarkMode}
          />
        )}
        {currentView === "multimedios" && (
          <MultimediosView grupos={grupos} isDarkMode={isDarkMode} />
        )}
        {currentView === "about" && <About isDarkMode={isDarkMode} />}
        {currentView === "contact" && <Contact isDarkMode={isDarkMode} />}
        {currentView === "FAQ" && <FAQ isDarkMode={isDarkMode} />}
        {currentView === "cuenta" && (
          <CuentaView
            userData={userData}
            onUpdate={fetchGrupos}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
      {/* Dialog para guardar simulación */}
      <Dialog open={simDialogOpen} onClose={() => setSimDialogOpen(false)}>
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
          <Button onClick={() => setSimDialogOpen(false)} color="secondary">
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
              setSimLoading(true);
              await guardarSimulacionMaestro({
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
              setSimDialogOpen(false);
              setSimName("");
              setSimDesc("");
              setSimLoading(false);
            }}
            variant="contained"
            disabled={simLoading}
          >
            {simLoading ? <CircularProgress size={24} /> : "Guardar"}
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
      <Footer isDarkMode={isDarkMode} />
    </>
  );
}

export default MaestroView;
