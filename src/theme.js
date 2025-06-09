import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f5f5f5", // Gris claro para el fondo
      paper: "#ffffff",   // Blanco suave para los contenedores
    },
    primary: {
      main: "#1976d2", // Gris azulado suave
    },
    secondary: {
      main: "#BA55D3", // Gris azulado más claro
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212", // Negro suave para el fondo
      paper: "#1e1e1e",   // Gris oscuro para los contenedores
    },
    primary: {
      main: "#1976d2", // Gris azulado suave
    },
    secondary: {
      main: "#BA55D3", // Gris azulado más oscuro
    },
  },
});