import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const faqApp = [
  {
    question: "¿Qué es WebSimEval?",
    answer: "WebSimEval es una plataforma para evaluar simulaciones en línea.",
  },
  {
    question: "¿Cómo puedo crear una cuenta?",
    answer:
      "Puedes crear una cuenta haciendo clic en 'Crear cuenta' en la pantalla de bienvenida.",
  },
  {
    question: "¿Es gratis usar WebSimEval?",
    answer: "Sí, WebSimEval es completamente gratuito para los usuarios.",
  },
  {
    question: "¿Puedo acceder como invitado?",
    answer:
      "Sí, puedes continuar como invitado sin necesidad de crear una cuenta.",
  },
];

const faqEcuaciones = [
  {
    question: "¿Qué son las ecuaciones simultáneas?",
    answer:
      "Son un conjunto de ecuaciones que se resuelven al mismo tiempo porque comparten incógnitas.",
  },
  {
    question: "¿Para qué sirven las ecuaciones simultáneas?",
    answer:
      "Permiten encontrar valores que satisfacen todas las ecuaciones del sistema, útiles en matemáticas, física y economía.",
  },
  {
    question: "¿Qué métodos existen para resolver ecuaciones simultáneas?",
    answer:
      "Algunos métodos comunes son: sustitución, igualación, reducción y el método gráfico.",
  },
  {
    question: "¿Puedo graficar ecuaciones simultáneas en WebSimEval?",
    answer:
      "Sí, la plataforma permite graficar ecuaciones para visualizar sus soluciones.",
  },
];

const FAQ = ({ isDarkMode }) => {
  return (
    <Box sx={{ maxWidth: 700, margin: "auto", mt: 4, mb: 4 }}>
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          borderRadius: 4,
          background: isDarkMode
            ? "linear-gradient(90deg, #232526 0%, #414345 100%)"
            : "linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
            justifyContent: "center",
          }}
        >
          <HelpOutlineIcon sx={{ fontSize: 40, color: "#7c3aed" }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Preguntas Frecuentes
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {/* Sección sobre la aplicación */}
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: "#7c3aed", mb: 2 }}
        >
          Sobre la aplicación
        </Typography>
        {faqApp.map((faq, index) => (
          <Accordion
            key={index}
            sx={{
              mb: 2,
              borderRadius: 2,
              boxShadow: "none",
              bgcolor: isDarkMode ? "#333" : "#ede9fe", // Cambia el fondo según el modo
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography
                sx={{ fontWeight: 600, color: isDarkMode ? "#fff" : "#4c1d95" }}
              >
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ color: isDarkMode ? "#ddd" : "#3b0764" }}>
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}

        <Divider sx={{ my: 3 }} />

        {/* Sección sobre ecuaciones simultáneas */}
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: "#7c3aed", mb: 2 }}
        >
          Sobre ecuaciones simultáneas
        </Typography>
        {faqEcuaciones.map((faq, index) => (
          <Accordion
            key={index}
            sx={{
              mb: 2,
              borderRadius: 2,
              boxShadow: "none",
              bgcolor: isDarkMode ? "#333" : "#ede9fe",
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography
                sx={{ fontWeight: 600, color: isDarkMode ? "#fff" : "#4c1d95" }}
              >
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ color: isDarkMode ? "#ddd" : "#3b0764" }}>
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Box>
  );
};

export default FAQ;
