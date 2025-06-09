import React, { useState, useEffect, useRef } from "react";
import {
  IconButton,
  TextField,
  Button,
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MinimizeIcon from "@mui/icons-material/Minimize";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import { io } from "socket.io-client";

function ChatWindow({ groupName, userData, token, onClose, chatIndex = 0 }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const theme = useTheme();

  // Scroll automático al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Conexión socket y carga de historial
  useEffect(() => {
    const newSocket = io("https://backend-tt-209366905887.us-central1.run.app", {
      query: { grupoAL: groupName },
      auth: { token },
    });
    setSocket(newSocket);

    newSocket.on("mensaje", (mensaje) => {
      setChatHistory((prevMessages) => [...prevMessages, mensaje]);
    });

    const fetchChatHistory = async () => {
      try {
        const response = await fetch(
          `https://backend-tt-209366905887.us-central1.run.app/chat/mensajes/${groupName}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (data.mensajes) setChatHistory(data.mensajes);
      } catch (error) {
        console.error("Error al cargar el historial de mensajes:", error);
      }
    };

    fetchChatHistory();
    return () => newSocket.disconnect();
  }, [groupName, token]);

  useEffect(() => {
    scrollToBottom();
    //console.log("Chat history updated:", chatHistory);
  }, [chatHistory]);

  // Enviar mensaje
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (socket && message.trim()) {
      // Construir nombre completo (nombre_s apellidoP apellidoM)
      const nombreCompleto = `${userData.nombre_s} ${userData.apellidoP} ${userData.apellidoM}`;
      socket.emit("enviarMensaje", {
        grupoAL: groupName,
        mensaje: message,
        nombre: nombreCompleto,
        correo: userData.correo,
      });

      setMessage("");
    }
  };

  // Estilos responsivos y modo dark
  const isDark = theme.palette.mode === "dark";
  const chatBg = isDark
    ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
    : "linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)";
  const headerBg = isDark ? "#7c3aed" : "#283e51";
  const headerColor = isDark ? "#ffd700" : "#fff";
  const borderColor = isDark ? "#ffd700" : "#7c3aed";

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        right: { xs: 0, sm: chatIndex * 340 },
        width: {
          xs: isMinimized ? 220 : 320,
          sm: isMinimized ? 240 : 340,
          md: isMinimized ? 260 : 360,
          lg: isMinimized ? 280 : 380,
        },
        maxWidth: "96vw", // nunca más del 96% del viewport
        height: isMinimized
          ? 54
          : {
              xs: 340,
              sm: 420,
              md: 440,
              lg: 460,
            },
        maxHeight: "80vh", // nunca más del 80% del viewport
        background: chatBg,
        border: `2px solid ${borderColor}`,
        borderRadius: "18px 18px 0 0",
        boxShadow: "0 8px 32px 0 rgba(30,60,114,0.18)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1400,
        overflow: "hidden",
        transition: "height 0.2s, width 0.2s",
        m: 1,
        pointerEvents: "auto",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: headerBg,
          color: headerColor,
          px: 2,
          py: 1,
          borderRadius: "16px 16px 0 0",
          minHeight: 44,
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}
        >
          <ChatBubbleIcon sx={{ fontSize: 22, color: headerColor }} />
          <Typography
            variant="subtitle1"
            noWrap
            sx={{
              fontWeight: 600,
              fontSize: 16,
              maxWidth: isMinimized ? 90 : 180,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {groupName}
          </Typography>
        </Box>
        <Box>
          <IconButton
            size="small"
            sx={{ color: headerColor }}
            onClick={() => setIsMinimized((v) => !v)}
          >
            <MinimizeIcon />
          </IconButton>
          <IconButton
            size="small"
            sx={{ color: headerColor }}
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      {/* Mensajes */}
      {!isMinimized && (
        <Box
          sx={{
            flex: 1,
            px: 2,
            py: 1,
            overflowY: "auto",
            background: "transparent",
            fontSize: 15,
          }}
        >
          {chatHistory.length === 0 && (
            <Typography
              variant="body2"
              sx={{
                color: isDark ? "#bbb" : "#666",
                textAlign: "center",
                mt: 2,
              }}
            >
              No hay mensajes aún.
            </Typography>
          )}
          {chatHistory.map((msg, index) => {
            // Determinar si el mensaje es del usuario actual
            const esMio =
              msg.usuario?.includes && msg.usuario.includes(userData.correo);

            return (
              <Box
                key={index}
                sx={{
                  mb: 1.5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: esMio ? "flex-end" : "flex-start",
                }}
              >
                <Box
                  sx={{
                    bgcolor: esMio
                      ? isDark
                        ? "#7c3aed"
                        : "#a5b4fc"
                      : isDark
                      ? "#232526"
                      : "#fff",
                    color: esMio
                      ? isDark
                        ? "#ffd700"
                        : "#232526"
                      : isDark
                      ? "#fff"
                      : "#232526",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    boxShadow: "0 1px 4px rgba(30,60,114,0.08)",
                    maxWidth: "85%",
                    wordBreak: "break-word",
                    fontSize: 15,
                  }}
                >
                  {/* Solo mostrar remitente si NO es mío */}
                  {!esMio &&
                    (() => {
                      // Extraer nombre y correo de msg.usuario
                      let nombre = msg.usuario || msg.alumno || "";
                      let correo = msg.correo || "";
                      const match = nombre.match(/^(.+?)\s*\(([^)]+)\)$/);
                      if (match) {
                        nombre = match[1];
                        correo = match[2];
                      }
                      return (
                        <>
                          <span style={{ fontWeight: 700 }}>{nombre}</span>
                          {" "}
                          <span
                            style={{
                              fontStyle: "italic",
                              fontSize: "12px",
                              color: isDark ? "#bdbdbd" : "#666",
                              fontWeight: 400,
                              display: "inline-block",
                            }}
                          >
                            {`(${correo})`}
                          </span>
                          <br />
                        </>
                      );
                    })()}
                  {msg.mensaje}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: isDark ? "#bbb" : "#888",
                    mt: 0.2,
                    fontSize: 11,
                    ml: 0.5,
                  }}
                >
                  {msg.fecha ? new Date(msg.fecha).toLocaleString() : ""}
                </Typography>
              </Box>
            );
          })}
          <div ref={messagesEndRef} />
        </Box>
      )}
      {/* Input */}
      {!isMinimized && (
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            px: 2,
            py: 1,
            borderTop: `1px solid ${isDark ? "#444" : "#ddd"}`,
            bgcolor: isDark ? "#232526" : "#f4f4f4",
            display: "flex",
            gap: 1,
          }}
        >
          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            size="small"
            fullWidth
            variant="outlined"
            sx={{
              bgcolor: isDark ? "#35374a" : "#fff",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                fontSize: 15,
                color: isDark ? "#ffd700" : "#232526",
              },
            }}
            inputProps={{ maxLength: 350 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              minWidth: 0,
              px: 2,
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: "none",
              bgcolor: isDark ? "#7c3aed" : "#283e51",
              "&:hover": {
                bgcolor: isDark ? "#a78bfa" : "#4f46e5",
              },
            }}
            disabled={!message.trim()}
          >
            Enviar
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default ChatWindow;
