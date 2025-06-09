import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tabs,
  Tab,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

import About from "../About";
import Contact from "../Contact";
import Footer from "../Footer";
import Simulador from "../Simulador/Simulador";
import FAQ from "./FAQ";

const GuestView = ({ equations, setEquations, isDarkMode, toggleTheme }) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("home");
  const theme = useTheme();
  const tabIndex = ["home", "faq", "contact", "about"].indexOf(currentView);
  const [openSnackbar, setOpenSnackbar] = useState(true);

  useEffect(() => {
    if (currentView === "home") {
      setOpenSnackbar(true);
    } else {
      setOpenSnackbar(false);
    }
  }, [currentView]);

  return (
    <>
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
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => navigate("/")}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: 1,
              textShadow: "0 1px 4px rgba(0,0,0,0.15)",
            }}
          >
            Bienvenido
          </Typography>
          <Tabs
            value={tabIndex === -1 ? 0 : tabIndex}
            onChange={(_, idx) => {
              const views = ["home", "faq", "contact", "about"];
              setCurrentView(views[idx]);
            }}
            textColor="inherit"
            TabIndicatorProps={{
              style: { backgroundColor: "#f4f4f4" },
            }}
            variant="scrollable" // <-- agrega esto
            scrollButtons="auto" // <-- y esto
            sx={{
              minHeight: 48,
              "& .MuiTab-root": { minHeight: 48, fontWeight: 500 },
            }}
          >
            <Tab label="Inicio" />
            <Tab label="FAQ" />
            <Tab label="Contacto" />
            <Tab label="Acerca de" />
          </Tabs>
          <IconButton
            onClick={toggleTheme}
            color="inherit"
            sx={{ marginLeft: "auto" }}
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="info"
          sx={{ width: "100%" }}
        >
          Aquí puedes interactuar con el graficador o explorar la aplicación.
        </Alert>
      </Snackbar>

      <div style={{ marginTop: "64px" }}>
        {currentView === "home" && (
          <Simulador equations={equations} setEquations={setEquations} isDarkMode={isDarkMode}/>
        )}
        {currentView === "faq" && <FAQ isDarkMode={isDarkMode}/>}
        {currentView === "about" && <About isDarkMode={isDarkMode}/>}
        {currentView === "contact" && <Contact isDarkMode={isDarkMode}/>}
      </div>
      <Footer isDarkMode={isDarkMode} />
    </>
  );
};

export default GuestView;
