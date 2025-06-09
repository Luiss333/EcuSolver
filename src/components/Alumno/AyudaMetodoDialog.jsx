import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const tiposMultimedia = ["Video", "Audio", "Imagen", "PDF", "Otro"];

const AyudaMetodoDialog = ({
  open,
  onClose,
  links,
  tabIndex,
  metodoNombre,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>
      Ayuda para el método: {metodoNombre}
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{ position: "absolute", right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent dividers>
      {tiposMultimedia.map((tipo) => {
        const items = links.filter(
          (l) => l.tab_index === tabIndex && l.tipo === tipo
        );
        if (items.length === 0) return null;
        return (
          <Box key={tipo} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {tipo}
            </Typography>
            {items.map((link) => (
              <Box key={link.id} sx={{ mb: 1 }}>
                {tipo === "Video" &&
                (link.url.includes("youtube.com") ||
                  link.url.includes("youtu.be")) ? (
                  <Box sx={{ my: 1 }}>
                    <iframe
                      width="100%"
                      height="315"
                      src={`https://www.youtube.com/embed/${
                        link.url.includes("youtube.com")
                          ? link.url.split("v=")[1]?.split("&")[0]
                          : link.url.split("/").pop()
                      }`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ borderRadius: 8, maxWidth: "100%" }}
                    />
                  </Box>
                ) : tipo === "Imagen" ? (
                  <img
                    src={link.url}
                    alt="Imagen"
                    style={{ maxWidth: 300, borderRadius: 8 }}
                  />
                ) : tipo === "PDF" ? (
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.url}
                  </a>
                ) : (
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.url}
                  </a>
                )}
              </Box>
            ))}
          </Box>
        );
      })}
    </DialogContent>
  </Dialog>
);

export default AyudaMetodoDialog;