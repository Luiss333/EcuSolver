import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  Paper,
  Avatar,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SchoolIcon from "@mui/icons-material/School";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "https://backend-tt-209366905887.us-central1.run.app";

const LoginDialog = ({
  open,
  onClose,
  email,
  setEmail,
  password,
  setPassword,
  role,
  setRole,
  onLogin,
}) => {
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleForgot = async () => {
    setForgotLoading(true);
    setForgotMsg("");
    try {
      await axios.post(`${API_URL}/recuperar-contrasena`, {
        correo: forgotEmail,
      });
      setForgotMsg("La contraseña ha sido enviada a tu correo.");
    } catch (err) {
      setForgotMsg("No se pudo enviar la contraseña. Verifica el correo.");
    }
    setForgotLoading(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", sm: 400, md: 420 },
            mx: "auto",
            p: { xs: 0, sm: 2 },
          }}
        >
          <Paper
            elevation={6}
            sx={{
              borderRadius: 4,
              p: { xs: 1.5, sm: 4 },
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(90deg, #232526 0%, #414345 100%)"
                  : "linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)",
              width: "100%",
            }}
          >
            <DialogTitle
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "transparent",
                color: theme.palette.mode === "dark" ? "#fff" : "#232526",
                fontWeight: 700,
                fontSize: { xs: 20, sm: 26 },
                pb: 0,
              }}
            >
              <SchoolIcon color="secondary" sx={{ mr: 1, fontSize: 32 }} />
              Iniciar Sesión
            </DialogTitle>
            <Divider sx={{ my: 2 }} />
            <DialogContent sx={{ p: 0 }}>
              <Box
                component="form"
                autoComplete="off"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  mt: 1,
                }}
              >
                <TextField
                  label="Correo"
                  type="email"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 1 }}>
                        <Avatar
                          sx={{ bgcolor: "#7c3aed", width: 28, height: 28 }}
                        >
                          <EmailIcon fontSize="small" />
                        </Avatar>
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="off"
                />
                <TextField
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 1 }}>
                        <Avatar
                          sx={{ bgcolor: "#7c3aed", width: 28, height: 28 }}
                        >
                          <LockIcon fontSize="small" />
                        </Avatar>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                          onClick={() => setShowPassword((show) => !show)}
                          edge="end"
                          tabIndex={-1}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="new-password"
                />
              </Box>
            </DialogContent>
            <DialogActions
              sx={{
                justifyContent: "space-between",
                px: 0,
                flexDirection: "column",
                alignItems: "stretch",
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button onClick={onClose} variant="outlined" color="secondary">
                  Cancelar
                </Button>
                <Button
                  onClick={onLogin}
                  variant="contained"
                  color="primary"
                  disabled={!email || !password}
                >
                  Iniciar Sesión
                </Button>
              </Box>
              <Button
                variant="text"
                color="primary"
                onClick={() => setForgotOpen(true)}
                sx={{ mt: 1, textTransform: "none" }}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </DialogActions>
          </Paper>
        </Box>
      </Dialog>

      {/* Dialogo de recuperación de contraseña */}
      <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)}>
        <DialogTitle>Recuperar contraseña</DialogTitle>
        <DialogContent>
          <TextField
            label="Correo electrónico"
            type="email"
            fullWidth
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
            autoComplete="off"
          />
          {forgotMsg && (
            <Typography
              color={forgotMsg.includes("enviada") ? "green" : "red"}
              variant="body2"
            >
              {forgotMsg}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleForgot}
            variant="contained"
            color="primary"
            disabled={!forgotEmail || forgotLoading}
          >
            Enviar contraseña
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LoginDialog;
