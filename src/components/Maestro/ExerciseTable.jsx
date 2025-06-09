import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  Menu,
  MenuItem,
  Checkbox,
  ListItemIcon,
  Typography,
  Box,
  useTheme,
  Fade,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import axios from "axios";

function ExerciseTable({ exercises, onEdit, onDelete, onCreateNew,isDarkMode }) {
  const [grupos, setGrupos] = useState([]);
  const [selectedGrupos, setSelectedGrupos] = useState([]);
  const [gruposAsignados, setGruposAsignados] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const theme = useTheme();
  const isDark = isDarkMode;

  useEffect(() => {
    const fetchGrupos = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("https://backend-tt-209366905887.us-central1.run.app/grupos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGrupos(response.data.grupos || []);
      } catch (error) {
        console.error("Error al obtener los grupos:", error);
      }
    };
    fetchGrupos();
  }, []);

  const handleOpenMenu = async (event, exercise) => {
    setAnchorEl(event.currentTarget);
    setSelectedExercise(exercise);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `https://backend-tt-209366905887.us-central1.run.app/ejercicios/${exercise.id}/grupos-asignados`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGruposAsignados(response.data.gruposAsignados || []);
    } catch (error) {
      console.error("Error al obtener los grupos asignados:", error);
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedExercise(null);
    setSelectedGrupos([]);
    setGruposAsignados([]);
  };

  const handleToggleGrupo = (grupoId) => {
    setSelectedGrupos((prevSelected) =>
      prevSelected.includes(grupoId)
        ? prevSelected.filter((id) => id !== grupoId)
        : [...prevSelected, grupoId]
    );
  };

  const handleAsignar = async () => {
    setConfirmDialogOpen(false);
    const token = localStorage.getItem("token");
    try {
      for (const grupoId of selectedGrupos) {
        await axios.post(
          `https://backend-tt-209366905887.us-central1.run.app/ejercicios/asignar`,
          { ejercicio_id: selectedExercise.id, grupo_id: grupoId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      setSnackbar({ open: true, message: "Ejercicio asignado con éxito.", severity: "success" });
      handleCloseMenu();
    } catch (error) {
      console.error("Error al asignar el ejercicio:", error);
      setSnackbar({ open: true, message: "Error al asignar el ejercicio.", severity: "error" });
    }
  };

  const handleAsignarClick = () => {
    setConfirmDialogOpen(true);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 800,
        mx: "auto",
        mt: 2,
        mb: 4,
        p: { xs: 1, sm: 3 },
        background: isDark
          ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
          : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        borderRadius: 4,
        boxShadow: isDark
          ? "0 4px 24px rgba(40,62,81,0.25)"
          : "0 4px 24px rgba(30,60,114,0.10)",
        transition: "background 0.3s",
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
        <AssignmentTurnedInIcon sx={{ mr: 1, mb: "-4px" }} />
        Lista de Ejercicios
      </Typography>
      <TableContainer
        component={Paper}
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
              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 16,
                  borderTopLeftRadius: 12,
                }}
              >
                Nombre del Ejercicio
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 16,
                  borderTopRightRadius: 12,
                }}
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exercises.map((exercise) => (
              <TableRow
                key={exercise.id}
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
                  {exercise.name}
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => onEdit(exercise)}
                    sx={{
                      mr: 1,
                      fontWeight: 500,
                      borderRadius: 2,
                      boxShadow: "none",
                      minWidth: 90,
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => onDelete(exercise.id)}
                    sx={{
                      mr: 1,
                      fontWeight: 500,
                      borderRadius: 2,
                      boxShadow: "none",
                      minWidth: 90,
                    }}
                  >
                    Eliminar
                  </Button>
                  <Button
                    variant="contained"
                    color="#fff"
                    size="small"
                    startIcon={<GroupAddIcon />}
                    onClick={(event) => handleOpenMenu(event, exercise)}
                    sx={{
                      fontWeight: 500,
                      borderRadius: 2,
                      boxShadow: "none",
                      minWidth: 90,
                      background: isDark
                        ? "linear-gradient(90deg, #7b1fa2 0%, #512da8 100%)"
                        : "linear-gradient(90deg, #7b1fa2 0%, #512da8 100%)",
                      color: isDark ? "#fff" : "#fff",
                      "&:hover": {
                        background: isDark
                          ? "linear-gradient(90deg, #BA55D3 0%, #7b1fa2 100%)"
                          : "linear-gradient(90deg, #BA55D3 0%, #7b1fa2 100%)",
                      },
                    }}
                  >
                    Asignar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            minWidth: 260,
            borderRadius: 3,
            background: isDark
              ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
              : "linear-gradient(135deg, #fff 0%, #f5f7fa 100%)",
            color: isDark ? "#ffd700" : "#283e51",
            boxShadow: isDark
              ? "0 4px 24px rgba(40,62,81,0.25)"
              : "0 4px 24px rgba(30,60,114,0.10)",
          },
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            px: 2,
            pt: 1.5,
            pb: 0.5,
            fontWeight: 600,
            color: isDark ? "#ffd700" : "#283e51",
          }}
        >
          Asignar a grupo(s)
        </Typography>
        <Divider sx={{ mb: 1, background: isDark ? "#ffd700" : "#283e51" }} />
        {grupos.length === 0 && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No hay grupos disponibles
            </Typography>
          </MenuItem>
        )}
        {grupos.map((grupo) => (
          <MenuItem
            key={grupo.id}
            disabled={gruposAsignados.includes(grupo.id)}
            sx={{
              opacity: gruposAsignados.includes(grupo.id) ? 0.5 : 1,
              fontWeight: 500,
            }}
            onClick={() => handleToggleGrupo(grupo.id)}
          >
            <ListItemIcon>
              <Checkbox
                checked={selectedGrupos.includes(grupo.id)}
                disabled={gruposAsignados.includes(grupo.id)}
                edge="start"
                sx={{
                  color: isDark ? "#ffd700" : "#283e51",
                  "&.Mui-checked": {
                    color: isDark ? "#ffd700" : "#283e51",
                  },
                }}
              />
            </ListItemIcon>
            {grupo.nombreGrupo}
          </MenuItem>
        ))}
        <Divider sx={{ mt: 1, mb: 1 }} />
        <MenuItem disableRipple sx={{ justifyContent: "center" }}>
          <Button
            onClick={handleAsignar}
            variant="contained"
            color="success"
            size="small"
            sx={{
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
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
            disabled={selectedGrupos.length === 0}
          >
            Asignar
          </Button>
        </MenuItem>
      </Menu>
      {/* Confirmación Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirmar asignación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que deseas asignar este ejercicio a los grupos seleccionados?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleAsignar} color="secondary" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
          onClick={onCreateNew}
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
    </Box>
  );
}

export default ExerciseTable;