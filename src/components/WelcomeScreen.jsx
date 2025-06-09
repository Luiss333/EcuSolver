import React from "react";
import { Box, Button, Typography, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

const WelcomeScreen = ({ onLoginClick, onRegisterClick, isDarkMode }) => {
  const navigate = useNavigate();

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.default",
          backgroundImage: `url('/../fondo-mate.png')`, // Usa el nombre de tu imagen
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Título principal */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 700,
            mx: "auto",
            mb: 2,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontFamily: 'cursive, sans-serif',
              fontWeight: 700,
              
              letterSpacing: 1,
              textShadow: isDarkMode
                ? "2px 2px 8px #0008"
                : "1px 1px 6px #b0c4de",
              wordBreak: "break-word",
              fontSize: { xs: "0.8rem", sm: "1.3rem", md: "1.8rem" },
            }}
          >
            “APLICACIÓN WEB DE EVALUACIÓN CON SIMULADOR CON MULTIMEDIOS PARA ECUACIONES SIMULTÁNEAS CON COMUNICACIÓN VÍA CHAT Y FAQ”
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 600,
              letterSpacing: 1,
              mt: 1,
              mb: 2,
            }}
          >
            TT: 2025-A097
          </Typography>
        </Box>

        {/* Botones */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column"},
            gap: 2,
            mb: 4,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button variant="contained" color="primary" onClick={onLoginClick}>
            Acceder
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={onRegisterClick}
          >
            Crear cuenta
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate("/guest")}
          >
            Continuar como invitado
          </Button>
        </Box>

        {/* Divider */}
        <Divider sx={{ width: "100%", maxWidth: 400, mb: 3, bgcolor: isDarkMode ? "#fff" : "#232526" }} />

        {/* Alumnos y Director */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 400,
            mx: "auto",
            textAlign: "center",
            bgcolor: isDarkMode ? "#232526" : "#F0F4F8",
            borderRadius: 2,
            p: 2,
            boxShadow: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Pacifico", "Montserrat", cursive, sans-serif',
              fontWeight: 700,
              color: isDarkMode ? "#fff" : "#232526",
              mb: 1,
            }}
          >
            Alumnos:
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 600,
              color: isDarkMode ? "#fff" : "#232526",
            }}
          >
            Martínez García Luis Gerardo
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 600,
              color: isDarkMode ? "#fff" : "#232526",
              mb: 2,
            }}
          >
            Mendoza Berber Amiel Jared
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Pacifico", "Montserrat", cursive, sans-serif',
              fontWeight: 700,
              color: isDarkMode ? "#fff" : "#232526",
              mt: 1,
            }}
          >
            Director
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 600,
              color: isDarkMode ? "#fff" : "#232526",
            }}
          >
            M. en C. Peredo Valderrama Rubén
          </Typography>
        </Box>
      </Box>
      <Footer isDarkMode={isDarkMode} />
    </>
  );
};

export default WelcomeScreen;
