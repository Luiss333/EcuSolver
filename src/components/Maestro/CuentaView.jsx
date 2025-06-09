import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Alert,
  useTheme,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import BadgeIcon from "@mui/icons-material/Badge";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

function CuentaView({ userData, onUpdate }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // console.log("userData", userData);
  }, [userData]);

  const [form, setForm] = useState({
    nombre_s: userData.nombre_s,
    apellidoP: userData.apellidoP,
    apellidoM: userData.apellidoM,
    numeroEmpleado: userData.numeroEmpleado || "",
    correo: userData.correo,
    actualPassword: "",
    newPassword: "",
    repeatPassword: "",
  });
  const [errores, setErrores] = useState({ numeroEmpleado: "" });
  const [editField, setEditField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const validarContraseña = (contraseña) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return regex.test(contraseña);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "numeroEmpleado") {
      setErrores({
        ...errores,
        numeroEmpleado: validarNumeroEmpleado(e.target.value)
          ? ""
          : "El número de empleado debe tener entre 6 y 10 dígitos numéricos.",
      });
    }
  };

  const handleEdit = (field) => {
    setEditField(field);
    setMsg({ type: "", text: "" });
    setForm({
      ...form,
      nombre: `${userData.nombre_s} ${userData.apellidoP} ${userData.apellidoM}`,
      numeroEmpleado: userData.numeroEmpleado || "",
      actualPassword: "",
      newPassword: "",
      repeatPassword: "",
    });
  };

  const handleCancel = () => {
    setEditField(null);
    setMsg({ type: "", text: "" });
    setForm({
      ...form,
      nombre: `${userData.nombre_s} ${userData.apellidoP} ${userData.apellidoM}`,
      correo: userData.correo,
      actualPassword: "",
      newPassword: "",
      repeatPassword: "",
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setMsg({ type: "", text: "" });

    if (!form.actualPassword) {
      setMsg({ type: "error", text: "Debes ingresar tu contraseña actual." });
      setLoading(false);
      return;
    }

    if (editField === "password") {
      if (!form.newPassword || !form.repeatPassword) {
        setMsg({
          type: "error",
          text: "Completa ambos campos de nueva contraseña.",
        });
        setLoading(false);
        return;
      }
      if (form.newPassword !== form.repeatPassword) {
        setMsg({ type: "error", text: "Las nuevas contraseñas no coinciden." });
        setLoading(false);
        return;
      }
    }

    // Construir payload
    let payload = { actualPassword: form.actualPassword };
    if (editField === "nombre") payload.nombre = form.nombre;
    if (editField === "numeroEmpleado")
      payload.numeroEmpleado = form.numeroEmpleado;
    if (editField === "password") payload.newPassword = form.newPassword;

    try {
      const response = await fetch("https://backend-tt-209366905887.us-central1.run.app/maestro/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setMsg({ type: "error", text: data.message || "Error al actualizar." });
      } else {
        setMsg({ type: "success", text: "Datos actualizados correctamente." });
        if (onUpdate) onUpdate();
        setEditField(null);
        window.location.reload(); // Recargar para reflejar cambios
      }
    } catch (err) {
      setMsg({ type: "error", text: "Error de red." });
    }
    setLoading(false);
  };

  const validarNumeroEmpleado = (numero) => {
    const regex = /^\d{6,10}$/;
    return regex.test(numero);
  };

  return (
    <Paper
      sx={{
        maxWidth: 500,
        mx: "auto",
        p: { xs: 2, sm: 4 },
        mt: 4,
        borderRadius: 4,
        background: isDark
          ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
          : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        boxShadow: isDark
          ? "0 4px 24px rgba(40,62,81,0.25)"
          : "0 4px 24px rgba(30,60,114,0.10)",
      }}
    >
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <AccountCircleIcon
          sx={{
            fontSize: 48,
            color: isDark ? "#ffd700" : "#283e51",
            mb: 1,
          }}
        />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: isDark ? "#ffd700" : "#283e51",
            letterSpacing: 0.5,
          }}
        >
          Información de la Cuenta
        </Typography>
      </Box>
      <Divider sx={{ mb: 2, background: isDark ? "#ffd700" : "#283e51" }} />
      {msg.text && (
        <Alert severity={msg.type} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      )}
      {/* Nombre */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 3,
          background: isDark
            ? "rgba(255,255,255,0.02)"
            : "linear-gradient(90deg, #fff 0%, #f5f7fa 100%)",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: isDark ? "#ffd700" : "#283e51",
            display: "flex",
            alignItems: "center",
            mb: 1,
          }}
        >
          <AccountCircleIcon sx={{ mr: 1 }} />
          Nombre
        </Typography>
        {editField === "nombre" ? (
          <>
            <TextField
              name="nombre_s"
              label="Nombre(s)"
              value={form.nombre_s}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 1 }}
              autoFocus
            />
            <TextField
              name="apellidoP"
              label="Apellido paterno"
              value={form.apellidoP}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 1 }}
            />
            <TextField
              name="apellidoM"
              label="Apellido materno"
              value={form.apellidoM}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 1 }}
            />
            <TextField
              name="actualPassword"
              label="Contraseña actual"
              type={showPassword ? "text" : "password"}
              value={form.actualPassword}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 1 }}
              InputProps={{
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
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={loading}
              startIcon={<SaveIcon />}
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
            >
              Guardar
            </Button>
            <Button
              onClick={handleCancel}
              startIcon={<CancelIcon />}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                color: isDark ? "#ffd700" : "#283e51",
              }}
            >
              Cancelar
            </Button>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography>
              {`${userData.nombre_s} ${userData.apellidoP} ${userData.apellidoM}`}
            </Typography>
            <Button
              onClick={() => handleEdit("nombre")}
              startIcon={<EditIcon />}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                color: isDark ? "#ffd700" : "#283e51",
              }}
            >
              Editar
            </Button>
          </Box>
        )}
      </Box>
      {/* Número de empleado */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 3,
          background: isDark
            ? "rgba(255,255,255,0.02)"
            : "linear-gradient(90deg, #fff 0%, #f5f7fa 100%)",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: isDark ? "#ffd700" : "#283e51",
            display: "flex",
            alignItems: "center",
            mb: 1,
          }}
        >
          <BadgeIcon sx={{ mr: 1 }} />
          Número de empleado
        </Typography>
        {editField === "numeroEmpleado" ? (
          <>
            <TextField
              name="numeroEmpleado"
              label="Número de empleado"
              value={form.numeroEmpleado}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 1 }}
              autoFocus
              error={!!errores.numeroEmpleado}
              helperText={errores.numeroEmpleado}
            />
            <TextField
              name="actualPassword"
              label="Contraseña actual"
              type="password"
              value={form.actualPassword}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={
                loading || !!errores.numeroEmpleado || !form.numeroEmpleado
              }
              startIcon={<SaveIcon />}
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
            >
              Guardar
            </Button>
            <Button
              onClick={handleCancel}
              startIcon={<CancelIcon />}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                color: isDark ? "#ffd700" : "#283e51",
              }}
            >
              Cancelar
            </Button>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography>{userData.numeroEmpleado}</Typography>
            <Button
              onClick={() => handleEdit("numeroEmpleado")}
              startIcon={<EditIcon />}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                color: isDark ? "#ffd700" : "#283e51",
              }}
            >
              Editar número
            </Button>
          </Box>
        )}
      </Box>

      {/* Correo solo visible */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 3,
          background: isDark
            ? "rgba(255,255,255,0.02)"
            : "linear-gradient(90deg, #fff 0%, #f5f7fa 100%)",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: isDark ? "#ffd700" : "#283e51",
            display: "flex",
            alignItems: "center",
            mb: 1,
          }}
        >
          <EmailIcon sx={{ mr: 1 }} />
          Correo
        </Typography>
        <Typography>{userData.correo}</Typography>
      </Box>
      {/* Contraseña */}
      <Box
        sx={{
          mb: 1,
          p: 2,
          borderRadius: 3,
          background: isDark
            ? "rgba(255,255,255,0.02)"
            : "linear-gradient(90deg, #fff 0%, #f5f7fa 100%)",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: isDark ? "#ffd700" : "#283e51",
            display: "flex",
            alignItems: "center",
            mb: 1,
          }}
        >
          <LockIcon sx={{ mr: 1 }} />
          Contraseña
        </Typography>
        {editField === "password" ? (
          <>
            <TextField
              name="actualPassword"
              label="Contraseña actual"
              type={showPassword ? "text" : "password"}
              value={form.actualPassword}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 1 }}
              autoFocus
              InputProps={{
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
            />
            <TextField
              name="newPassword"
              label="Nueva contraseña"
              type={showPassword ? "text" : "password"}
              value={form.newPassword}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 1 }}
              error={!!form.newPassword && !validarContraseña(form.newPassword)}
              helperText={
                !!form.newPassword && !validarContraseña(form.newPassword)
                  ? "Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial."
                  : ""
              }
              InputProps={{
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
            />
            <TextField
              name="repeatPassword"
              label="Repetir nueva contraseña"
              type={showPassword ? "text" : "password"}
              value={form.repeatPassword}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 1 }}
              InputProps={{
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
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={
                loading ||
                (editField === "password" &&
                  (!form.newPassword ||
                    !form.repeatPassword ||
                    !validarContraseña(form.newPassword) ||
                    form.newPassword !== form.repeatPassword))
              }
              startIcon={<SaveIcon />}
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
            >
              Guardar
            </Button>
            <Button
              onClick={handleCancel}
              startIcon={<CancelIcon />}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                color: isDark ? "#ffd700" : "#283e51",
              }}
            >
              Cancelar
            </Button>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography>********</Typography>
            <Button
              onClick={() => handleEdit("password")}
              startIcon={<EditIcon />}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                color: isDark ? "#ffd700" : "#283e51",
              }}
            >
              Cambiar contraseña
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default CuentaView;
