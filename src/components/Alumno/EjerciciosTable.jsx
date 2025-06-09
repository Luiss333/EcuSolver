import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel as MuiFormControlLabel,
  TextField,
  useTheme,
  Chip,
} from "@mui/material";
import Simulador from "../Simulador/Simulador";
import axios from "axios";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AyudaMetodoDialog from "./AyudaMetodoDialog";
import IconButton from "@mui/material/IconButton";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

const metodoToTabIndex = {
  "ecuaciones simultaneas": 0,
  igualacion: 1,
  igualación: 1,
  sustitucion: 2,
  sustitución: 2,
  reduccion: 3,
  reducción: 3,
  "reduccion (eliminacion)": 3,
  "reducción (eliminación)": 3,
  grafico: 4,
  gráfico: 4,
};

const tabIndexToNombre = [
  "Ecuaciones Simultaneas",
  "Igualación",
  "Sustitución",
  "Reducción (Eliminación)",
  "Gráfico",
];

const EjerciciosTable = ({ id, grupoAL, token, equations, setEquations }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [grupoId, setGrupoId] = useState(null);
  const [ejercicios, setEjercicios] = useState([]);
  const [selectedEjercicio, setSelectedEjercicio] = useState(null);
  const [respuesta, setRespuesta] = useState("");
  const [resultado, setResultado] = useState(null);
  const [showSimulador, setShowSimulador] = useState(false);

  // Estado para pistas
  const [pistaIndex, setPistaIndex] = useState(0);
  const [pistasRespuestas, setPistasRespuestas] = useState([]);
  const [pistasError, setPistasError] = useState("");

  const [desarrolloTexto, setDesarrolloTexto] = useState("");
  const [desarrolloImagen, setDesarrolloImagen] = useState(null);

  const [ejerciciosResueltos, setEjerciciosResueltos] = useState([]);

  const [modoPractica, setModoPractica] = useState(false);

  const [calificacionesAlumno, setCalificacionesAlumno] = useState({});

  const handleResolver = (ejercicio) => {
    setSelectedEjercicio(ejercicio);
    setModoPractica(false);
    setRespuesta("");
    setResultado(null);
    setShowSimulador(false);
    setPistaIndex(0);
    setPistasRespuestas([]);
    setPistasError("");
  };

  const handlePracticar = (ejercicio) => {
    setSelectedEjercicio(ejercicio);
    setModoPractica(true);
    setRespuesta("");
    setResultado(null);
    setShowSimulador(false);
    setPistaIndex(0);
    setPistasRespuestas([]);
    setPistasError("");
  };

  const [ayudaOpen, setAyudaOpen] = useState(false);
  const [ayudaTabIndex, setAyudaTabIndex] = useState(0);
  const [links, setLinks] = useState([]);
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await fetch(
          "https://backend-tt-209366905887.us-central1.run.app/links-multimedia-publico"
        );
        const data = await res.json();
        setLinks(data.links);
      } catch (e) {
        console.error("Error al obtener links:", e);
      }
    };
    fetchLinks();
  }, []);

  useEffect(() => {
    if (!id || !grupoId) return;
    const fetchResueltos = async () => {
      try {
        const response = await fetch(
          `https://backend-tt-209366905887.us-central1.run.app/calificaciones/resueltos?alumno_id=${id}&grupo_id=${grupoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setEjerciciosResueltos(data.resueltos || []);
      } catch (error) {
        console.error("Error al obtener ejercicios resueltos:", error);
      }
    };
    fetchResueltos();
  }, [id, grupoId, token]);

  useEffect(() => {
    const fetchGrupoId = async () => {
      try {
        const response = await fetch(
          `https://backend-tt-209366905887.us-central1.run.app/grupo/id?nombreGrupo=${grupoAL}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setGrupoId(data.grupoId);
      } catch (error) {
        console.error("Error al obtener el ID del grupo:", error);
      }
    };

    if (grupoAL) {
      fetchGrupoId();
    }
  }, [grupoAL, token]);

  useEffect(() => {
    if (!grupoId) return;

    const fetchEjercicios = async () => {
      try {
        const response = await fetch(
          `https://backend-tt-209366905887.us-central1.run.app/ejercicios/grupo/${grupoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setEjercicios(data.ejercicios);
        // console.log("Ejercicios recibidos:", data.ejercicios);
      } catch (error) {
        console.error("Error al obtener los ejercicios:", error);
      }
    };

    fetchEjercicios();
  }, [grupoId, token]);

  // Validación de pista
  const validarPista = (pista, respuesta) => {
    if (pista.tipo === "numero") {
      return Number(respuesta) === Number(pista.valorEsperado);
    }
    if (pista.tipo === "coordenada" && Array.isArray(pista.valorEsperado)) {
      const [x, y] = respuesta.split(",").map(Number);
      return (
        Math.abs(x - pista.valorEsperado[0]) < 0.01 &&
        Math.abs(y - pista.valorEsperado[1]) < 0.01
      );
    }
    return false;
  };

  const handlePistaSubmit = (e) => {
    e.preventDefault();
    let pistasArr = [];
    try {
      if (selectedEjercicio.pistas && selectedEjercicio.pistas !== "null") {
        const pistasObj =
          typeof selectedEjercicio.pistas === "string"
            ? JSON.parse(selectedEjercicio.pistas)
            : selectedEjercicio.pistas;
        pistasArr = pistasObj.pistas || [];
      }
    } catch {
      pistasArr = [];
    }
    const pista = pistasArr[pistaIndex];
    const respuesta = pistasRespuestas[pistaIndex] || "";
    if (pista && validarPista(pista, respuesta)) {
      setPistaIndex(pistaIndex + 1);
      setPistasError("");
    } else {
      setPistasError("Respuesta incorrecta. Intenta de nuevo.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviandoRespuesta(true);

    const resultado =
      (selectedEjercicio.answer || selectedEjercicio.correctAnswer) ===
      respuesta
        ? "correcto"
        : "incorrecto";

    setResultado(
      resultado === "correcto"
        ? "¡Respuesta correcta!"
        : "Respuesta incorrecta. Intenta de nuevo."
    );

    if (!modoPractica) {
      try {
        await fetch("https://backend-tt-209366905887.us-central1.run.app/calificaciones", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            alumno_id: id,
            ejercicio_id: selectedEjercicio.id,
            grupo_id: grupoId,
            resultado,
          }),
        });
        // Actualiza ejerciciosResueltos localmente
        setEjerciciosResueltos((prev) => [...prev, selectedEjercicio.id]);
      } catch (error) {
        console.error("Error al conectar con el servidor:", error);
      }

      if (desarrolloTexto || desarrolloImagen) {
        const formData = new FormData();
        formData.append("alumno_id", id);
        formData.append("ejercicio_id", selectedEjercicio.id);
        formData.append("grupo_id", grupoId);
        formData.append("desarrolloTexto", desarrolloTexto);
        if (desarrolloImagen) {
          formData.append("desarrolloImagen", desarrolloImagen);
        }

        try {
          await axios.post(
            "https://backend-tt-209366905887.us-central1.run.app/desarrollo-alumno",
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } catch (error) {
          console.error("Error al subir el desarrollo:", error);
        }
      }
    }

    setEnviandoRespuesta(false);
  };

  const normalizar = (str) =>
    (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  useEffect(() => {
    if (!id || !grupoId) return;
    const fetchCalificaciones = async () => {
      try {
        const response = await fetch(
          `https://backend-tt-209366905887.us-central1.run.app/calificaciones/alumno?alumno_id=${id}&grupo_id=${grupoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setCalificacionesAlumno(data.calificaciones || {});
      } catch (error) {
        console.error("Error al obtener calificaciones:", error);
      }
    };
    fetchCalificaciones();
  }, [id, grupoId, token]);

  if (selectedEjercicio) {
    // Pistas
    let pistas = [];
    let pistasActivadas = false;
    try {
      if (selectedEjercicio.pistas && selectedEjercicio.pistas !== "null") {
        const pistasObj =
          typeof selectedEjercicio.pistas === "string"
            ? JSON.parse(selectedEjercicio.pistas)
            : selectedEjercicio.pistas;
        pistas = pistasObj.pistas || [];
        pistasActivadas = pistasObj.activado && pistas.length > 0;
      }
    } catch {
      pistas = [];
      pistasActivadas = false;
    }

    // --- Lógica robusta para tabIndex ---
    const metodoRaw =
      selectedEjercicio.metodo ||
      selectedEjercicio.method ||
      selectedEjercicio.tipo ||
      "";
    const metodo = normalizar(metodoRaw);

    let tabIndex = metodoToTabIndex[metodo];
    if (tabIndex === undefined) {
      // Fallback: buscar coincidencia parcial
      const keys = Object.keys(metodoToTabIndex);
      const found = keys.find((k) => metodo.includes(k));
      tabIndex = found ? metodoToTabIndex[found] : 0;
    }

    const metodoNombre = tabIndexToNombre[tabIndex] || metodoRaw;

    return (
      <Paper
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 4,
          background: isDark
            ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
            : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          boxShadow: isDark
            ? "0 4px 24px rgba(40,62,81,0.25)"
            : "0 4px 24px rgba(30,60,114,0.10)",
          maxWidth: 700,
          mx: "auto",
          mt: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mr: 1,
              fontWeight: 700,
              color: isDark ? "#ffd700" : "#283e51",
              flex: 1,
              minWidth: 0,
              wordBreak: "break-word",
            }}
          >
            {selectedEjercicio.name}
          </Typography>
        </Box>
        <AyudaMetodoDialog
          open={ayudaOpen}
          onClose={() => setAyudaOpen(false)}
          links={links}
          tabIndex={ayudaTabIndex}
          metodoNombre={metodoNombre}
        />
        <Typography
          variant="body1"
          sx={{
            mb: 2,
            color: isDark ? "#fff" : "#283e51",
            fontSize: 17,
          }}
        >
          {selectedEjercicio.description}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 1,
              color: isDark ? "#ffd700" : "#283e51",
              fontWeight: 600,
            }}
          >
            Método de resolución: <b>{metodoNombre}</b>
          </Typography>
          <IconButton
            aria-label="ayuda"
            color="primary"
            onClick={() => {
              setAyudaTabIndex(tabIndex);
              setAyudaOpen(true);
            }}
            size="small"
            sx={{ ml: 1 }}
          >
            <HelpOutlineIcon />
          </IconButton>
        </Box>

        {selectedEjercicio.simulador === "si" && (
          <>
            <FormGroup>
              <MuiFormControlLabel
                control={
                  <Switch
                    checked={showSimulador}
                    onChange={() => setShowSimulador((prev) => !prev)}
                    color="primary"
                  />
                }
                label="Simulador"
              />
              <Typography variant="caption" sx={{ mb: 2 }}>
                El alumno puede hacer uso del simulador como apoyo para
                verificar su solución, actuando como una herramienta
                complementaria.
              </Typography>
            </FormGroup>

            {showSimulador && (
              <Box
                sx={{
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "30vh",
                  mb: 2,
                }}
              >
                <Simulador equations={equations} setEquations={setEquations} />
              </Box>
            )}
          </>
        )}

        {/* Pistas paso a paso */}
        {pistasActivadas && pistaIndex < pistas.length && (
          <Box sx={{ mt: 2 }}>
            <form onSubmit={handlePistaSubmit}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 1,
                  color: isDark ? "#ffd700" : "#283e51",
                  fontWeight: 600,
                }}
              >
                Pista {pistaIndex + 1}: {pistas[pistaIndex].pregunta}
              </Typography>
              <TextField
                label={
                  pistas[pistaIndex].tipo === "coordenada"
                    ? "Respuesta (x,y)"
                    : "Respuesta"
                }
                value={pistasRespuestas[pistaIndex] || ""}
                onChange={(e) => {
                  const nuevas = [...pistasRespuestas];
                  nuevas[pistaIndex] = e.target.value;
                  setPistasRespuestas(nuevas);
                }}
                fullWidth
                margin="normal"
                sx={{
                  input: { color: isDark ? "#ffd700" : "#283e51" },
                  label: { color: isDark ? "#ffd700" : "#283e51" },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  background: isDark
                    ? "linear-gradient(90deg, #ffd700 0%, #ffe066 100%)"
                    : "linear-gradient(90deg, #ffd700 0%, #ffe066 100%)",
                  color: isDark ? "#283e51" : "#283e51",
                  "&:hover": {
                    background: isDark
                      ? "linear-gradient(90deg, #ffe066 0%, #ffd700 100%)"
                      : "linear-gradient(90deg, #ffe066 0%, #ffd700 100%)",
                  },
                  mt: 1,
                }}
              >
                Enviar pista
              </Button>
              {pistasError && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {pistasError}
                </Typography>
              )}
            </form>
          </Box>
        )}

        {/* Cuando todas las pistas estén correctas, mostrar la pregunta principal */}
        {(!pistasActivadas || pistaIndex >= pistas.length) && (
          <>
            {/* Apartado Desarrollo */}
            {!modoPractica && (
              <Box sx={{ mt: 4, mb: 2 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: isDark ? "#ffd700" : "#283e51" }}
                >
                  Desarrollo (opcional)
                </Typography>
                <TextField
                  label="Explica tu razonamiento o desarrollo (opcional)"
                  multiline
                  minRows={3}
                  fullWidth
                  value={desarrolloTexto}
                  onChange={(e) => setDesarrolloTexto(e.target.value)}
                  sx={{
                    mb: 2,
                    input: { color: isDark ? "#ffd700" : "#283e51" },
                    label: { color: isDark ? "#ffd700" : "#283e51" },
                  }}
                />
                <Button variant="outlined" component="label" sx={{ mb: 1 }}>
                  Subir imagen (opcional)
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      if (e.target.files.length > 0) {
                        setDesarrolloImagen(e.target.files[0]);
                      }
                    }}
                  />
                </Button>
                {desarrolloImagen && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Imagen seleccionada: {desarrolloImagen.name}
                  </Typography>
                )}
              </Box>
            )}

            <form onSubmit={handleSubmit}>
              {selectedEjercicio.type === "Dicotomica" && (
                <RadioGroup
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  sx={{ mb: 2 }}
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
              )}
              {selectedEjercicio.type === "Opcion multiple" && (
                <RadioGroup
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  sx={{ mb: 2 }}
                >
                  {selectedEjercicio.answers.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={option}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={
                  enviandoRespuesta ||
                  ejerciciosResueltos.includes(selectedEjercicio.id)
                }
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  background: isDark
                    ? "linear-gradient(90deg, #ffd700 0%, #ffe066 100%)"
                    : "linear-gradient(90deg, #ffd700 0%, #ffe066 100%)",
                  color: isDark ? "#283e51" : "#283e51",
                  "&:hover": {
                    background: isDark
                      ? "linear-gradient(90deg, #ffe066 0%, #ffd700 100%)"
                      : "linear-gradient(90deg, #ffe066 0%, #ffd700 100%)",
                  },
                  mt: 1,
                }}
              >
                Enviar Respuesta
              </Button>
            </form>
          </>
        )}

        {resultado && (
          <Typography
            variant="h6"
            sx={{
              mt: 2,
              color: resultado.includes("correcta!") ? "#43a047" : "#e53935",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            {resultado}
          </Typography>
        )}
        <Button
          variant="outlined"
          color="secondary"
          sx={{
            mt: 3,
            fontWeight: 600,
            borderRadius: 2,
            color: isDark ? "#ffd700" : "#283e51",
            borderColor: isDark ? "#ffd700" : "#283e51",
            "&:hover": {
              borderColor: isDark ? "#ffe066" : "#ffd700",
              color: isDark ? "#ffe066" : "#ffd700",
            },
          }}
          onClick={() => window.location.reload()} // <--- Cambia aquí
        >
          Salir
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
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
        Ejercicios asignados
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 4,
          background: isDark
            ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
            : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          boxShadow: isDark
            ? "0 4px 24px rgba(40,62,81,0.25)"
            : "0 4px 24px rgba(30,60,114,0.10)",
        }}
      >
        <Table>
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
              <TableCell
                sx={{ color: "#fff", fontWeight: 600, textAlign: "center" }}
              >
                Acciones
              </TableCell>
              <TableCell
                sx={{ color: "#fff", fontWeight: 600, textAlign: "center" }}
              >
                Calificación
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ejercicios.map((ejercicio) => (
              <TableRow
                key={ejercicio.id}
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
                  {ejercicio.name}
                  {ejerciciosResueltos.includes(ejercicio.id) && (
                    <Chip
                      icon={<CheckCircleIcon sx={{ color: "#43a047" }} />}
                      label="Resuelto"
                      size="small"
                      sx={{
                        ml: 1,
                        background: "#e8f5e9",
                        color: "#43a047",
                        fontWeight: 600,
                      }}
                    />
                  )}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleResolver(ejercicio)}
                    sx={{
                      mr: 1,
                      fontWeight: 600,
                      borderRadius: 2,
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
                    disabled={ejerciciosResueltos.includes(ejercicio.id)}
                    startIcon={<CheckCircleIcon />}
                  >
                    Resolver
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handlePracticar(ejercicio)}
                    sx={{
                      fontWeight: 600,
                      borderRadius: 2,
                      color: isDark ? "#ffd700" : "#283e51",
                      borderColor: isDark ? "#ffd700" : "#283e51",
                      "&:hover": {
                        borderColor: isDark ? "#ffe066" : "#ffd700",
                        color: isDark ? "#ffe066" : "#ffd700",
                      },
                    }}
                    startIcon={<PlayCircleOutlineIcon />}
                  >
                    Practicar
                  </Button>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {calificacionesAlumno[ejercicio.id] ? (
                    calificacionesAlumno[ejercicio.id] === "correcto" ? (
                      <Chip
                        label="Correcto"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      <Chip
                        label="Incorrecto"
                        color="error"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    )
                  ) : (
                    <Chip
                      label="Sin calificar"
                      color="default"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EjerciciosTable;
