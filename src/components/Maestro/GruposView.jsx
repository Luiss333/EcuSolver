import React, { useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  Divider,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ChatIcon from "@mui/icons-material/Chat";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import * as XLSX from "xlsx";
import VisibilityIcon from "@mui/icons-material/Visibility";

function GruposView({ grupos, openChat, fetchGrupos }) {
  const [selectedGrupo, setSelectedGrupo] = useState(null);
  const [view, setView] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [calificaciones, setCalificaciones] = useState({
    alumnos: [],
    ejercicios: [],
  });
  const [nuevoGrupoOpen, setNuevoGrupoOpen] = useState(false);
  const [nuevoGrupoNombre, setNuevoGrupoNombre] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [grupoAEliminar, setGrupoAEliminar] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [detalleOpen, setDetalleOpen] = useState(false);
  const [detalleData, setDetalleData] = useState({ texto: "", imagen: "" });
  const [detalleAlumno, setDetalleAlumno] = useState("");
  const [detalleEjercicio, setDetalleEjercicio] = useState("");

  const [confirmEliminarAlumno, setConfirmEliminarAlumno] = useState(false);
  const [alumnoAEliminar, setAlumnoAEliminar] = useState(null);

  const handleOpenConfirmDialog = (grupo) => {
    setGrupoAEliminar(grupo);
    setConfirmDialogOpen(true);
  };

  // Función para obtener los alumnos de un grupo
  const handleDetalles = async (grupo) => {
    setSelectedGrupo(grupo);
    setView("detalles");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://backend-tt-209366905887.us-central1.run.app/grupos/${grupo.id}/alumnos`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok)
        throw new Error("Error al obtener los alumnos del grupo");
      const data = await response.json();
      setAlumnos(data.alumnos);
    } catch (error) {
      console.error("Error al obtener los alumnos:", error);
    }
  };

  // Función para obtener las calificaciones de un grupo
  const handleCalificaciones = async (grupo) => {
    setSelectedGrupo(grupo);
    setView("calificaciones");
    try {
      const response = await fetch(
        `https://backend-tt-209366905887.us-central1.run.app/calificaciones/grupo/${grupo.id}`
      );
      const data = await response.json();
      setCalificaciones(data);
    } catch (error) {
      console.error("Error al obtener las calificaciones:", error);
    }
  };

  // Función para eliminar un alumno de un grupo
  const handleEliminarAlumno = async (alumnoId) => {
  try {
    const response = await fetch(
      `https://backend-tt-209366905887.us-central1.run.app/alumnos/${alumnoId}/${selectedGrupo.id}`,
      {
        method: "DELETE",
      }
    );
    if (response.ok) {
      setAlumnos((prevAlumnos) =>
        prevAlumnos.filter((alumno) => alumno.alumno_id !== alumnoId)
      );
    } else {
      console.error("Error al eliminar el alumno:", await response.text());
    }
  } catch (error) {
    console.error("Error al conectar con el servidor:", error);
  }
};

  // Función para crear un nuevo grupo
  const handleCrearGrupo = async () => {
    if (!nuevoGrupoNombre.trim()) {
      setErrorNombre("El nombre del grupo es obligatorio");
      return;
    }
    setIsLoading(true);
    setErrorNombre("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://backend-tt-209366905887.us-central1.run.app/registrar-grupo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombreGrupo: nuevoGrupoNombre }),
      });
      if (!response.ok) {
        const data = await response.json();
        setErrorNombre(data.message || "Error al crear el grupo");
      } else {
        setNuevoGrupoOpen(false);
        setNuevoGrupoNombre("");
        fetchGrupos();
      }
    } catch (error) {
      setErrorNombre("Error de conexión");
    }
    setIsLoading(false);
  };

  const handleEliminarGrupo = async () => {
    if (!grupoAEliminar) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://backend-tt-209366905887.us-central1.run.app/grupos/${grupoAEliminar.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Grupo eliminado con éxito.",
          severity: "success",
        });
        fetchGrupos();
      } else {
        const data = await response.json();
        setSnackbar({
          open: true,
          message: data.message || "Error al eliminar el grupo.",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error de conexión al eliminar el grupo.",
        severity: "error",
      });
    }
    setConfirmDialogOpen(false);
    setGrupoAEliminar(null);
  };

  // Dentro del componente GruposView, antes del return:
  const exportCalificacionesToExcel = () => {
    if (
      !calificaciones ||
      !calificaciones.alumnos ||
      calificaciones.alumnos.length === 0
    )
      return;

    // Encabezados: Alumno, ejercicios..., Promedio
    const headers = [
      "Alumno",
      ...calificaciones.ejercicios.map((e) => e.name),
      "Promedio",
    ];

    // Filas de datos
    const rows = calificaciones.alumnos.map((alumno) => {
      const correctos = calificaciones.ejercicios.filter(
        (ej) => alumno.calificaciones[ej.id] === "correcto"
      ).length;
      const total = calificaciones.ejercicios.length;
      const promedio =
        total > 0 ? ((correctos / total) * 100).toFixed(2) + "%" : "0%";
      return [
        alumno.nombre,
        ...calificaciones.ejercicios.map((ej) =>
          alumno.calificaciones[ej.id] === "correcto"
            ? "✔"
            : alumno.calificaciones[ej.id] === "incorrecto"
            ? "✘"
            : ""
        ),
        promedio,
      ];
    });

    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Calificaciones");
    XLSX.writeFile(
      wb,
      `Calificaciones_${selectedGrupo.nombreGrupo.replace(/\s+/g, "_")}.xlsx`
    );
  };

  const handleUpdateCalificacion = async (
    alumnoId,
    ejercicioId,
    nuevoResultado
  ) => {
    try {
      await fetch("https://backend-tt-209366905887.us-central1.run.app/calificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alumno_id: alumnoId,
          ejercicio_id: ejercicioId,
          grupo_id: selectedGrupo.id,
          resultado: nuevoResultado,
        }),
      });
      // Actualiza el estado localmente
      setCalificaciones((prev) => {
        const alumnos = prev.alumnos.map((al) =>
          al.id === alumnoId
            ? {
                ...al,
                calificaciones: {
                  ...al.calificaciones,
                  [ejercicioId]: nuevoResultado,
                },
              }
            : al
        );
        return { ...prev, alumnos };
      });
    } catch (e) {
      alert("Error al actualizar calificación");
    }
  };

  const handleVerDetalle = async (
    alumnoId,
    ejercicioId,
    alumnoNombre,
    ejercicioNombre
  ) => {
    try {
      const res = await fetch(
        `https://backend-tt-209366905887.us-central1.run.app/desarrollo-alumno?alumno_id=${alumnoId}&ejercicio_id=${ejercicioId}&grupo_id=${selectedGrupo.id}`
      );
      const data = await res.json();
      setDetalleData({
        texto: data.desarrolloTexto || "Sin desarrollo",
        imagen: data.desarrolloImagen || "",
      });
      setDetalleAlumno(alumnoNombre);
      setDetalleEjercicio(ejercicioNombre);
      setDetalleOpen(true);
    } catch {
      setDetalleData({ texto: "No hay desarrollo", imagen: "" });
      setDetalleOpen(true);
    }
  };
  // Vista Detalles
  if (view === "detalles" && selectedGrupo) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Box
          sx={{
            p: { xs: 1, sm: 3 },
            borderRadius: 4,
            background: isDark
              ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
              : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            boxShadow: isDark
              ? "0 4px 24px rgba(40,62,81,0.25)"
              : "0 4px 24px rgba(30,60,114,0.10)",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: isDark ? "#ffd700" : "#283e51",
              letterSpacing: 0.5,
              textAlign: "center",
            }}
          >
            <AssignmentIndIcon sx={{ mr: 1, mb: "-4px" }} />
            Detalles del Grupo: {selectedGrupo.nombreGrupo}
          </Typography>
          <Paper
            elevation={isDark ? 8 : 3}
            sx={{
              mb: 3,
              borderRadius: 3,
              background: isDark
                ? "#414345"
                : "linear-gradient(90deg, #fff 0%, #f5f7fa 100%)",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    background: isDark
                      ? "#414345"
                      : "linear-gradient(90deg, #283e51 0%, #485563 100%)",
                  }}
                >
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Nombre
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Correo
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alumnos.map((alumno) => (
                  <TableRow key={alumno.alumno_id}>
                    <TableCell>{alumno.nombre}</TableCell>
                    <TableCell>{alumno.correo}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => {
                          setAlumnoAEliminar(alumno.alumno_id);
                          setConfirmEliminarAlumno(true);
                        }}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 500,
                          minWidth: 90,
                        }}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => setView(null)}
              sx={{
                fontWeight: 600,
                borderRadius: 3,
                px: 4,
                color: isDark ? "#ffd700" : "#283e51",
                borderColor: isDark ? "#ffd700" : "#283e51",
                "&:hover": {
                  borderColor: isDark ? "#ffe066" : "#ffd700",
                  color: isDark ? "#ffe066" : "#ffd700",
                },
              }}
            >
              Volver
            </Button>
          </Box>
        </Box>

        <Dialog
          open={confirmEliminarAlumno}
          onClose={() => setConfirmEliminarAlumno(false)}
        >
          <DialogTitle>¿Eliminar alumno?</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Seguro que deseas eliminar este alumno del grupo?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setConfirmEliminarAlumno(false)}
              color="secondary"
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                await handleEliminarAlumno(alumnoAEliminar);
                setConfirmEliminarAlumno(false);
                setAlumnoAEliminar(null);
              }}
              color="error"
              variant="contained"
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  // Vista Calificaciones
  if (view === "calificaciones" && selectedGrupo) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Box
          sx={{
            p: { xs: 1, sm: 3 },
            borderRadius: 4,
            background: isDark
              ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
              : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            boxShadow: isDark
              ? "0 4px 24px rgba(40,62,81,0.25)"
              : "0 4px 24px rgba(30,60,114,0.10)",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: isDark ? "#ffd700" : "#283e51",
              letterSpacing: 0.5,
              textAlign: "center",
            }}
          >
            <AssignmentIndIcon sx={{ mr: 1, mb: "-4px" }} />
            Calificaciones del Grupo: {selectedGrupo.nombreGrupo}
          </Typography>
          <Paper
            elevation={isDark ? 8 : 3}
            sx={{
              mb: 3,
              borderRadius: 3,
              background: isDark
                ? "#414345"
                : "linear-gradient(90deg, #fff 0%, #f5f7fa 100%)",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    background: isDark
                      ? "#414345"
                      : "linear-gradient(90deg, #283e51 0%, #485563 100%)",
                  }}
                >
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Alumno
                  </TableCell>
                  {calificaciones.ejercicios.map((ejercicio) => (
                    <TableCell
                      key={ejercicio.id}
                      sx={{ color: "#fff", fontWeight: 600 }}
                    >
                      {ejercicio.name}
                    </TableCell>
                  ))}
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Promedio
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calificaciones.alumnos.map((alumno) => (
                  <TableRow key={alumno.id}>
                    <TableCell>{alumno.nombre}</TableCell>
                    {calificaciones.ejercicios.map((ejercicio) => (
                      <TableCell key={ejercicio.id} align="center">
                        {alumno.calificaciones[ejercicio.id] ? (
                          <>
                            <Select
                              value={alumno.calificaciones[ejercicio.id]}
                              onChange={(e) =>
                                handleUpdateCalificacion(
                                  alumno.id,
                                  ejercicio.id,
                                  e.target.value
                                )
                              }
                              size="small"
                              sx={{ minWidth: 90, mr: 1 }}
                            >
                              <MenuItem value="correcto">✔ Correcto</MenuItem>
                              <MenuItem value="incorrecto">
                                ✘ Incorrecto
                              </MenuItem>
                            </Select>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                handleVerDetalle(
                                  alumno.id,
                                  ejercicio.id,
                                  alumno.nombre,
                                  ejercicio.name
                                )
                              }
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      {(
                        (Object.values(alumno.calificaciones).filter(
                          (resultado) => resultado === "correcto"
                        ).length /
                          calificaciones.ejercicios.length) *
                        100
                      ).toFixed(2)}
                      %
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<FileDownloadIcon />}
              onClick={exportCalificacionesToExcel}
              sx={{
                fontWeight: 600,
                borderRadius: 3,
                px: 4,
                mb: 1,
                background: isDark
                  ? "linear-gradient(90deg, #ffd700 0%, #ffe066 100%)"
                  : "linear-gradient(90deg, #ffd700 0%, #ffe066 100%)",
                color: isDark ? "#283e51" : "#283e51",
                "&:hover": {
                  background: isDark
                    ? "linear-gradient(90deg, #ffe066 0%, #ffd700 100%)"
                    : "linear-gradient(90deg, #ffe066 0%, #ffd700 100%)",
                },
              }}
            >
              Descargar calificaciones
            </Button>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => setView(null)}
              sx={{
                fontWeight: 600,
                borderRadius: 3,
                px: 4,
                color: isDark ? "#ffd700" : "#283e51",
                borderColor: isDark ? "#ffd700" : "#283e51",
                "&:hover": {
                  borderColor: isDark ? "#ffe066" : "#ffd700",
                  color: isDark ? "#ffe066" : "#ffd700",
                },
              }}
            >
              Volver
            </Button>
          </Box>
        </Box>
        <Dialog
          open={detalleOpen}
          onClose={() => setDetalleOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Desarrollo de {detalleAlumno} - {detalleEjercicio}
          </DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              {detalleData.texto}
            </Typography>
            {detalleData.imagen && (
              <img
                src={`https://backend-tt-209366905887.us-central1.run.app/uploads-alumno/${detalleData.imagen}`}
                alt="Desarrollo"
                style={{ maxWidth: "100%", marginTop: 8 }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetalleOpen(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  // Vista Grupos
  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Box
        sx={{
          p: { xs: 1, sm: 3 },
          borderRadius: 4,
          background: isDark
            ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
            : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          boxShadow: isDark
            ? "0 4px 24px rgba(40,62,81,0.25)"
            : "0 4px 24px rgba(30,60,114,0.10)",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: isDark ? "#ffd700" : "#283e51",
            letterSpacing: 0.5,
            textAlign: "center",
          }}
        >
          <GroupIcon sx={{ mr: 1, mb: "-4px" }} />
          Grupos Asignados
        </Typography>
        <Paper
          elevation={isDark ? 8 : 3}
          sx={{
            borderRadius: 3,
            background: isDark
              ? "#414345"
              : "linear-gradient(90deg, #fff 0%, #f5f7fa 100%)",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  background: isDark
                    ? "#414345"
                    : "linear-gradient(90deg, #283e51 0%, #485563 100%)",
                }}
              >
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                  Nombre del Grupo
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                  Código de Clase
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                  Detalles
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                  Calificaciones
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                  Chat
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grupos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No hay grupos asignados.
                  </TableCell>
                </TableRow>
              ) : (
                grupos.map((grupo, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:hover": {
                        background: isDark
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(40,62,81,0.06)",
                      },
                      transition: "background 0.2s",
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500, fontSize: 15 }}>
                      {grupo.nombreGrupo}
                    </TableCell>
                    <TableCell>{grupo.codigoClase}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{
                          mr: 1,
                          fontWeight: 500,
                          borderRadius: 2,
                          boxShadow: "none",
                          minWidth: 90,
                        }}
                        onClick={() => handleDetalles(grupo)}
                        startIcon={<AssignmentIndIcon />}
                      >
                        Detalles
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        sx={{
                          fontWeight: 500,
                          borderRadius: 2,
                          boxShadow: "none",
                          minWidth: 90,
                        }}
                        startIcon={<DeleteIcon />}
                        onClick={() => handleOpenConfirmDialog(grupo)}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        sx={{
                          fontWeight: 500,
                          borderRadius: 2,
                          boxShadow: "none",
                          minWidth: 90,
                        }}
                        onClick={() => handleCalificaciones(grupo)}
                      >
                        Ver Calificaciones
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        sx={{
                          fontWeight: 500,
                          borderRadius: 2,
                          boxShadow: "none",
                          minWidth: 90,
                        }}
                        startIcon={<ChatIcon />}
                        onClick={() => openChat(grupo.nombreGrupo)}
                      >
                        Abrir Chat
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
        {/* Diálogo de confirmación para eliminar grupo */}
        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
        >
          <DialogTitle>¿Eliminar grupo?</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Seguro que deseas eliminar el grupo{" "}
              <b>{grupoAEliminar?.nombreGrupo}</b> y todo lo relacionado?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setConfirmDialogOpen(false)}
              color="secondary"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEliminarGrupo}
              color="error"
              variant="contained"
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setNuevoGrupoOpen(true)}
            sx={{
              fontWeight: 600,
              borderRadius: 3,
              px: 4,
              py: 1,
              fontSize: 16,
              background: isDark
                ? "linear-gradient(90deg, #ffd700 0%, #ffe066 100%)"
                : "linear-gradient(90deg, #ffd700 0%, #ffe066 100%)",
              color: isDark ? "#283e51" : "#283e51",
              boxShadow: isDark
                ? "0 2px 8px rgba(40,62,81,0.18)"
                : "0 2px 8px rgba(30,60,114,0.10)",
              "&:hover": {
                background: isDark
                  ? "linear-gradient(90deg, #ffe066 0%, #ffd700 100%)"
                  : "linear-gradient(90deg, #ffe066 0%, #ffd700 100%)",
              },
            }}
          >
            Nuevo
          </Button>
        </Box>
        <Dialog
          open={nuevoGrupoOpen}
          onClose={() => setNuevoGrupoOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: isDark
                ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
                : "linear-gradient(135deg, #fff 0%, #f5f7fa 100%)",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              color: isDark ? "#ffd700" : "#283e51",
              textAlign: "center",
            }}
          >
            Nuevo Grupo
          </DialogTitle>
          <Divider />
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre del Grupo"
              fullWidth
              value={nuevoGrupoNombre}
              onChange={(e) => setNuevoGrupoNombre(e.target.value)}
              error={!!errorNombre}
              helperText={errorNombre}
              disabled={isLoading}
              sx={{
                input: {
                  color: isDark ? "#ffd700" : "#283e51",
                },
                label: {
                  color: isDark ? "#ffd700" : "#283e51",
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              onClick={() => setNuevoGrupoOpen(false)}
              disabled={isLoading}
              sx={{
                fontWeight: 600,
                borderRadius: 3,
                color: isDark ? "#ffd700" : "#283e51",
                borderColor: isDark ? "#ffd700" : "#283e51",
                "&:hover": {
                  borderColor: isDark ? "#ffe066" : "#ffd700",
                  color: isDark ? "#ffe066" : "#ffd700",
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCrearGrupo}
              variant="contained"
              color="primary"
              disabled={isLoading}
              sx={{
                fontWeight: 600,
                borderRadius: 3,
                px: 4,
                background: isDark
                  ? "linear-gradient(90deg, #ffd700 0%, #ffe066 100%)"
                  : "linear-gradient(90deg, #ffd700 0%, #ffe066 100%)",
                color: isDark ? "#283e51" : "#283e51",
                "&:hover": {
                  background: isDark
                    ? "linear-gradient(90deg, #ffe066 0%, #ffd700 100%)"
                    : "linear-gradient(90deg, #ffe066 0%, #ffd700 100%)",
                },
              }}
            >
              Crear
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default GruposView;
