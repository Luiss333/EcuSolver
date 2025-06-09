import React, { useState, useEffect } from "react";
import ExerciseTable from "./ExerciseTable";
import ExerciseForm from "./ExerciseForm";
import {
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

function EjerciciosView({ equations, setEquations, isDarkMode }) {
  const [view, setView] = useState("table");
  const [exercises, setExercises] = useState([]);
  const [editingExercise, setEditingExercise] = useState(null);

  // Para confirmación y notificaciones
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ...fetchExercises y useEffect igual...

  const fetchExercises = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://backend-tt-209366905887.us-central1.run.app/ejercicios", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al cargar los ejercicios");
      }
      const data = await response.json();
      setExercises(data);
      //console.log("Ejercicios cargados:", data);
    } catch (error) {
      console.error("Error al cargar los ejercicios:", error);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleCreateNew = () => {
    setEditingExercise(null);
    setView("form");
  };

  const handleEdit = (exercise) => {
    setEditingExercise(exercise);
    setView("form");
  };

  // Nuevo: abrir dialog de confirmación
  const handleDelete = (id) => {
    setExerciseToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Nuevo: confirmar borrado
  const confirmDelete = async () => {
    setDeleteDialogOpen(false);
    if (!exerciseToDelete) return;
    try {
      const response = await fetch(
        `https://backend-tt-209366905887.us-central1.run.app/ejercicios/${exerciseToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar el ejercicio");
      }

      setExercises(
        exercises.filter((exercise) => exercise.id !== exerciseToDelete)
      );
      setSnackbar({
        open: true,
        message: "Ejercicio eliminado con éxito",
        severity: "success",
      });
    } catch (error) {
      console.error("Error al eliminar el ejercicio:", error);
      setSnackbar({
        open: true,
        message: "Error al eliminar el ejercicio",
        severity: "error",
      });
    }
    setExerciseToDelete(null);
  };

  const handleSave = async (newExercise) => {
    if (editingExercise) {
      const token = localStorage.getItem("token");
      // Actualizar un ejercicio existente
      try {
        const response = await fetch(
          `https://backend-tt-209366905887.us-central1.run.app/ejercicios/${newExercise.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newExercise),
          }
        );

        if (!response.ok) {
          throw new Error("Error al actualizar el ejercicio");
        }

        const updatedExercise = await response.json();

        setExercises(
          exercises.map((exercise) =>
            exercise.id === updatedExercise.id ? updatedExercise : exercise
          )
        );
        setSnackbar({
          open: true,
          message: "Ejercicio actualizado con éxito",
          severity: "success",
        });
      } catch (error) {
        console.error("Error al actualizar el ejercicio:", error);
        setSnackbar({
          open: true,
          message: "Error al actualizar el ejercicio",
          severity: "error",
        });
      }
    } else {
      // Agregar un nuevo ejercicio
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("https://backend-tt-209366905887.us-central1.run.app/ejercicios", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newExercise),
        });

        if (!response.ok) {
          throw new Error("Error al crear el ejercicio");
        }

        const createdExercise = await response.json();

        setExercises([...exercises, createdExercise]);
        setSnackbar({
          open: true,
          message: "Ejercicio creado con éxito",
          severity: "success",
        });
      } catch (error) {
        console.error("Error al crear el ejercicio:", error);
        setSnackbar({
          open: true,
          message: "Error al crear el ejercicio",
          severity: "error",
        });
      }
    }
    fetchExercises();
    setView("table");
  };

  return (
    <div>
      {view === "table" ? (
        <ExerciseTable
          exercises={exercises}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateNew={handleCreateNew}
          isDarkMode={isDarkMode}
        />
      ) : (
        <ExerciseForm
          exercise={editingExercise}
          onSave={handleSave}
          onCancel={() => setView("table")}
          equations={equations}
          setEquations={setEquations}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Dialog de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este ejercicio?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Eliminar
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
    </div>
  );
}

export default EjerciciosView;
