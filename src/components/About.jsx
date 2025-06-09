import React from "react";
import { Typography, Box, Paper, Divider } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const About = ({ isDarkMode }) => {
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
          <InfoOutlinedIcon sx={{ fontSize: 40, color: "#7c3aed" }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Acerca del Proyecto
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Typography
          variant="body1"
          paragraph
          sx={{
            textAlign: "justify",
            fontSize: 18,
            color: isDarkMode ? "#fff" : "#3b0764",
          }}
        >
          La educación es un sector importante que siempre necesita de
          herramientas que apoyen la comprensión de temas en áreas específicas.
          Esto, aunado al rápido desarrollo e integración de la tecnología a
          nuestra vida diaria, hace lógica la necesidad de contar con
          herramientas de origen tecnológico que apoyen al ámbito educativo.
          Este proyecto nació considerando esta necesidad y los diversos ámbitos
          que puedan requerir apoyo para su comprensión. Debido a su dificultad,
          se consideró enfocar nuestros esfuerzos en el área de matemáticas,
          específicamente en las ecuaciones lineales.
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{
            textAlign: "justify",
            fontSize: 18,
            color: isDarkMode ? "#fff" : "#3b0764",
          }}
        >
          De acuerdo con esto, se desarrolló un proyecto que pudiera ayudar a
          profesores a crear ejercicios enfocados en ecuaciones simultáneas,
          apoyado por un simulador que permite al usuario graficar las
          ecuaciones ingresadas. Además, permite presentarlo a los alumnos para
          su evaluación por parte del profesor, en grupos de trabajo donde es
          posible subir contenido multimedia y contar con un chat de
          comunicación entre miembros, para apoyar la comprensión del tema por
          parte del alumno.
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{
            textAlign: "justify",
            fontSize: 18,
            color: isDarkMode ? "#fff" : "#3b0764",
          }}
        >
          Todo esto en una plataforma que fuera amigable con el usuario y de
          fácil comprensión. Esta plataforma es la culminación de nuestros
          esfuerzos por entregar un producto funcional. Esperamos que esta le
          resulte útil.
        </Typography>
      </Paper>
    </Box>
  );
};

export default About;
