import React, { useEffect, useState } from "react";
import { obtenerSimulaciones, eliminarSimulacion } from "../api/simulaciones";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Box,
  Tooltip,
  IconButton,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

function extraerCoeficienteTexto(ecuacion, variable) {
  if (!ecuacion) return "";
  if (variable === "x") {
    const match = ecuacion.match(/^\s*([^\s]+)\s*x/i);
    return match ? match[1] : "";
  }
  if (variable === "y") {
    const match = ecuacion.match(/x\s*\+\s*([^\s]+)\s*y/i);
    return match ? match[1] : "";
  }
  if (variable === "b") {
    const match = ecuacion.match(/=\s*([^\s]+)/i);
    return match ? match[1] : "";
  }
  return "";
}

function parseEquations(equations) {
  if (Array.isArray(equations)) return equations;
  try {
    return JSON.parse(equations);
  } catch {
    return [];
  }
}

function SimulacionesTable({ alumnoId, onLoadSimulacion, refreshKey }) {
  const [simulaciones, setSimulaciones] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    if (alumnoId) {
      obtenerSimulaciones(alumnoId).then(setSimulaciones);
    }
  }, [alumnoId, refreshKey]);

  const handleDelete = async (id) => {
    await eliminarSimulacion(id);
    setSimulaciones(simulaciones.filter((s) => s.id !== id));
  };

  return (
    <Box
      sx={{
        mt: 2,
        mb: 2,
        width: "100%",
        maxWidth: 800,
        mx: "auto",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          borderRadius: 4,
          background: theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #23272f 0%, #3a4250 100%)"
            : "linear-gradient(135deg, #f5f7fa 0%, #e0e7ff 100%)",
          p: { xs: 1, sm: 2 },
          boxShadow: theme.palette.mode === "dark"
            ? "0 4px 24px rgba(30,60,114,0.18)"
            : "0 4px 24px rgba(44,62,80,0.10)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: theme.palette.mode === "dark" ? "#90caf9" : "#4c1d95",
            letterSpacing: 1,
            textAlign: "center",
          }}
        >
          Tus simulaciones guardadas
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <Table
            size="small"
            sx={{
              minWidth: 400,
              "& th": {
                background: theme.palette.mode === "dark"
                  ? "#23272f"
                  : "#ede7f6",
                color: theme.palette.mode === "dark"
                  ? "#90caf9"
                  : "#4c1d95",
                fontWeight: 700,
                fontSize: 15,
                borderBottom: `2px solid ${theme.palette.mode === "dark" ? "#444" : "#bdbdbd"}`,
              },
              "& td": {
                borderBottom: `1px solid ${theme.palette.mode === "dark" ? "#333" : "#e0e0e0"}`,
                fontSize: 14,
                color: theme.palette.mode === "dark" ? "#fff" : "#222",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {simulaciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3, color: "#888" }}>
                    No tienes simulaciones guardadas.
                  </TableCell>
                </TableRow>
              ) : (
                simulaciones.map((sim) => {
                  const eqs = parseEquations(sim.equations);
                  const defaultValues = {
                    x1: extraerCoeficienteTexto(eqs[0], "x"),
                    y1: extraerCoeficienteTexto(eqs[0], "y"),
                    b1: extraerCoeficienteTexto(eqs[0], "b"),
                    x2: extraerCoeficienteTexto(eqs[1], "x"),
                    y2: extraerCoeficienteTexto(eqs[1], "y"),
                    b2: extraerCoeficienteTexto(eqs[1], "b"),
                  };
                  return (
                    <TableRow
                      key={sim.id}
                      sx={{
                        "&:hover": {
                          background: theme.palette.mode === "dark"
                            ? "#2a3140"
                            : "#ede7f6",
                          transition: "background 0.2s",
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>{sim.name}</TableCell>
                      <TableCell sx={{ maxWidth: 180, whiteSpace: "pre-line", wordBreak: "break-word" }}>
                        {sim.description}
                      </TableCell>
                      <TableCell>
                        {new Date(sim.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Cargar simulación" arrow>
                          <IconButton
                            onClick={() =>
                              onLoadSimulacion({
                                equations: eqs,
                                defaultValues,
                              })
                            }
                            sx={{
                              color: theme.palette.mode === "dark"
                                ? "#90caf9"
                                : "#1976d2",
                              mr: 1,
                            }}
                          >
                            <PlayArrowIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar simulación" arrow>
                          <IconButton
                            onClick={() => handleDelete(sim.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}

export default SimulacionesTable;