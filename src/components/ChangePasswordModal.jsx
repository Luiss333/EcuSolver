// Nuevo componente ChangePasswordModal.jsx
import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from "@mui/material";
import axios from "axios";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

const API_URL = process.env.REACT_APP_API_URL || "https://backend-tt-209366905887.us-central1.run.app";

const validarContraseña = (contraseña) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  return regex.test(contraseña);
};

const ChangePasswordModal = ({ open, onClose, correo, role, onSuccess }) => {
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordValid = validarContraseña(newPassword);

  const handleChangePassword = async () => {
    setMsg("");
    if (!newPassword || !repeatPassword) {
      setMsg("Completa ambos campos.");
      return;
    }
    if (!passwordValid) {
      setMsg("La contraseña no cumple con los requisitos de seguridad.");
      return;
    }
    if (newPassword !== repeatPassword) {
      setMsg("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/cambiar-contrasena`, {
        correo,
        nuevaContrasena: newPassword,
        role,
      });
      setMsg("Contraseña cambiada correctamente.");
      if (onSuccess) onSuccess();
    } catch (err) {
      setMsg("Error al cambiar la contraseña.");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Cambiar contraseña</DialogTitle>
      <DialogContent>
        <TextField
          label="Nueva contraseña"
          type={showPassword ? "text" : "password"}
          fullWidth
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          sx={{ mb: 2 }}
          required
          error={!!newPassword && !passwordValid}
          helperText={
            !!newPassword && !passwordValid
              ? "Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial."
              : ""
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPassword(show => !show)}
                  edge="end"
                  tabIndex={-1}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Repetir nueva contraseña"
          type={showPassword ? "text" : "password"}
          fullWidth
          value={repeatPassword}
          onChange={e => setRepeatPassword(e.target.value)}
          sx={{ mb: 2 }}
          required
          error={!!repeatPassword && newPassword !== repeatPassword}
          helperText={
            !!repeatPassword && newPassword !== repeatPassword
              ? "Las contraseñas no coinciden."
              : ""
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPassword(show => !show)}
                  edge="end"
                  tabIndex={-1}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {msg && <Typography color={msg.includes("correctamente") ? "green" : "red"}>{msg}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancelar</Button>
        <Button
          onClick={handleChangePassword}
          variant="contained"
          color="primary"
          disabled={
            loading ||
            !newPassword ||
            !repeatPassword ||
            !passwordValid ||
            newPassword !== repeatPassword
          }
        >
          Cambiar contraseña
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordModal;