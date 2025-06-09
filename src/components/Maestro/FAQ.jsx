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
    answer: "Es una aplicación la cual está diseñada para ser una herramienta de ayuda enfocada en el área de ecuaciones simultaneas. En esta los profesores podrán crear grupos de trabajo en los cuales podrán crear y asignar ejercicios, subir contenido multimedia y recibir calificaciones de los ejercicios resueltos por sus estudiantes. Por parte de los alumnos esta herramienta les proporciona un espacio en el cual ellos pueden resolver ejercicios y consultar material el cual pueda resolver sus dudas sobre los temas.",
  },
  {
    question: "¿Qué tipo de ecuaciones se pueden graficar?",
    answer:
      "El simulador puede graficar ecuaciones simultaneas de 2x2, es decir dos ecuaciones con dos incógnitas X y Y. El simulador también muestra si existe su punto de intersección, así como la solución general.",
  },
  {
    question: "¿Cómo puedo crear ejercicios?",
    answer: "En el apartado ejercicios aparecerá la opción “Nuevo”, en el cual accederá a un asistente virtual el cual lo guiará en la creación de ejercicios. En general se necesitan las ecuaciones del ejercicio, el planteamiento del problema, respuesta correcta y de manera opcional preguntas las cuales sus respuestas guíen a la solución.",
  },
  {
    question: "¿Qué tipos de ejercicios se pueden crear en la aplicación?",
    answer:
      "La aplicación está enfocada en el área de ecuaciones simultaneas de dos incógnitas. Al crear el ejercicio se pueden seleccionar dos tipos de respuestas, de opción múltiple (De cuatro respuestas) o dicotómicas.",
  },
];

const faqEcuaciones = [
  {
    question: "¿Qué es un sistema de ecuaciones simultanea?",
    answer:
      "Dos o más ecuaciones lineales que contienen todas las mismas variables desconocidas se llaman un sistema de ecuaciones lineales simultáneas. Para resolver tal sistema, debemos encontrar valores para las variables desconocidas que satisfagan todas las ecuaciones al mismo tiempo.",
  },
  {
    question: "¿Cómo se resuelven los sistemas de ecuaciones simultaneas?",
    answer:
      "Para resolver las ecuaciones se pueden usar distintos modos: igualación, sustitución, reducción y gráfico. Los primeros tres métodos consisten principalmente de resolver una incógnita usando los valores de las ecuaciones, para después resolver las demás mientras el gráfico consiste en graficar las ecuaciones y encontrar el punto de intersección de manera visual, el cual es la solución para todas las rectas.",
  },
  {
    question: "¿Siempre hay solución para dos ecuaciones?",
    answer:
      "Las ecuaciones pueden no tener un punto de intersección, es decir, no hay una solución para ese sistema de ecuaciones, pueden tener un solo punto de intersección el cual es la solución al sistema y pueden tener soluciones infinitas al sistema cuando las ecuaciones son equivalentes, a la cual solo en este programa solo se le asignará una solución general.",
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
