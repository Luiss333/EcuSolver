import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Button,
  Typography,
  List,
  ListItem,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Tabs, Tab, TextField } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import DeleteIcon from "@mui/icons-material/Delete";

const MultimediosView = ({ isDarkMode }) => {
  const [archivos, setArchivos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [gruposPorAsignar, setGruposPorAsignar] = useState([]);
  const [gruposSeleccionados, setGruposSeleccionados] = useState([]);
  const [archivoSubir, setArchivoSubir] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [archivoAEliminar, setArchivoAEliminar] = useState(null);
  const [archivoVistaPrevia, setArchivoVistaPrevia] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState(null);

  const [archivoSeleccionadoEliminar, setArchivoSeleccionadoEliminar] =
    useState(null);
  const [gruposSeleccionadosEliminar, setGruposSeleccionadosEliminar] =
    useState([]);

  const [alertDialog, setAlertDialog] = useState({
    open: false,
    message: "",
    onClose: null,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // "success" | "error" | "info" | "warning"
  });

  const [tabIndex, setTabIndex] = useState(0);
  const [tabContents, setTabContents] = useState(["", "", "", "", ""]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Mover fetchArchivos fuera del useEffect
  const fetchArchivos = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("https://backend-tt-209366905887.us-central1.run.app/archivos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filtrar archivos únicos por `ruta_archivo`
      const archivosUnicos = Object.values(
        response.data.archivos.reduce((acc, archivo) => {
          acc[archivo.ruta_archivo] = archivo;
          return acc;
        }, {})
      );

      setArchivos(archivosUnicos);
    } catch (error) {
      console.error("Error al obtener los archivos:", error);
    }
  };

  useEffect(() => {
    fetchArchivos();

    const fetchGrupos = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("https://backend-tt-209366905887.us-central1.run.app/grupos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGrupos(response.data.grupos);
      } catch (error) {
        console.error("Error al obtener los grupos:", error);
      }
    };

    fetchGrupos();
  }, []);

  useEffect(() => {
    if (archivoSeleccionado || archivoSeleccionadoEliminar) {
      const fetchGruposAsignados = async () => {
        const token = localStorage.getItem("token");
        try {
          // Reemplazar "\" por "\\" en la ruta
          const rutaNormalizada = encodeURIComponent(
            (
              archivoSeleccionado || archivoSeleccionadoEliminar
            ).ruta_archivo.replace(/\\/g, "\\\\")
          );
          console.log("Ruta enviada al backend:", rutaNormalizada); // Depuración

          const response = await axios.get(
            `https://backend-tt-209366905887.us-central1.run.app/archivos/grupos/${rutaNormalizada}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setGruposPorAsignar(response.data.gruposAsignados || []);
          console.log("Grupos asignados:", response.data.gruposAsignados); // Depuración
        } catch (error) {
          console.error("Error al obtener los grupos asignados:", error);
        }
      };

      fetchGruposAsignados();
    }
  }, [archivoSeleccionado, archivoSeleccionadoEliminar]);

  const handleEliminarPara = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const rutaNormalizada = encodeURIComponent(
        archivoSeleccionadoEliminar.ruta_archivo
      );

      for (const grupo of gruposSeleccionadosEliminar) {
        await axios.put(
          `https://backend-tt-209366905887.us-central1.run.app/archivos/eliminar-para/${rutaNormalizada}`,
          { grupos: [grupo] },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      showSnackbar("Referencias eliminadas con éxito.", "success");
      setArchivoSeleccionadoEliminar(null);
      setGruposSeleccionadosEliminar([]);
      await fetchArchivos();
    } catch (error) {
      console.error("Error al eliminar referencias:", error);
      showSnackbar("Error al eliminar referencias.", "error");
    }
  };

  const handleEliminar = (ruta) => {
    setArchivoAEliminar(ruta);
    setOpenConfirm(true);
  };

  const confirmarEliminar = async () => {
    setOpenConfirm(false);
    if (!archivoAEliminar) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `https://backend-tt-209366905887.us-central1.run.app/archivos/${encodeURIComponent(
          archivoAEliminar
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setArchivos(
        archivos.filter((archivo) => archivo.ruta_archivo !== archivoAEliminar)
      );
      showSnackbar("Archivo eliminado con éxito.", "success");
    } catch (error) {
      console.error("Error al eliminar el archivo:", error);
      showSnackbar("Error al eliminar el archivo.", "error");
    }
    setArchivoAEliminar(null);
  };

  const handleAsignar = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const rutaNormalizada = encodeURIComponent(
        archivoSeleccionado.ruta_archivo
      );
      await axios.put(
        `https://backend-tt-209366905887.us-central1.run.app/archivos/asignar/${rutaNormalizada}`,
        { grupos: gruposSeleccionados },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showSnackbar("Grupos asignados con éxito.", "success");
      setArchivoSeleccionado(null);
      setGruposSeleccionados([]);
    } catch (error) {
      console.error("Error al asignar grupos:", error);
      showSnackbar("Error al asignar grupos.", "error");
    }
  };

  const handleArchivoChange = (e) => {
    setArchivoSubir(e.target.files[0]);
  };

  // ...dentro del formulario de subir archivo...
  const [nuevoArchivo, setNuevoArchivo] = useState({
    tab_index: 0,
    tipo: "",
  });

  const handleArchivoFormChange = (e) => {
    setNuevoArchivo({ ...nuevoArchivo, [e.target.name]: e.target.value });
  };

  const handleSubirArchivo = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!archivoSubir) {
      showSnackbar("Por favor, selecciona un archivo.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivoSubir);
    formData.append("tab_index", nuevoArchivo.tab_index);
    formData.append("tipo", nuevoArchivo.tipo);

    try {
      await axios.post("https://backend-tt-209366905887.us-central1.run.app/archivos/subir", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchArchivos();
      showSnackbar("Archivo subido con éxito.", "success");
      setArchivoSubir(null);
      setNuevoArchivo({ tab_index: 0, tipo: "" });
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      showSnackbar("Error al subir el archivo.", "error");
    }
  };

  const handleSeleccionarArchivoEliminar = async (archivo) => {
    const token = localStorage.getItem("token");

    try {
      // Obtener los grupos asignados para el archivo seleccionado
      const rutaNormalizada = encodeURIComponent(
        archivo.ruta_archivo.replace(/\\/g, "\\\\")
      );
      const response = await axios.get(
        `https://backend-tt-209366905887.us-central1.run.app/archivos/grupos/${rutaNormalizada}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const gruposAsignados = response.data.gruposAsignados || [];
      setGruposPorAsignar(gruposAsignados);

      // Validar si hay grupos válidos
      if (gruposAsignados.filter((grupo) => grupo !== null).length === 0) {
        setAlertDialog({
          open: true,
          message: "Primero asigne un grupo al archivo antes de eliminar.",
          onClose: () =>
            setAlertDialog({ open: false, message: "", onClose: null }),
        });
        return; // No establecer el archivo seleccionado para eliminar
      }

      // Establecer el archivo seleccionado para eliminar
      setArchivoSeleccionadoEliminar(archivo);
    } catch (error) {
      console.error("Error al obtener los grupos asignados:", error);
      setAlertDialog({
        open: true,
        message: "Error al obtener los grupos asignados.",
        onClose: () =>
          setAlertDialog({ open: false, message: "", onClose: null }),
      });
    }
  };

  const toggleGrupoSeleccionado = (grupoNombre) => {
    if (gruposSeleccionados.includes(grupoNombre)) {
      setGruposSeleccionados(
        gruposSeleccionados.filter((g) => g !== grupoNombre)
      );
    } else {
      setGruposSeleccionados([...gruposSeleccionados, grupoNombre]);
    }
  };

  const toggleGrupoSeleccionadoEliminar = (grupoNombre) => {
    if (gruposSeleccionadosEliminar.includes(grupoNombre)) {
      setGruposSeleccionadosEliminar(
        gruposSeleccionadosEliminar.filter((g) => g !== grupoNombre)
      );
    } else {
      setGruposSeleccionadosEliminar([
        ...gruposSeleccionadosEliminar,
        grupoNombre,
      ]);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleTabContentChange = (idx, value) => {
    setTabContents((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  const [nuevoLink, setNuevoLink] = useState({
    url: "",
    tipo: "",
    tab_index: 0,
  });
  const [links, setLinks] = useState([]);

  const tiposMultimedia = ["Video", "Audio", "Imagen", "PDF", "Otro"];
  const [tipoTabIndex, setTipoTabIndex] = useState(0);

  const fetchLinks = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("https://backend-tt-209366905887.us-central1.run.app/links-multimedia", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLinks(res.data.links);
    } catch (e) {
      console.error("Error al obtener links:", e);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleLinkChange = (e) => {
    setNuevoLink({ ...nuevoLink, [e.target.name]: e.target.value });
  };

  const handleSubmitLink = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post("https://backend-tt-209366905887.us-central1.run.app/links-multimedia", nuevoLink, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNuevoLink({ url: "", tipo: "", tab_index: 0 });
      fetchLinks();
      showSnackbar("Link guardado con éxito.", "success");
    } catch (error) {
      showSnackbar("Error al guardar el link.", "error");
    }
  };

  // Nuevo: función para eliminar link multimedia
  const handleEliminarLink = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`https://backend-tt-209366905887.us-central1.run.app/links-multimedia/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLinks();
      showSnackbar("Link eliminado con éxito.", "success");
    } catch (error) {
      showSnackbar("Error al eliminar el link.", "error");
    }
  };

  // Función para renderizar el contenido multimedia
  const renderMedia = (item, expanded = false, onExpand = null) => {
    if (item.tipo === "Video") {
      // YouTube
      if (
        !item.esArchivo &&
        (item.url.includes("youtube.com") || item.url.includes("youtu.be"))
      ) {
        const youtubeId = item.url.includes("youtube.com")
          ? item.url.split("v=")[1]?.split("&")[0]
          : item.url.split("/").pop();

        if (!expanded) {
          // Miniatura con botón de reproducir
          return (
            <Box
              sx={{
                position: "relative",
                width: 220,
                height: 124,
                cursor: "pointer",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 2,
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                alt="YouTube thumbnail"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.3)",
                }}
              >
                <Button
                  variant="contained"
                  color="error"
                  sx={{
                    borderRadius: "50%",
                    minWidth: 0,
                    width: 56,
                    height: 56,
                    p: 0,
                    boxShadow: 3,
                    opacity: 0.9,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDialogContent(item);
                    setDialogOpen(true);
                  }}
                >
                  <svg width="36" height="36" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.5)" />
                    <polygon
                      points="20,16 34,24 20,32"
                      fill="#fff"
                      style={{ filter: "drop-shadow(0 0 2px #000)" }}
                    />
                  </svg>
                </Button>
              </Box>
            </Box>
          );
        }

        // Vista ampliada (Dialog)
        return (
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              borderRadius: 8,
              maxWidth: "100%",
            }}
          />
        );
      }
      // Vimeo
      if (!item.esArchivo && item.url.includes("vimeo.com")) {
        const vimeoId = item.url.split("/").pop();
        return (
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}`}
            width={expanded ? "560" : "100%"}
            height={expanded ? "315" : "180"}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Vimeo video player"
            style={{
              borderRadius: 8,
              maxWidth: "100%",
            }}
          />
        );
      }
      // Video archivo
      return (
        <video
          controls
          style={{
            width: expanded ? 560 : "100%",
            borderRadius: 8,
            maxHeight: expanded ? 400 : 180,
          }}
        >
          <source src={item.url} />
          Tu navegador no soporta la reproducción de video.
        </video>
      );
    }
    if (item.tipo === "Imagen") {
      return (
        <img
          src={item.url}
          alt={item.nombre || "Imagen"}
          style={{
            maxWidth: expanded ? 500 : 120,
            borderRadius: 8,
            width: expanded ? "100%" : undefined,
          }}
        />
      );
    }
    if (item.tipo === "PDF") {
      return (
        <iframe
          src={item.url}
          title="Vista previa PDF"
          width={expanded ? "100%" : 120}
          height={expanded ? 600 : 60}
          style={{ border: "none", borderRadius: 8 }}
        />
      );
    }
    if (item.tipo === "Audio") {
      return (
        <audio controls style={{ width: expanded ? 400 : 120 }}>
          <source src={item.url} />
          Tu navegador no soporta la reproducción de audio.
        </audio>
      );
    }
    // Otro tipo
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer">
        {item.nombre || item.url}
      </a>
    );
  };

  const isDark = isDarkMode;

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        mt: 4,
        px: { xs: 0.5, sm: 2 },
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 2, md: 3 },
          alignItems: "stretch",
        }}
      >
        <Box sx={{ flex: 1, minWidth: { xs: 0, md: 320 } }}>
          {/* Subir archivo */}
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 3,
              background: isDark
                ? "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"
                : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              color: isDark ? "white" : "#232526",
              borderRadius: 3,
              boxShadow: "0 4px 24px rgba(30,60,114,0.10)",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Subir Archivo
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubirArchivo}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              {/* Selector de archivo centrado */}
              <Button
                variant="contained"
                component="label"
                sx={{
                  background:
                    "linear-gradient(90deg, #ffd700 0%, #ffb300 100%)",
                  color: "#1e3c72",
                  fontWeight: 600,
                  minWidth: 56,
                  minHeight: 56,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #ffb300 0%, #ffd700 100%)",
                  },
                }}
              >
                <CloudUploadIcon fontSize="large" />
                <input type="file" hidden onChange={handleArchivoChange} />
              </Button>
              <Typography sx={{ fontSize: 15, mb: 1, textAlign: "center" }}>
                {archivoSubir
                  ? archivoSubir.name
                  : "Ningún archivo seleccionado"}
              </Typography>
              {/* Campos de sección y tipo en una fila */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <TextField
                  select
                  label="Sección"
                  name="tab_index"
                  value={nuevoArchivo.tab_index}
                  onChange={handleArchivoFormChange}
                  required
                  sx={{
                    minWidth: 120,
                    background: isDark ? "#232526" : "white",
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value={0}>Ecuaciones Simultaneas</MenuItem>
                  <MenuItem value={1}>Igualación</MenuItem>
                  <MenuItem value={2}>Sustitución</MenuItem>
                  <MenuItem value={3}>Reducción (Eliminación)</MenuItem>
                  <MenuItem value={4}>Gráfico</MenuItem>
                </TextField>
                <TextField
                  select
                  label="Tipo"
                  name="tipo"
                  value={nuevoArchivo.tipo}
                  onChange={handleArchivoFormChange}
                  required
                  sx={{
                    minWidth: 120,
                    background: isDark ? "#232526" : "white",
                    borderRadius: 2,
                  }}
                >
                  {tiposMultimedia.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ fontWeight: 600, minWidth: 80, mt: 1 }}
              >
                Subir
              </Button>
            </Box>
          </Paper>

          {/* Archivos subidos */}
          {archivos.length > 0 && (
            <Paper
              elevation={3}
              sx={{
                p: 3,
                mb: 3,
                background: isDark
                  ? "linear-gradient(135deg, #283e51 0%, #485563 100%)"
                  : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                color: isDark ? "white" : "#1e3c72",
                borderRadius: 3,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Archivos Subidos
              </Typography>
              <List sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {archivos.map((archivo) => (
                  <ListItem
                    key={archivo.ruta_archivo}
                    sx={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      background: isDark
                        ? "rgba(255,255,255,0.07)"
                        : "rgba(30,60,114,0.06)",
                      borderRadius: 2,
                      px: 3,
                      py: 2,
                      boxShadow: "0 2px 8px rgba(30,60,114,0.06)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: 16,
                        mb: 1,
                        maxWidth: "100%",
                        wordBreak: "break-all",
                        textAlign: "left",
                      }}
                    >
                      {archivo.nombre_archivo}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="info"
                        sx={{ fontWeight: 600, minWidth: 80, px: 1 }}
                        onClick={() => setArchivoVistaPrevia(archivo)}
                      >
                        Vista previa
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        sx={{ fontWeight: 600, minWidth: 70, px: 1 }}
                        onClick={() => setArchivoSeleccionado(archivo)}
                      >
                        Asignar
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="warning"
                        sx={{ fontWeight: 600, minWidth: 90, px: 1 }}
                        onClick={() =>
                          handleSeleccionarArchivoEliminar(archivo)
                        }
                      >
                        Eliminar para
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        sx={{
                          fontWeight: 600,
                          minWidth: 70,
                          px: 1,
                          color: isDarkMode ? "black" : "#fff",
                        }}
                        onClick={() => handleEliminar(archivo.ruta_archivo)}
                      >
                        Eliminar
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Asignar grupos */}
          {archivoSeleccionado && (
            <Paper
              elevation={3}
              sx={{
                p: 3,
                mb: 3,
                background: isDark
                  ? "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"
                  : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                color: isDark ? "white" : "#232526",
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Asignar Grupos a: {archivoSeleccionado.nombre_archivo}
              </Typography>
              <Box component="form" onSubmit={handleAsignar} sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                  {grupos.map((grupo) => (
                    <FormControlLabel
                      key={grupo.nombreGrupo}
                      control={
                        <Checkbox
                          checked={
                            gruposSeleccionados.includes(grupo.nombreGrupo) &&
                            !gruposPorAsignar.includes(grupo.nombreGrupo)
                          }
                          disabled={gruposPorAsignar.includes(
                            grupo.nombreGrupo
                          )}
                          onChange={() =>
                            toggleGrupoSeleccionado(grupo.nombreGrupo)
                          }
                          sx={{ color: "#ffd700" }}
                        />
                      }
                      label={grupo.nombreGrupo}
                      sx={{
                        color: gruposPorAsignar.includes(grupo.nombreGrupo)
                          ? "grey.400"
                          : isDark
                          ? "white"
                          : "#232526",
                      }}
                    />
                  ))}
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  sx={{ fontWeight: 600, mr: 2 }}
                  disabled={grupos.every((grupo) =>
                    gruposPorAsignar.includes(grupo.nombreGrupo)
                  )}
                >
                  Asignar
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  sx={{ fontWeight: 600 }}
                  onClick={() => setArchivoSeleccionado(null)}
                >
                  Cancelar
                </Button>
              </Box>
            </Paper>
          )}

          {/* Eliminar referencia para grupos */}
          {archivoSeleccionadoEliminar && (
            <Paper
              elevation={3}
              sx={{
                p: 3,
                mb: 3,
                background: isDark
                  ? "linear-gradient(135deg, #283e51 0%, #485563 100%)"
                  : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                color: isDark ? "white" : "#1e3c72",
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Eliminar referencia de:{" "}
                {archivoSeleccionadoEliminar.nombre_archivo}
              </Typography>
              <Box
                component="form"
                onSubmit={handleEliminarPara}
                sx={{ mb: 2 }}
              >
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                  {gruposPorAsignar
                    .filter((grupo) => grupo !== null)
                    .map((grupo) => (
                      <FormControlLabel
                        key={grupo}
                        control={
                          <Checkbox
                            checked={gruposSeleccionadosEliminar.includes(
                              grupo
                            )}
                            onChange={() =>
                              toggleGrupoSeleccionadoEliminar(grupo)
                            }
                            sx={{ color: "#ffd700" }}
                          />
                        }
                        label={grupo}
                        sx={{ color: isDark ? "white" : "#232526" }}
                      />
                    ))}
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  color="error"
                  sx={{ fontWeight: 600, mr: 2 }}
                >
                  Eliminar
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  sx={{ fontWeight: 600 }}
                  onClick={() => setArchivoSeleccionadoEliminar(null)}
                >
                  Cancelar
                </Button>
              </Box>
            </Paper>
          )}

          {/* Dialog de vista previa */}
          <Dialog
            open={!!archivoVistaPrevia}
            onClose={() => setArchivoVistaPrevia(null)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ fontWeight: 700 }}>
              Vista previa: {archivoVistaPrevia?.nombre_archivo}
            </DialogTitle>
            <DialogContent
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 300, // Opcional: asegura altura mínima para centrar verticalmente
              }}
            >
              {archivoVistaPrevia &&
                (() => {
                  const url = `https://backend-tt-209366905887.us-central1.run.app/${archivoVistaPrevia.ruta_archivo.replace(
                    /\\/g,
                    "/"
                  )}`;
                  const ext = archivoVistaPrevia.nombre_archivo
                    .split(".")
                    .pop()
                    .toLowerCase();

                  // Imágenes
                  if (
                    ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)
                  ) {
                    return (
                      <img
                        src={url}
                        alt="Vista previa"
                        style={{ maxWidth: "100%" }}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    );
                  }
                  // PDF
                  if (ext === "pdf") {
                    return (
                      <iframe
                        src={url}
                        title="Vista previa PDF"
                        width="100%"
                        height="600px"
                        style={{ border: "none" }}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    );
                  }
                  // Audio
                  if (["mp3", "wav", "ogg", "aac", "flac"].includes(ext)) {
                    return (
                      <audio controls style={{ width: "100%" }}>
                        <source src={url} type={`audio/${ext}`} />
                        Tu navegador no soporta la reproducción de audio.
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            href={url}
                            download={archivoVistaPrevia.nombre_archivo}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Descargar archivo
                          </Button>
                        </Box>
                      </audio>
                    );
                  }
                  // Video
                  if (["mp4", "webm", "ogg", "mov"].includes(ext)) {
                    return (
                      <video controls style={{ width: "100%", maxHeight: 500 }}>
                        <source
                          src={url}
                          type={`video/${ext === "mov" ? "quicktime" : ext}`}
                        />
                        Tu navegador no soporta la reproducción de video.
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            href={url}
                            download={archivoVistaPrevia.nombre_archivo}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Descargar archivo
                          </Button>
                        </Box>
                      </video>
                    );
                  }
                  // Office y otros archivos: solo descarga
                  return (
                    <Box sx={{ textAlign: "center" }}>
                      <Typography sx={{ mb: 2 }}>
                        No se puede mostrar la vista previa para este tipo de
                        archivo.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        href={url}
                        download={archivoVistaPrevia.nombre_archivo}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Descargar archivo
                      </Button>
                    </Box>
                  );
                })()}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setArchivoVistaPrevia(null)}
                color="primary"
              >
                Cerrar
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3500}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
              variant="filled"
            >
              {snackbar.message}
            </Alert>
          </Snackbar>

          {/* Confirmar eliminación */}
          <Dialog
            open={openConfirm}
            onClose={() => setOpenConfirm(false)}
            aria-labelledby="confirm-dialog-title"
          >
            <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 700 }}>
              Confirmar eliminación
            </DialogTitle>
            <DialogContent>
              <Typography>
                ¿Está seguro de que desea eliminar este archivo?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setOpenConfirm(false)}
                color="inherit"
                variant="outlined"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmarEliminar}
                color="error"
                variant="contained"
              >
                Eliminar
              </Button>
            </DialogActions>
          </Dialog>
        </Box>

        {/* Columna derecha: Contenido multimedia */}
        <Box sx={{ flex: 1, minWidth: { xs: 0, md: 320 } }}>
          {/* Agregar Link Multimedia */}
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 3,
              background: isDark
                ? "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"
                : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              color: isDark ? "white" : "#1e3c72",
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Agregar Link Multimedia
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmitLink}
              sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}
            >
              <TextField
                label="URL"
                name="url"
                value={nuevoLink.url}
                onChange={handleLinkChange}
                required
                sx={{
                  flex: 2,
                  minWidth: 200,
                  background: isDark ? "#232526" : "white",
                  borderRadius: 2,
                }}
              />
              <TextField
                select
                label="Tipo"
                name="tipo"
                value={nuevoLink.tipo}
                onChange={handleLinkChange}
                required
                sx={{
                  flex: 1,
                  minWidth: 120,
                  background: isDark ? "#232526" : "white",
                  borderRadius: 2,
                }}
              >
                {tiposMultimedia.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Sección"
                name="tab_index"
                value={nuevoLink.tab_index}
                onChange={handleLinkChange}
                required
                sx={{
                  flex: 1,
                  minWidth: 120,
                  background: isDark ? "#232526" : "white",
                  borderRadius: 2,
                }}
              >
                <MenuItem value={0}>Ecuaciones Simultaneas</MenuItem>
                <MenuItem value={1}>Igualación</MenuItem>
                <MenuItem value={2}>Sustitución</MenuItem>
                <MenuItem value={3}>Reducción (Eliminación)</MenuItem>
                <MenuItem value={4}>Gráfico</MenuItem>
              </TextField>
              <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                >
                  Guardar Link
                </Button>
              </Box>
            </Box>
          </Paper>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 3,
              background: isDark
                ? "linear-gradient(135deg, #283e51 0%, #485563 100%)"
                : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              color: isDark ? "white" : "#1e3c72",
              borderRadius: 3,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: isDark ? "white" : "#1e3c72",
              }}
            >
              Contenido
            </Typography>
            <Tabs
              value={tabIndex}
              onChange={(e, v) => {
                setTabIndex(v);
                setTipoTabIndex(0);
              }}
              textColor={isDarkMode ? "#fff" : "primary"}
              indicatorColor="primary"
              variant="fullWidth"
              sx={{ mb: 2 }}
            >
              <Tab label="Ecuaciones Simultaneas" />
              <Tab label="Igualación" />
              <Tab label="Sustitución" />
              <Tab label="Reducción (Eliminación)" />
              <Tab label="Gráfico" />
            </Tabs>
            <Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Links multimedia en esta sección:
                </Typography>
                {links.filter((link) => link.tab_index === tabIndex).length ===
                  0 && (
                  <Typography color="text.secondary">
                    No hay links en esta sección.
                  </Typography>
                )}

                {/* Tabs secundarios por tipo de contenido */}
                <Tabs
                  value={tipoTabIndex}
                  onChange={(e, v) => setTipoTabIndex(v)}
                  textColor="primary"
                  indicatorColor="primary"
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    mb: 2,
                    background: isDark ? "#232526" : "#e3eafc",
                    borderRadius: 2,
                  }}
                >
                  {tiposMultimedia.map((tipo, idx) => (
                    <Tab key={tipo} label={tipo} />
                  ))}
                </Tabs>

                {/* Mostrar solo los links del tipo seleccionado */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center", // Centra los items horizontalmente
                  }}
                >
                  {(() => {
                    const tipo = tiposMultimedia[tipoTabIndex];
                    const itemsPorTipo = [
                      ...links
                        .filter(
                          (link) =>
                            link.tab_index === tabIndex && link.tipo === tipo
                        )
                        .map((link) => ({
                          id: `link-${link.id}`,
                          tipo: link.tipo,
                          url: link.url,
                          nombre: null,
                          esArchivo: false,
                          eliminar: () => handleEliminarLink(link.id),
                        })),
                      ...archivos
                        .filter(
                          (archivo) =>
                            Number(archivo.tab_index) === tabIndex &&
                            archivo.tipo === tipo
                        )
                        .map((archivo) => ({
                          id: `archivo-${archivo.id}`,
                          tipo: archivo.tipo,
                          url: `https://backend-tt-209366905887.us-central1.run.app/${archivo.ruta_archivo.replace(
                            /\\/g,
                            "/"
                          )}`,
                          nombre: archivo.nombre_archivo,
                          esArchivo: true,
                          eliminar: () => handleEliminar(archivo.ruta_archivo),
                        })),
                    ];

                    if (itemsPorTipo.length === 0)
                      return (
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                          No hay elementos de tipo {tipo} en esta sección.
                        </Typography>
                      );

                    return (
                      <>
                        {itemsPorTipo.map((item) => (
                          <Box
                            key={item.id}
                            sx={{
                              mb: 2,
                              p: 1,
                              background: isDark ? "#232526" : "#f0f4fa",
                              borderRadius: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              maxWidth: 340,
                            }}
                          >
                            <Box
                              sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setDialogContent(item);
                                setDialogOpen(true);
                              }}
                            >
                              {renderMedia(item)}
                            </Box>
                            <Button
                              color="error"
                              onClick={item.eliminar}
                              sx={{
                                minWidth: 0,
                                mt: 1,
                                alignSelf: "center",
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <DeleteIcon />
                            </Button>
                          </Box>
                        ))}
                        {/* Dialogo para vista ampliada */}
                        <Dialog
                          open={dialogOpen}
                          onClose={() => setDialogOpen(false)}
                          maxWidth="md"
                          fullWidth
                        >
                          <DialogTitle sx={{ fontWeight: 700 }}>
                            Vista ampliada
                          </DialogTitle>
                          <DialogContent
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            {dialogContent && renderMedia(dialogContent, true)}
                          </DialogContent>
                          <DialogActions>
                            <Button
                              onClick={() => setDialogOpen(false)}
                              color="primary"
                            >
                              Cerrar
                            </Button>
                          </DialogActions>
                        </Dialog>
                      </>
                    );
                  })()}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
      {/* Dialog tipo alerta para mensajes informativos */}
      <Dialog
        open={alertDialog.open}
        onClose={alertDialog.onClose}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">Aviso</DialogTitle>
        <DialogContent>
          <Typography>{alertDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={alertDialog.onClose} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MultimediosView;
