import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  useTheme,
  useMediaQuery,
  Stack,
  Dialog,
  DialogContent,
  IconButton,
  Divider,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

const MultimediosAlumno = ({
  archivos,
  handleDownload,
  links,
  tabIndex,
  setTabIndex,
  tipoTabIndex,
  setTipoTabIndex,
  tiposMultimedia,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Estado para vista previa
  const [preview, setPreview] = useState({ open: false, item: null });

  // Unifica archivos y links en la sección multimedia
  const multimediaItems = [
    ...links.map((link) => ({
      ...link,
      esArchivo: false,
      tab_index: typeof link.tab_index === "number" ? link.tab_index : 0,
    })),
    ...archivos.map((archivo) => {
      // Determina el tipo por extensión si no viene de la BD
      let tipo = archivo.tipo;
      if (!tipo || tipo.trim() === "") {
        const ext = archivo.nombreArchivo?.split(".").pop()?.toLowerCase();
        if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext))
          tipo = "Imagen";
        else if (["mp4", "webm", "ogg"].includes(ext)) tipo = "Video";
        else if (["pdf"].includes(ext)) tipo = "PDF";
        else tipo = "Archivo";
      }
      // Asigna tab_index correctamente
      let tab_index = 0;
      if (
        archivo.tab_index !== undefined &&
        archivo.tab_index !== null &&
        archivo.tab_index !== ""
      ) {
        const parsed = Number(archivo.tab_index);
        tab_index = !isNaN(parsed) ? parsed : 0;
      }

      return {
        id: `archivo-${archivo.id}`,
        tab_index,
        tipo,
        url: archivo.rutaArchivo,
        nombreArchivo: archivo.nombreArchivo,
        esArchivo: true,
      };
    }),
  ];

  // Saber si un archivo puede tener miniatura/vista previa
  const canPreview = (tipo) =>
    tipo === "Imagen" || tipo === "PDF" || tipo === "Video";

  // Helpers para YouTube
  const isYouTubeLink = (item) =>
    item.tipo === "Video" &&
    (item.url.includes("youtube.com") || item.url.includes("youtu.be"));

  const getYouTubeId = (url) => {
    if (url.includes("youtube.com")) {
      return url.split("v=")[1]?.split("&")[0];
    }
    if (url.includes("youtu.be")) {
      return url.split("/").pop();
    }
    return "";
  };

  // Miniatura SOLO para archivos subidos
  const renderThumbnail = (item) => {
    if (item.tipo === "Imagen") {
      return (
        <img
          src={item.url}
          alt="Miniatura"
          style={{
            width: 120,
            height: 90,
            objectFit: "cover",
            borderRadius: 10,
            cursor: "pointer",
            boxShadow: theme.shadows[2],
            border: `2px solid ${theme.palette.divider}`,
            background: theme.palette.background.paper,
          }}
          onClick={() => setPreview({ open: true, item })}
        />
      );
    }
    if (item.tipo === "PDF") {
      return (
        <Box
          sx={{
            width: 90,
            height: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: theme.palette.mode === "dark" ? "#333" : "#e0e0e0",
            borderRadius: 2,
            cursor: "pointer",
            boxShadow: theme.shadows[2],
            border: `2px solid ${theme.palette.divider}`,
          }}
          onClick={() => setPreview({ open: true, item })}
        >
          <InsertDriveFileIcon color="error" sx={{ fontSize: 48 }} />
        </Box>
      );
    }
    if (item.tipo === "Video") {
      return (
        <Box
          sx={{
            width: 120,
            height: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: theme.palette.mode === "dark" ? "#333" : "#e0e0e0",
            borderRadius: 2,
            cursor: "pointer",
            boxShadow: theme.shadows[2],
            border: `2px solid ${theme.palette.divider}`,
          }}
          onClick={() => setPreview({ open: true, item })}
        >
          <VisibilityIcon color="primary" sx={{ fontSize: 48 }} />
        </Box>
      );
    }
    // Para archivos sin miniatura
    return (
      <Box
        sx={{
          width: 90,
          height: 90,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: theme.palette.mode === "dark" ? "#333" : "#e0e0e0",
          borderRadius: 2,
          boxShadow: theme.shadows[2],
          border: `2px solid ${theme.palette.divider}`,
        }}
      >
        <InsertDriveFileIcon color="action" sx={{ fontSize: 48 }} />
      </Box>
    );
  };

  // Vista previa en Dialog (archivos y links de imagen/youtube)
  const renderPreviewDialog = () => {
    if (!preview.open || !preview.item) return null;
    const { item } = preview;
    return (
      <Dialog
        open={preview.open}
        onClose={() => setPreview({ open: false, item: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogContent
          sx={{
            position: "relative",
            p: 0,
            bgcolor: theme.palette.background.default,
          }}
        >
          <IconButton
            onClick={() => setPreview({ open: false, item: null })}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 2,
              color: "#fff",
              bgcolor: "rgba(0,0,0,0.4)",
            }}
          >
            <CloseIcon />
          </IconButton>
          {item.tipo === "Imagen" && (
            <Box sx={{ width: "100%", textAlign: "center", p: 2 }}>
              <img
                src={item.url}
                alt="Vista previa"
                style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 8 }}
              />
            </Box>
          )}
          {item.tipo === "PDF" && (
            <Box sx={{ width: "100%", height: "80vh" }}>
              <iframe
                src={item.url}
                title="Vista previa PDF"
                width="100%"
                height="100%"
                style={{ border: "none" }}
              />
            </Box>
          )}
          {item.tipo === "Video" && item.esArchivo && (
            <Box sx={{ width: "100%", textAlign: "center", p: 2 }}>
              <video
                src={item.url}
                controls
                style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 8 }}
              />
            </Box>
          )}
          {isYouTubeLink(item) && (
            <Box sx={{ width: "100%", textAlign: "center", p: 2 }}>
              <iframe
                width="100%"
                height="480"
                src={`https://www.youtube.com/embed/${getYouTubeId(item.url)}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ borderRadius: 12, maxWidth: "100%" }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", mt: 2 }}>
      {renderPreviewDialog()}
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
              : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          color: theme.palette.mode === "dark" ? "grey.100" : "#1e3c72",
          borderRadius: 4,
        }}
      >
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{
            fontWeight: 700,
            mb: 2,
            color: theme.palette.mode === "dark" ? "grey.100" : "#1e3c72",
            textAlign: "center",
            letterSpacing: 1,
          }}
        >
          Contenido Multimedia
        </Typography>
        <Tabs
          value={tabIndex}
          onChange={(e, v) => {
            setTabIndex(v);
            setTipoTabIndex(0); // Reinicia el tab de tipo al cambiar sección
          }}
          textColor="inherit"
          indicatorColor="primary"
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{
            mb: 2,
            "& .MuiTab-root": {
              fontWeight: 600,
              color: theme.palette.mode === "dark" ? "grey.200" : "#1e3c72",
            },
            "& .Mui-selected": {
              color: theme.palette.mode === "dark" ? "#fff" : "#1976d2",
            },
          }}
        >
          <Tab label="Ecuaciones Simultáneas" />
          <Tab label="Igualación" />
          <Tab label="Sustitución" />
          <Tab label="Reducción (Eliminación)" />
          <Tab label="Gráfico" />
        </Tabs>
        <Divider
          sx={{
            mb: 2,
            borderColor: theme.palette.mode === "dark" ? "#444" : "#bdbdbd",
          }}
        />
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: theme.palette.mode === "dark" ? "grey.200" : "#1e3c72",
          }}
        >
          Links y archivos multimedia en esta sección:
        </Typography>
        {multimediaItems.filter((item) => item.tab_index === tabIndex)
          .length === 0 && (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No hay elementos multimedia en esta sección.
          </Typography>
        )}

        {/* Tabs secundarios por tipo de contenido */}
        <Tabs
          value={tipoTabIndex}
          onChange={(e, v) => setTipoTabIndex(v)}
          textColor="inherit"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 2,
            background: theme.palette.mode === "dark" ? "#232526" : "#e3eafc",
            borderRadius: 2,
            "& .MuiTab-root": {
              fontWeight: 500,
              color: theme.palette.mode === "dark" ? "grey.200" : "#1e3c72",
            },
            "& .Mui-selected": {
              color: theme.palette.mode === "dark" ? "#fff" : "#1976d2",
            },
          }}
        >
          {tiposMultimedia.map((tipo) => (
            <Tab key={tipo} label={tipo} />
          ))}
        </Tabs>

        {/* Mostrar solo los items del tipo seleccionado */}
        <Box>
          {(() => {
            const tipo = tiposMultimedia[tipoTabIndex];
            const itemsPorTipo = multimediaItems.filter(
              (item) => item.tab_index === tabIndex && item.tipo === tipo
            );

            if (itemsPorTipo.length === 0)
              return (
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  No hay elementos de tipo {tipo} en esta sección.
                </Typography>
              );

            return (
              <Stack
                direction="row"
                spacing={3}
                flexWrap="wrap"
                useFlexGap
                sx={{
                  mt: 1,
                  justifyContent: isMobile ? "flex-start" : "center",
                }}
              >
                {itemsPorTipo.map((item) => (
                  <Paper
                    key={item.id}
                    elevation={3}
                    sx={{
                      p: 2,
                      mb: 2,
                      minWidth: 210,
                      maxWidth: 250,
                      background:
                        theme.palette.mode === "dark" ? "#232526" : "#f0f4fa",
                      borderRadius: 4,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      boxShadow:
                        theme.palette.mode === "dark"
                          ? "0 2px 12px rgba(30,60,114,0.25)"
                          : "0 2px 12px rgba(30,60,114,0.10)",
                      transition: "box-shadow 0.2s",
                      "&:hover": {
                        boxShadow:
                          theme.palette.mode === "dark"
                            ? "0 4px 18px rgba(30,60,114,0.35)"
                            : "0 4px 18px rgba(30,60,114,0.18)",
                      },
                    }}
                  >
                    {/* Miniatura SOLO para archivos subidos */}
                    {item.esArchivo && canPreview(item.tipo) && (
                      <Box sx={{ mb: 1 }}>{renderThumbnail(item)}</Box>
                    )}

                    {/* Links: mostrar de manera normal según tipo, sin miniatura ni botones */}
                    {!item.esArchivo && (
                      <>
                        {isYouTubeLink(item) ? (
                          <Box
                            sx={{ my: 1, width: "100%", position: "relative" }}
                          >
                            <Box
                              sx={{
                                position: "relative",
                                width: "100%",
                                maxWidth: 220,
                                height: 124,
                                mx: "auto",
                                cursor: "pointer",
                                borderRadius: 2,
                                overflow: "hidden",
                                boxShadow: theme.shadows[2],
                                background: "#000",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                "&:hover": { boxShadow: theme.shadows[6] },
                              }}
                              onClick={() => setPreview({ open: true, item })}
                            >
                              <img
                                src={`https://img.youtube.com/vi/${getYouTubeId(
                                  item.url
                                )}/hqdefault.jpg`}
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
                                >
                                  <svg
                                    width="36"
                                    height="36"
                                    viewBox="0 0 48 48"
                                  >
                                    <circle
                                      cx="24"
                                      cy="24"
                                      r="24"
                                      fill="rgba(0,0,0,0.5)"
                                    />
                                    <polygon
                                      points="20,16 34,24 20,32"
                                      fill="#fff"
                                      style={{
                                        filter: "drop-shadow(0 0 2px #000)",
                                      }}
                                    />
                                  </svg>
                                </Button>
                              </Box>
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                mt: 1,
                                color:
                                  theme.palette.mode === "dark"
                                    ? "grey.300"
                                    : "grey.700",
                                wordBreak: "break-all",
                                textAlign: "center",
                              }}
                            >
                              Click para ampliar
                            </Typography>
                          </Box>
                        ) : item.tipo === "Imagen" ? (
                          <img
                            src={item.url}
                            alt="Imagen"
                            style={{
                              maxWidth: "100%",
                              maxHeight: 180,
                              borderRadius: 10,
                              marginBottom: 8,
                              cursor: "pointer",
                              boxShadow: theme.shadows[2],
                              border: `2px solid ${theme.palette.divider}`,
                            }}
                            onClick={() => setPreview({ open: true, item })}
                          />
                        ) : item.tipo === "PDF" ? (
                          <Button
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outlined"
                            color="secondary"
                            size="small"
                            sx={{ mt: 1, textTransform: "none" }}
                          >
                            Ver PDF
                          </Button>
                        ) : (
                          <Button
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outlined"
                            color="primary"
                            size="small"
                            sx={{ mt: 1, textTransform: "none" }}
                          >
                            Abrir enlace
                          </Button>
                        )}
                      </>
                    )}

                    {/* Botones SOLO para archivos subidos */}
                    {item.esArchivo && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {canPreview(item.tipo) && (
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            sx={{ textTransform: "none" }}
                            onClick={() => setPreview({ open: true, item })}
                          >
                            Vista previa
                          </Button>
                        )}
                        <Button
                          onClick={() =>
                            handleDownload(item.url, item.nombreArchivo)
                          }
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<DownloadIcon />}
                          sx={{ textTransform: "none" }}
                        >
                          Descargar
                        </Button>
                      </Stack>
                    )}

                    {/* Nombre del archivo si es archivo */}
                    {item.esArchivo && (
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 1,
                          color:
                            theme.palette.mode === "dark"
                              ? "grey.300"
                              : "grey.700",
                          wordBreak: "break-all",
                          textAlign: "center",
                        }}
                      >
                        {item.nombreArchivo}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Stack>
            );
          })()}
        </Box>
      </Paper>
    </Box>
  );
};

export default MultimediosAlumno;
