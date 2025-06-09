import React, { useState, useEffect } from "react";
import Graph from "./Graph";
import InputForm from "./InputForm";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const Simulador = ({ equations, setEquations, defaultValues, isDarkMode, onValidate, ejercicioId }) => {
  const [solution, setSolution] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // useEffect(() => {
  //   console.log("Ejercicio", ejercicioId || "N/A"); ;
  // }, []);

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, md: 4 },
            background: isDarkMode
              ? "linear-gradient(135deg, #23272f 0%, #3a4250 100%)"
              : "#f5f7fa",
            borderRadius: 4,
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              color: isDarkMode ? "#fff" : "#2d3a4b",
              mb: 3,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            Simulador
            <IconButton
              aria-label="Instrucciones"
              onClick={() => setOpenDialog(true)}
              sx={{
                color: isDarkMode ? "#90caf9" : "#1976d2",
                background: isDarkMode ? "#23272f" : "#f5f7fa",
                borderRadius: "50%",
                ml: 1,
                "&:hover": {
                  background: isDarkMode ? "#3a4250" : "#e3e3e3",
                },
              }}
              size="large"
            >
              <InfoOutlinedIcon fontSize="inherit" />
            </IconButton>
          </Typography>

          <Grid
            container
            spacing={3}
            justifyContent="center"
            alignItems="flex-start"
            className="g-3"
          >
            <Grid item xs={12} md={5} className="mb-3 mb-md-0">
              <InputForm
                onSubmit={(eq1, eq2, sol) => {
                  setEquations([eq1, eq2]);
                  setSolution(sol);
                }}
                defaultValues={defaultValues}
                onValidate={onValidate}
                ejercicioId={ejercicioId}
              />
            </Grid>
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  width: { xs: "85vw", sm: "60vw", md: "70vw", lg: "43vw" },
                  height: { xs: "100vw", sm: "85vw", md: "70vw", lg: "38vw" },
                  p: 2,
                }}
              >
                <Graph
                  equations={equations}
                  solution={solution}
                  isDarkMode={isDarkMode}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      {/* Dialogo de instrucciones */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            background: isDarkMode
              ? "linear-gradient(135deg, #23272f 0%, #3a4250 100%)"
              : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            color: isDarkMode ? "#fff" : "#222",
            borderRadius: 3,
            boxShadow: isDarkMode
              ? "0 8px 32px rgba(30,60,114,0.25)"
              : "0 8px 32px rgba(44,62,80,0.10)",
            minWidth: { xs: "90vw", sm: 400 },
            maxWidth: 500,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: isDarkMode ? "#23272f" : "#ede7f6",
            color: isDarkMode ? "#90caf9" : "#4c1d95",
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: 1,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            pb: 1,
          }}
        >
          Instrucciones de uso
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            background: "transparent",
            color: isDarkMode ? "#fff" : "#222",
            fontSize: 17,
            px: 3,
            py: 2,
          }}
        >
          <Typography
            gutterBottom
            sx={{ fontWeight: 600, color: isDarkMode ? "#90caf9" : "#4c1d95" }}
          >
            ¿Cómo usar el simulador?
          </Typography>
          <Typography
            variant="body2"
            gutterBottom
            sx={{ color: isDarkMode ? "#fff" : "#222" }}
          >
            1. Ingresa los coeficientes de las dos ecuaciones lineales en los
            campos correspondientes.
            <br />
            2. Puedes usar números decimales, fracciones (ejemplo: 1/2) o el
            símbolo π.
            <br />
            3. Presiona <b>Calcular</b> para ver la solución y la gráfica.
            <br />
            4. Si hay una solución única, se mostrará el punto de intersección.
            <br />
            5. Si no hay solución o hay infinitas soluciones, se mostrará un
            mensaje.
            <br />
            6. Puedes modificar los valores y volver a calcular cuantas veces
            quieras.
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: isDarkMode ? "#90caf9" : "#1976d2", mt: 2 }}
          >
            Nota: Si ingresas datos inválidos, aparecerá una advertencia.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            background: isDarkMode ? "#23272f" : "#ede7f6",
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            p: 2,
          }}
        >
          <Button
            onClick={() => setOpenDialog(false)}
            autoFocus
            variant="contained"
            sx={{
              background: isDarkMode ? "#90caf9" : "#7c3aed",
              color: isDarkMode ? "#23272f" : "#fff",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": {
                background: isDarkMode ? "#64b5f6" : "#5b21b6",
              },
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Simulador;
