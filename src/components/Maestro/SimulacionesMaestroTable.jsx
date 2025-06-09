import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";

function SimulacionesMaestroTable({ onLoadSimulacion, refreshKey }) {
  const [simulaciones, setSimulaciones] = useState([]);

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

  useEffect(() => {
    const fetchSimulaciones = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("https://backend-tt-209366905887.us-central1.run.app/simulaciones-maestro", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSimulaciones(data);
    };
    fetchSimulaciones();
  }, [refreshKey]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`https://backend-tt-209366905887.us-central1.run.app/simulaciones-maestro/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setSimulaciones(simulaciones.filter((sim) => sim.id !== id));
  };

  return (
    <Box sx={{ mt: 2, mb: 2, width: "100%", maxWidth: 800, mx: "auto" }}>
      <Paper elevation={4} sx={{ borderRadius: 4, p: 2 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 700, textAlign: "center" }}
        >
          Tus simulaciones guardadas
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
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
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ py: 3, color: "#888" }}
                  >
                    No tienes simulaciones guardadas.
                  </TableCell>
                </TableRow>
              ) : (
                simulaciones.map((sim) => (
                  <TableRow key={sim.id}>
                    <TableCell>{sim.name}</TableCell>
                    <TableCell>{sim.description}</TableCell>
                    <TableCell>
                      {new Date(sim.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Cargar simulación" arrow>
                        <IconButton
                          onClick={() => {
                            const eqs = parseEquations(sim.equations);
                            const defaultValues = {
                              x1: extraerCoeficienteTexto(eqs[0], "x"),
                              y1: extraerCoeficienteTexto(eqs[0], "y"),
                              b1: extraerCoeficienteTexto(eqs[0], "b"),
                              x2: extraerCoeficienteTexto(eqs[1], "x"),
                              y2: extraerCoeficienteTexto(eqs[1], "y"),
                              b2: extraerCoeficienteTexto(eqs[1], "b"),
                            };
                            onLoadSimulacion({
                              equations: eqs,
                              defaultValues,
                              simulacionId: sim.id,
                            });
                          }}
                          sx={{ color: "#1976d2", mr: 1 }}
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
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}

export default SimulacionesMaestroTable;
