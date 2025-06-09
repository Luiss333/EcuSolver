import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Switch,
  FormGroup,
  FormControlLabel as MuiFormControlLabel,
  Typography,
} from "@mui/material";
import Simulador from "../Simulador/Simulador";
import { Checkbox } from "@mui/material";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DialogActions from "@mui/material/DialogActions";

function ExerciseForm({
  exercise,
  onSave,
  onCancel,
  equations,
  setEquations,
  isDarkMode,
}) {
  const [ecuacionesCompletas, setEcuacionesCompletas] = useState(false);
  const [ayudaOpen, setAyudaOpen] = useState(false);
  const [metodo, setMetodo] = useState(exercise?.metodo || "");
  const [exerciseType, setExerciseType] = useState(exercise?.type || "");
  const [exerciseName, setExerciseName] = useState(exercise?.name || "");
  const [description, setDescription] = useState(exercise?.description || "");
  const [modoPistas, setModoPistas] = useState(
    exercise?.pistas?.activado || exercise?.pistas?.pistas?.length > 0
  );
  const [dificultad, setDificultad] = useState("facil");
  const [pistas, setPistas] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [simuladorVisible, setSimuladorVisible] = useState(
    exercise?.simulador === "si"
  );
  const [trueFalseAnswer, setTrueFalseAnswer] = useState(
    exercise?.answer || ""
  );
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState(
    exercise?.answers || ["", "", "", ""]
  );
  const [correctAnswer, setCorrectAnswer] = useState(
    exercise?.correctAnswer || ""
  );

  const bancoPistas = {
    facil: [
      {
        pregunta: "¿Cuál es la pendiente de la primera ecuación?",
        tipo: "numero",
        valorEsperado: () => obtenerPendiente(equations[0]),
      },
      {
        pregunta: "¿Cuál es la pendiente de la segunda ecuación?",
        tipo: "numero",
        valorEsperado: () => obtenerPendiente(equations[1]),
      },
      {
        pregunta: "¿Cuál es la ordenada al origen de la primera ecuación?",
        tipo: "numero",
        valorEsperado: () => obtenerOrdenada(equations[0]),
      },
      {
        pregunta: "¿Cuál es la ordenada al origen de la segunda ecuación?",
        tipo: "numero",
        valorEsperado: () => obtenerOrdenada(equations[1]),
      },
      {
        // Reemplazo de la pregunta de texto por una numérica
        pregunta:
          "¿Cuál es la suma de los coeficientes de x en ambas ecuaciones?",
        tipo: "numero",
        valorEsperado: () => {
          const m1 = equations[0].match(/(-?\d+)\s*x/i);
          const m2 = equations[1].match(/(-?\d+)\s*x/i);
          return m1 && m2 ? Number(m1[1]) + Number(m2[1]) : null;
        },
      },
    ],
    intermedio: [
      {
        pregunta: "¿Cuál es el punto de intersección del sistema?",
        tipo: "coordenada",
        valorEsperado: () => resolverSistema(equations[0], equations[1]),
      },
      {
        pregunta: "¿Cuál es la suma de las pendientes de ambas ecuaciones?",
        tipo: "numero",
        valorEsperado: () => {
          const m1 = obtenerPendiente(equations[0]);
          const m2 = obtenerPendiente(equations[1]);
          return m1 !== null && m2 !== null ? m1 + m2 : null;
        },
      },
      {
        pregunta: "¿Cuál es la diferencia entre las ordenadas al origen?",
        tipo: "numero",
        valorEsperado: () => {
          const b1 = obtenerOrdenada(equations[0]);
          const b2 = obtenerOrdenada(equations[1]);
          return b1 !== null && b2 !== null ? b1 - b2 : null;
        },
      },
      {
        pregunta:
          "¿Cuál es la suma de los coeficientes de x en ambas ecuaciones?",
        tipo: "numero",
        valorEsperado: () => {
          const m1 = equations[0].match(/(-?\d+)\s*x/i);
          const m2 = equations[1].match(/(-?\d+)\s*x/i);
          return m1 && m2 ? Number(m1[1]) + Number(m2[1]) : null;
        },
      },
      {
        pregunta:
          "¿Cuál es la suma de los coeficientes de y en ambas ecuaciones?",
        tipo: "numero",
        valorEsperado: () => {
          const m1 = equations[0].match(/\+\s*(-?\d+)\s*y/i);
          const m2 = equations[1].match(/\+\s*(-?\d+)\s*y/i);
          return m1 && m2 ? Number(m1[1]) + Number(m2[1]) : null;
        },
      },
    ],
    dificil: [
      {
        pregunta: "¿Cuál es el determinante del sistema?",
        tipo: "numero",
        valorEsperado: () => obtenerDeterminante(equations[0], equations[1]),
      },
      {
        pregunta: "¿Cuál es el valor de x cuando y = 0 en la primera ecuación?",
        tipo: "numero",
        valorEsperado: () => {
          const match = equations[0].match(
            /(-?\d+)\s*x\s*\+\s*(-?\d+)\s*y\s*=\s*(-?\d+)/i
          );
          if (!match) return null;
          const a = Number(match[1]);
          const c = Number(match[3]);
          return a !== 0 ? c / a : null;
        },
      },
      {
        pregunta: "¿Cuál es el valor de y cuando x = 0 en la segunda ecuación?",
        tipo: "numero",
        valorEsperado: () => {
          const match = equations[1].match(
            /(-?\d+)\s*x\s*\+\s*(-?\d+)\s*y\s*=\s*(-?\d+)/i
          );
          if (!match) return null;
          const b = Number(match[2]);
          const c = Number(match[3]);
          return b !== 0 ? c / b : null;
        },
      },
      {
        pregunta: "¿Cuál es la suma de las pendientes de ambas ecuaciones?",
        tipo: "numero",
        valorEsperado: () => {
          const m1 = obtenerPendiente(equations[0]);
          const m2 = obtenerPendiente(equations[1]);
          return m1 !== null && m2 !== null ? m1 + m2 : null;
        },
      },
      {
        pregunta: "¿Cuál es la diferencia entre las ordenadas al origen?",
        tipo: "numero",
        valorEsperado: () => {
          const b1 = obtenerOrdenada(equations[0]);
          const b2 = obtenerOrdenada(equations[1]);
          return b1 !== null && b2 !== null ? b1 - b2 : null;
        },
      },
    ],
  };

  const preguntasUsadas = pistas.map((p) => p.pregunta);

  const preguntasDisponibles = bancoPistas[dificultad].filter(
    (p) => !preguntasUsadas.includes(p.pregunta)
  );

  const agregarDeshabilitado =
    pistas.length >= 5 || preguntasDisponibles.length === 0;

  //Funciones
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!exerciseType || !exerciseName || !description) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const pistasInfo = modoPistas
      ? {
          activado: true,
          dificultad,
          pistas: pistas.map((p) => ({
            pregunta: p.pregunta,
            tipo: p.tipo,
            valorEsperado: p.valorEsperado,
          })),
        }
      : {
          activado: false,
          dificultad: "",
          pistas: [],
        };

    const newExercise = {
      id: exercise?.id || Date.now(),
      type: exerciseType,
      name: exerciseName,
      description,
      pistas: pistasInfo, // <-- Cambiado aquí
      metodo,
      simulador: simuladorVisible ? "si" : "no",
      equations,
      ...(exerciseType === "Dicotomica" && { answer: trueFalseAnswer }),
      ...(exerciseType === "Opcion multiple" && {
        answers: multipleChoiceAnswers,
        correctAnswer,
      }),
    };

    onSave(newExercise);
  };

  function extraerCoeficientes(ecuacion) {
    // Soporta formatos como "2x + 3y = 5" o "-1x + 10y = -7"
    const match = ecuacion?.match(
      /(-?\d+)\s*x\s*\+\s*(-?\d+)\s*y\s*=\s*(-?\d+)/i
    );
    if (!match) return ["", "", ""];
    return [match[1], match[2], match[3]];
  }

  // Funciones auxiliares
  function obtenerPendiente(eq) {
    const match = eq.match(/(-?\d+)\s*x\s*\+\s*(-?\d+)\s*y\s*=\s*(-?\d+)/i);
    if (!match) return null;
    const a = Number(match[1]);
    const b = Number(match[2]);
    return -a / b;
  }
  function obtenerOrdenada(eq) {
    const match = eq.match(/(-?\d+)\s*x\s*\+\s*(-?\d+)\s*y\s*=\s*(-?\d+)/i);
    if (!match) return null;
    const b = Number(match[2]);
    const c = Number(match[3]);
    return c / b;
  }
  function obtenerDeterminante(eq1, eq2) {
    const m1 = eq1.match(/(-?\d+)\s*x\s*\+\s*(-?\d+)\s*y\s*=\s*(-?\d+)/i);
    const m2 = eq2.match(/(-?\d+)\s*x\s*\+\s*(-?\d+)\s*y\s*=\s*(-?\d+)/i);
    if (!m1 || !m2) return null;
    const [a1, b1] = [Number(m1[1]), Number(m1[2])];
    const [a2, b2] = [Number(m2[1]), Number(m2[2])];
    return a1 * b2 - a2 * b1;
  }
  function resolverSistema(eq1, eq2) {
    const m1 = eq1.match(/(-?\d+)\s*x\s*\+\s*(-?\d+)\s*y\s*=\s*(-?\d+)/i);
    const m2 = eq2.match(/(-?\d+)\s*x\s*\+\s*(-?\d+)\s*y\s*=\s*(-?\d+)/i);
    if (!m1 || !m2) return [null, null];
    const [a1, b1, c1] = [Number(m1[1]), Number(m1[2]), Number(m1[3])];
    const [a2, b2, c2] = [Number(m2[1]), Number(m2[2]), Number(m2[3])];
    const det = a1 * b2 - a2 * b1;
    if (det === 0) return [null, null];
    const x = (c1 * b2 - c2 * b1) / det;
    const y = (a1 * c2 - a2 * c1) / det;
    return [x, y];
  }

  let defaultValues = {};

  if (
    exercise?.equations &&
    Array.isArray(exercise.equations) &&
    exercise.equations.length === 2
  ) {
    //console.log("Ejercicio con ecuaciones:", exercise.equations);
    defaultValues = {
      x1: extraerCoeficienteTexto(exercise.equations[0], "x"),
      y1: extraerCoeficienteTexto(exercise.equations[0], "y"),
      b1: extraerCoeficienteTexto(exercise.equations[0], "b"),
      x2: extraerCoeficienteTexto(exercise.equations[1], "x"),
      y2: extraerCoeficienteTexto(exercise.equations[1], "y"),
      b2: extraerCoeficienteTexto(exercise.equations[1], "b"),
    };
    //console.log("Valores por defecto:", defaultValues);
  }

  function esEcuacionEntera(eq) {
    // Solo acepta enteros positivos o negativos, sin fracciones ni decimales
    return (
      typeof eq === "string" &&
      /^\s*-?\d+\s*x\s*\+\s*-?\d+\s*y\s*=\s*-?\d+\s*$/i.test(eq.trim())
    );
  }

  const ecuacionesSonEnteras =
    Array.isArray(equations) &&
    equations.length === 2 &&
    equations.every(esEcuacionEntera);

  function extraerCoeficienteTexto(ecuacion, variable) {
    // Para x: todo antes de 'x'
    // Para y: todo entre '+' y 'y'
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

  // Efectos

  useEffect(() => {
    // Cuando cambie el ejercicio, resetea los estados principales
    setMetodo(exercise?.metodo || "");
    setExerciseType(exercise?.type || "");
    setExerciseName(exercise?.name || "");
    setDescription(exercise?.description || "");
    setModoPistas(
      exercise?.pistas?.activado || exercise?.pistas?.pistas?.length > 0
    );
    setDificultad("facil");
    setPistas([]);
    setSimuladorVisible(exercise?.simulador === "si");
    setTrueFalseAnswer(exercise?.answer || "");
    setMultipleChoiceAnswers(exercise?.answers || ["", "", "", ""]);
    setCorrectAnswer(exercise?.correctAnswer || "");
    setEcuacionesCompletas(false);

    // Si es un ejercicio nuevo, limpia también las ecuaciones
    if (!exercise || !exercise.equations) {
      setEquations(["", ""]);
    }
  }, [exercise, setEquations]);

  useEffect(() => {
    // Si no está activado el modo pistas, limpia todo
    if (!modoPistas) {
      if (pistas.length > 0) setPistas([]);
      return;
    }

    // Si las ecuaciones dejan de ser enteras, elimina las pistas del banco
    if (!ecuacionesSonEnteras && pistas.length > 0) {
      const preguntasBanco = Object.values(bancoPistas)
        .flat()
        .map((p) => p.pregunta);
      const pistasFiltradas = pistas.filter(
        (p) => !preguntasBanco.includes(p.pregunta)
      );
      if (pistasFiltradas.length !== pistas.length) {
        setPistas(pistasFiltradas);
        setSnackbarOpen(true);
      }
      return;
    }

    // Si modoPistas y ecuaciones completas y son enteras
    if (
      modoPistas &&
      ecuacionesCompletas &&
      ecuacionesSonEnteras &&
      Array.isArray(equations) &&
      equations.length === 2
    ) {
      const bancos = Object.values(bancoPistas).flat();

      // Si es edición de ejercicio con pistas activadas
      if (
        exercise &&
        exercise.pistas &&
        Array.isArray(exercise.pistas.pistas) &&
        exercise.pistas.activado
      ) {
        const pistasEdit = exercise.pistas.pistas.map((p) => {
          const pistaBanco = bancos.find((b) => b.pregunta === p.pregunta);
          if (pistaBanco) {
            return {
              pregunta: pistaBanco.pregunta,
              tipo: pistaBanco.tipo,
              valorEsperado: pistaBanco.valorEsperado(),
              respuesta: "",
            };
          } else {
            return { ...p };
          }
        });
        setPistas(pistasEdit);
        return;
      }

      // Si es nuevo ejercicio y no hay pistas, inicializa con 2 aleatorias
      if (pistas.length === 0) {
        const banco = bancoPistas[dificultad];
        const seleccionadas = banco
          .sort(() => 0.5 - Math.random())
          .slice(0, 2)
          .map((p) => ({
            ...p,
            valorEsperado: p.valorEsperado(),
            respuesta: "",
          }));
        setPistas(seleccionadas);
        return;
      }

      // Si ya hay pistas, actualiza valorEsperado de las del banco
      if (pistas.length > 0) {
        const pistasActualizadas = pistas.map((p) => {
          const pistaBanco = bancos.find((b) => b.pregunta === p.pregunta);
          if (pistaBanco && typeof pistaBanco.valorEsperado === "function") {
            return {
              ...p,
              tipo: pistaBanco.tipo,
              valorEsperado: pistaBanco.valorEsperado(),
            };
          }
          return p;
        });
        // Solo actualiza si cambió algo
        if (JSON.stringify(pistasActualizadas) !== JSON.stringify(pistas)) {
          setPistas(pistasActualizadas);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    modoPistas,
    ecuacionesCompletas,
    ecuacionesSonEnteras,
    equations,
    exercise,
    dificultad,
    pistas,
    bancoPistas,
  ]);

  useEffect(() => {
    if (!ecuacionesSonEnteras && pistas.length > 0) {
      // Obtén todas las preguntas del banco de pistas de cualquier dificultad
      const preguntasBanco = Object.values(bancoPistas)
        .flat()
        .map((p) => p.pregunta);

      // Filtra solo las pistas que NO están en el banco (pistas en blanco o personalizadas)
      const pistasFiltradas = pistas.filter(
        (p) => !preguntasBanco.includes(p.pregunta)
      );

      if (pistasFiltradas.length !== pistas.length) {
        setPistas(pistasFiltradas);
      }
    }
    // Solo depende de ecuacionesSonEnteras y pistas
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ecuacionesSonEnteras, pistas]);

  return (
    <>
      <Box
        sx={{
          maxWidth: "90vw",
          mx: "auto",
          mt: 4,
          px: { xs: 1, sm: 3 },
          width: "100%",
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 4,
            background: isDarkMode
              ? "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"
              : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            color: isDarkMode ? "white" : "#232526",
            boxShadow: "0 4px 24px rgba(30,60,114,0.10)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                textAlign: "center",
                color: isDarkMode ? "white" : "#1e3c72",
                letterSpacing: 1,
                mr: 1,
              }}
            >
              
              {exercise ? "Editar Ejercicio" : "Crear Ejercicio"}

            </Typography>
            <IconButton
              aria-label="Ayuda"
              onClick={() => setAyudaOpen(true)}
              size="large"
              sx={{ color: isDarkMode ? "#ffd700" : "#1e3c72" }}
            >
              <HelpOutlineIcon fontSize="inherit" />
            </IconButton>
          </Box>

          <form onSubmit={handleSubmit}>
            {/* Primera fila: Simulador y método */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 3,
                mb: 2,
              }}
            >
              <Paper
                elevation={2}
                sx={{
                  flex: 2,
                  p: 2,
                  background: isDarkMode
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(30,60,114,0.06)",
                  borderRadius: 3,
                  mb: { xs: 2, md: 0 },
                }}
              >
                {/* <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Simulador
                </Typography> */}
                <Simulador
                  equations={equations}
                  setEquations={setEquations}
                  defaultValues={defaultValues}
                  
                  ejercicioId={exercise?.id || null} 
                  isDarkMode={isDarkMode}
                  onValidate={(valido) => {
                    // console.log(
                    //   "¿Validación recibida en ExerciseForm?",
                    //   valido
                    // );
                    setEcuacionesCompletas(valido);
                  }}
                />
              </Paper>
            </Box>

            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                label="Pregunta"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={3}
                sx={{
                  background: isDarkMode ? "#232526" : "white",
                  borderRadius: 2,
                }}
              />
              {ecuacionesCompletas && description && (
                <FormControl fullWidth>
                  <InputLabel>Seleccione el método</InputLabel>
                  <Select
                    value={metodo}
                    onChange={(e) => setMetodo(e.target.value)}
                    label="Seleccione el método"
                    sx={{
                      background: isDarkMode ? "#232526" : "white",
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="Ecuaciones Simultaneas">
                      Ecuaciones Simultaneas
                    </MenuItem>
                    <MenuItem value="Igualación">Igualación</MenuItem>
                    <MenuItem value="Sustitución">Sustitución</MenuItem>
                    <MenuItem value="Reducción (Eliminación)">
                      Reducción (Eliminación)
                    </MenuItem>
                    <MenuItem value="Gráfico">Gráfico</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>

            {/* Switches y pistas */}
            {metodo && (
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  mb: 2,
                  background: isDarkMode ? "#232526" : "#f0f4fa",
                  borderRadius: 3,
                }}
              >
                <FormGroup sx={{ mb: 2 }}>
                  <MuiFormControlLabel
                    control={
                      <Switch
                        checked={simuladorVisible}
                        onChange={() => setSimuladorVisible((prev) => !prev)}
                        color="primary"
                      />
                    }
                    label="¿Desea que el simulador sea visible para el alumno durante el desarrollo del ejercicio?"
                  />
                  <Typography variant="caption">
                    Si selecciona "Sí", el alumno podrá ver el simulador al
                    responder este ejercicio.
                  </Typography>
                </FormGroup>

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={modoPistas}
                        onChange={() => setModoPistas((prev) => !prev)}
                        color="primary"
                      />
                    }
                    label="Activar pistas guiadas paso a paso (modo mapa del tesoro)"
                  />
                </FormGroup>

                {modoPistas && (
                  <Box sx={{ mt: 2 }}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Dificultad de las pistas</InputLabel>
                      <Select
                        value={dificultad}
                        label="Dificultad de las pistas"
                        onChange={(e) => setDificultad(e.target.value)}
                        sx={{
                          background: isDarkMode ? "#232526" : "white",
                          borderRadius: 2,
                        }}
                        disabled={!ecuacionesSonEnteras}
                      >
                        <MenuItem value="facil">Fácil</MenuItem>
                        <MenuItem value="intermedio">Intermedio</MenuItem>
                        <MenuItem value="dificil">Difícil</MenuItem>
                      </Select>
                    </FormControl>
                    <Typography variant="subtitle1" sx={{ mt: 1 }}>
                      Editar pistas:
                    </Typography>
                    {pistas.map((pista, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          mb: 1,
                          pl: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <TextField
                          label={`Pista ${idx + 1}`}
                          value={pista.pregunta}
                          onChange={(e) => {
                            const nuevas = [...pistas];
                            nuevas[idx].pregunta = e.target.value;
                            setPistas(nuevas);
                          }}
                          fullWidth
                          margin="dense"
                          sx={{
                            mr: 1,
                            background: isDarkMode ? "#232526" : "white",
                            borderRadius: 2,
                          }}
                        />
                        <TextField
                          label="Valor esperado"
                          type="number"
                          value={pista.valorEsperado}
                          onChange={(e) => {
                            const nuevas = [...pistas];
                            nuevas[idx].valorEsperado = Number(e.target.value);
                            setPistas(nuevas);
                          }}
                          size="small"
                          sx={{
                            width: 140,
                            mr: 1,
                            background: isDarkMode ? "#232526" : "white",
                            borderRadius: 2,
                          }}
                        />
                        <IconButton
                          aria-label="Subir pista"
                          disabled={idx === 0}
                          onClick={() => {
                            if (idx === 0) return;
                            const nuevas = [...pistas];
                            [nuevas[idx - 1], nuevas[idx]] = [
                              nuevas[idx],
                              nuevas[idx - 1],
                            ];
                            setPistas(nuevas);
                          }}
                          sx={{ ml: 1 }}
                        >
                          <ArrowUpwardIcon />
                        </IconButton>
                        <IconButton
                          aria-label="Bajar pista"
                          disabled={idx === pistas.length - 1}
                          onClick={() => {
                            if (idx === pistas.length - 1) return;
                            const nuevas = [...pistas];
                            [nuevas[idx], nuevas[idx + 1]] = [
                              nuevas[idx + 1],
                              nuevas[idx],
                            ];
                            setPistas(nuevas);
                          }}
                        >
                          <ArrowDownwardIcon />
                        </IconButton>
                        <IconButton
                          aria-label="Eliminar pista"
                          color="error"
                          onClick={() => {
                            const nuevas = pistas.filter((_, i) => i !== idx);
                            setPistas(nuevas);
                          }}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          // Filtra las preguntas ya usadas
                          if (!ecuacionesSonEnteras) return;
                          const usadas = pistas.map((p) => p.pregunta);
                          const disponibles = bancoPistas[dificultad].filter(
                            (p) => !usadas.includes(p.pregunta)
                          );
                          if (disponibles.length === 0 || pistas.length >= 5)
                            return; // Límite de 5

                          // Selecciona una aleatoria
                          const seleccionada =
                            disponibles[
                              Math.floor(Math.random() * disponibles.length)
                            ];
                          setPistas([
                            ...pistas,
                            {
                              ...seleccionada,
                              valorEsperado: seleccionada.valorEsperado(),
                              respuesta: "",
                            },
                          ]);
                        }}
                        disabled={!ecuacionesSonEnteras || agregarDeshabilitado}
                      >
                        Agregar pista
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          if (pistas.length >= 5) return;
                          setPistas([
                            ...pistas,
                            {
                              pregunta: "",
                              tipo: "numero",
                              valorEsperado: 0,
                              respuesta: "",
                            },
                          ]);
                        }}
                        disabled={pistas.length >= 5}
                      >
                        Agregar pista en blanco
                      </Button>
                    </Box>
                  </Box>
                )}
              </Paper>
            )}

            {/* Segunda fila: Tipo de respuesta y nombre */}
            {metodo && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                  mb: 2,
                }}
              >
                <FormControl fullWidth sx={{ flex: 1 }}>
                  <InputLabel>Tipo de Respuesta</InputLabel>
                  <Select
                    value={exerciseType}
                    onChange={(e) => setExerciseType(e.target.value)}
                    sx={{
                      background: isDarkMode ? "#232526" : "white",
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="Dicotomica">Dicotómica</MenuItem>
                    <MenuItem value="Opcion multiple">Opción múltiple</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Nombre del Ejercicio"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  fullWidth
                  sx={{
                    flex: 2,
                    background: isDarkMode ? "#232526" : "white",
                    borderRadius: 2,
                  }}
                />
              </Box>
            )}

            {/* Opciones de respuesta */}
            {exerciseType === "Dicotomica" && (
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  mb: 2,
                  background: isDarkMode ? "#232526" : "#f0f4fa",
                  borderRadius: 3,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Seleccione cuál será la respuesta correcta
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={trueFalseAnswer}
                    onChange={(e) => setTrueFalseAnswer(e.target.value)}
                    row
                  >
                    <FormControlLabel
                      value="Verdadero"
                      control={<Radio />}
                      label="Verdadero"
                    />
                    <FormControlLabel
                      value="Falso"
                      control={<Radio />}
                      label="Falso"
                    />
                  </RadioGroup>
                </FormControl>
              </Paper>
            )}
            {exerciseType === "Opcion multiple" && (
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  mb: 2,
                  background: isDarkMode ? "#232526" : "#f0f4fa",
                  borderRadius: 3,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Opciones de respuesta
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {multipleChoiceAnswers.map((answer, index) => (
                    <TextField
                      key={index}
                      label={`Opción ${index + 1}`}
                      value={answer}
                      onChange={(e) => {
                        const newAnswers = [...multipleChoiceAnswers];
                        newAnswers[index] = e.target.value;
                        setMultipleChoiceAnswers(newAnswers);
                      }}
                      fullWidth
                      sx={{
                        background: isDarkMode ? "#232526" : "white",
                        borderRadius: 2,
                      }}
                    />
                  ))}
                </Box>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Respuesta Correcta</InputLabel>
                  <Select
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    sx={{
                      background: isDarkMode ? "#232526" : "white",
                      borderRadius: 2,
                    }}
                  >
                    {multipleChoiceAnswers.map((answer, index) => (
                      <MenuItem key={index} value={answer}>
                        {answer || `Opción ${index + 1}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            )}

            {/* Botones */}
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{
                  fontWeight: 600,
                  minWidth: 120,
                  borderRadius: 2,
                  mr: 2,
                  background:
                    "linear-gradient(90deg, #ffd700 0%, #ffb300 100%)",
                  color: "#1e3c72",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #ffb300 0%, #ffd700 100%)",
                  },
                }}
                disabled={
                  !ecuacionesCompletas ||
                  !exerciseName ||
                  !description ||
                  !metodo ||
                  !exerciseType
                }
              >
                Guardar
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={onCancel}
                sx={{
                  fontWeight: 600,
                  minWidth: 120,
                  borderRadius: 2,
                  color: isDarkMode ? "white" : "#1e3c72",
                  borderColor: isDarkMode ? "#ffd700" : "#1e3c72",
                  "&:hover": {
                    borderColor: "#ffb300",
                    background: isDarkMode
                      ? "rgba(255,215,0,0.08)"
                      : "rgba(30,60,114,0.08)",
                  },
                }}
              >
                Cancelar
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="warning"
          sx={{ width: "100%" }}
        >
          Las pistas del banco han sido eliminadas porque las ecuaciones ya no
          son enteras. Solo puedes agregar pistas en blanco.
        </Alert>
      </Snackbar>
      <Dialog
        open={ayudaOpen}
        onClose={() => setAyudaOpen(false)}
        maxWidth="sm"
        fullWidth
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
          ¿Cómo crear o editar un ejercicio?
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
            Instrucciones para crear o editar un ejercicio
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>1. Ingresa las ecuaciones:</strong> Escribe dos ecuaciones
            lineales en la forma <code>ax + by = c</code>. Puedes usar enteros,
            fracciones o constantes como π.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>2. Presiona "Calcular":</strong> El simulador validará las
            ecuaciones y mostrará la solución gráfica.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>3. Completa los campos:</strong> Escribe la pregunta,
            selecciona el método y el tipo de respuesta.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>4. (Opcional) Activa el modo pistas:</strong> Si las
            ecuaciones son enteras, podrás agregar pistas automáticas del banco.
            Si no, solo podrás agregar pistas en blanco.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>5. Guarda el ejercicio:</strong> Cuando todos los campos
            estén completos, haz clic en <b>Guardar</b>.
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: isDarkMode ? "#90caf9" : "#1976d2", mt: 2 }}
          >
            <strong>Nota:</strong> Si cambias las ecuaciones y dejan de ser
            enteras, las pistas automáticas se eliminarán.
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
            onClick={() => setAyudaOpen(false)}
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
}

export default ExerciseForm;
