import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Alert,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import BadgeIcon from "@mui/icons-material/Badge";
import GroupIcon from "@mui/icons-material/Group";
import InputIcon from "@mui/icons-material/Input";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

function CuentaAlumnoView({ userData, onUpdate }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [form, setForm] = useState({
    nombre_s: userData.nombre_s,
    apellidoP: userData.apellidoP,
    apellidoM: userData.apellidoM,
    boleta: userData.boleta,
    actualPassword: "",
    newPassword: "",
    repeatPassword: "",
  });
  const [errores, setErrores] = useState({ boleta: "" });
  const [editField, setEditField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [grupo, setGrupo] = useState(userData.grupoAL || "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [codigoGrupo, setCodigoGrupo] = useState("");
  const [dialogMsg, setDialogMsg] = useState("");
  const [bajaLoading, setBajaLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "boleta") {
      setErrores({
        ...errores,
        boleta: validarBoleta(e.target.value)
          ? ""
          : "La boleta debe tener 10 dígitos y empezar con el año de ingreso (ej. 2020XXXXXX)",
      });
    }
  };

  const handleEdit = (field) => {
    setEditField(field);
    setMsg({ type: "", text: "" });
    setForm({
      ...form,
      nombre_s: userData.nombre_s,
      apellidoP: userData.apellidoP,
      apellidoM: userData.apellidoM,
      boleta: userData.boleta,
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
      nombre_s: userData.nombre_s,
      apellidoP: userData.apellidoP,
      apellidoM: userData.apellidoM,
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

    // Validación para nombre
    if (editField === "nombre") {
      if (!form.nombre_s || !form.apellidoP || !form.apellidoM) {
        setMsg({ type: "error", text: "Completa todos los campos de nombre." });
        setLoading(false);
        return;
      }
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
    if (editField === "nombre") {
      payload.nombre_s = form.nombre_s;
      payload.apellidoP = form.apellidoP;
      payload.apellidoM = form.apellidoM;
    }
    if (editField === "boleta") payload.boleta = form.boleta;
    if (editField === "password") payload.newPassword = form.newPassword;

    try {
      const response = await fetch("https://backend-tt-209366905887.us-central1.run.app/alumno/update", {
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
        window.location.reload(); // Recarga la página tras actualizar
      }
    } catch (err) {
      setMsg({ type: "error", text: "Error de red." });
    }
    setLoading(false);
  };

  console.log("CuentaAlumnoView rendered with userData:", userData);

  const handleInscribirse = async () => {
    setDialogMsg("");
    if (!codigoGrupo) {
      setDialogMsg("Ingresa el código del grupo.");
      return;
    }
    try {
      const res = await fetch("https://backend-tt-209366905887.us-central1.run.app/alumno/inscribir-grupo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ codigoClase: codigoGrupo }),
      });
      const data = await res.json();
      if (res.ok) {
        setGrupo(data.grupoAL);
        setDialogOpen(false);
        setCodigoGrupo("");
        setMsg({ type: "success", text: "Inscripción exitosa." });
        if (onUpdate) onUpdate();
        window.location.reload();
      } else {
        setDialogMsg(data.message || "Código inválido.");
      }
    } catch {
      setDialogMsg("Error de red.");
    }
  };

  const handleBaja = async () => {
    if (
      !window.confirm(
        "¿Seguro que deseas darte de baja del grupo? Esta acción es irreversible."
      )
    )
      return;
    setBajaLoading(true);
    try {
      const res = await fetch("https://backend-tt-209366905887.us-central1.run.app/alumno/baja-grupo", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setGrupo("");
        setMsg({ type: "success", text: "Te has dado de baja del grupo." });
        if (onUpdate) onUpdate();
        window.location.reload();
      } else {
        setMsg({
          type: "error",
          text: data.message || "No se pudo dar de baja.",
        });
      }
    } catch {
      setMsg({ type: "error", text: "Error de red." });
    }
    setBajaLoading(false);
  };

  const validarContraseña = (contraseña) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return regex.test(contraseña);
  };

  const validarBoleta = (boleta) => {
    const regex = /^(20\d{2}|19\d{2})\d{6}$/;
    return regex.test(boleta);
  };

  return (
    <>
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
        {/* Correo y Boleta */}
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
          {editField === "boleta" ? (
            <>
              <TextField
                name="boleta"
                label="Boleta"
                value={form.boleta}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 1 }}
                autoFocus
                error={!!errores.boleta}
                helperText={errores.boleta}
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
                disabled={loading || !!errores.boleta || !form.boleta}
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
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography>{userData.correo}</Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    background: isDark
                      ? "rgba(255,215,0,0.08)"
                      : "rgba(40,62,81,0.06)",
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.5,
                    ml: 1,
                  }}
                >
                  <BadgeIcon
                    sx={{
                      fontSize: 20,
                      mr: 0.5,
                      color: isDark ? "#ffd700" : "#283e51",
                    }}
                  />
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: isDark ? "#ffd700" : "#283e51",
                      fontSize: 15,
                    }}
                  >
                    {userData.boleta}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex" }}>
                <Button
                  onClick={() => handleEdit("boleta")}
                  startIcon={<EditIcon />}
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    color: isDark ? "#ffd700" : "#283e51",
                  }}
                >
                  Editar boleta
                </Button>
              </Box>
            </Box>
          )}
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
                error={
                  !!form.newPassword && !validarContraseña(form.newPassword)
                }
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
        {/* Apartado Grupo */}
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
            <GroupIcon sx={{ mr: 1 }} />
            Grupo
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              sx={{ fontWeight: 600, color: isDark ? "#ffd700" : "#283e51" }}
            >
              {grupo ? grupo : "Sin grupo"}
            </Typography>
            {grupo ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<ExitToAppIcon />}
                onClick={handleBaja}
                disabled={bajaLoading}
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  color: isDark ? "#ffd700" : "#283e51",
                  borderColor: isDark ? "#ffd700" : "#283e51",
                  "&:hover": {
                    background: isDark ? "#ffd70022" : "#283e5111",
                  },
                }}
              >
                Darse de baja
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<InputIcon />}
                onClick={() => setDialogOpen(true)}
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
                }}
              >
                Inscribirse
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
      {/* Dialog para inscribirse */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Inscribirse a un grupo</DialogTitle>
        <DialogContent>
          <TextField
            label="Código del grupo"
            value={codigoGrupo}
            onChange={(e) => setCodigoGrupo(e.target.value)}
            fullWidth
            sx={{ mt: 1, mb: 2 }}
            autoFocus
          />
          {dialogMsg && (
            <Typography color="error" sx={{ mb: 1 }}>
              {dialogMsg}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleInscribirse}>
            Inscribirse
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CuentaAlumnoView;
