import React from "react";
import { Box, Typography, Link, Container } from "@mui/material";

const Footer = ({ isDarkMode }) => {
  return (
    <Box
      component="footer"
      sx={{
        background: isDarkMode
          ? "linear-gradient(90deg, #232526 0%, #414345 100%)"
          : "linear-gradient(90deg, #00BFFF 0%, #BA55D3 100%)",
        color: isDarkMode ? "grey.300" : "white",
        paddingY: 3,
        marginTop: "auto",
        textAlign: "center",
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        boxShadow: "0 -4px 24px rgba(30,60,114,0.10)",
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body1" sx={{ marginBottom: 1, fontWeight: 500 }}>
          © {new Date().getFullYear()} Instituto Politécnico Nacional - Escuela
          Superior de Cómputo. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
