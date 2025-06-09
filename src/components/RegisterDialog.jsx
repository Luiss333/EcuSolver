import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Typography,
  Stack,
  Paper,
  Divider,
  Avatar,
  IconButton,
  InputAdornment,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import LockIcon from "@mui/icons-material/Lock";
import GroupIcon from "@mui/icons-material/Group";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import SchoolIcon from "@mui/icons-material/School";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axios from "axios";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

const API_URL = process.env.REACT_APP_API_URL || "https://backend-tt-209366905887.us-central1.run.app";

const initialAlumno = {
  nombre_s: "",
  apellidoP: "",
  apellidoM: "",
  boleta: "",
  numeroEmpleado: "",
  codigoClase: "",
  correo: "",
  contraseña: "",
  rol: "alumno",
};

const RegisterDialog = ({
  open,
  onClose,
  registroAlumno,
  setRegistroAlumno,
  onRegister,
}) => {
  const [codigo, setCodigo] = useState("");
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errores, setErrores] = useState({
    boleta: "",
    correo: "",
    numeroEmpleado: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const validarBoleta = (boleta) => {
    const regex = /^(20\d{2}|19\d{2})\d{6}$/;
    return regex.test(boleta);
  };

  const validarCorreo = (correo, rol) => {
    if (rol === "alumno")
      return /^[a-zA-Z0-9._%+-]+@alumno\.ipn\.mx$/.test(correo);
    if (rol === "maestro") return /^[a-zA-Z0-9._%+-]+@ipn\.mx$/.test(correo);
    return false;
  };

  // Contraseña segura: mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
  const validarContraseña = (contraseña) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return regex.test(contraseña);
  };

  const handleChange = (field, value) => {
    setRegistroAlumno({ ...registroAlumno, [field]: value });

    if (field === "boleta" && registroAlumno.rol === "alumno") {
      setErrores((prev) => ({
        ...prev,
        boleta: validarBoleta(value)
          ? ""
          : "La boleta debe tener 10 dígitos y empezar con el año de ingreso (ej. 2020XXXXXX)",
      }));
    }
    if (field === "numeroEmpleado" && registroAlumno.rol === "maestro") {
      setErrores((prev) => ({
        ...prev,
        numeroEmpleado:
          value.length > 0 ? "" : "El número de empleado es obligatorio",
      }));
    }
    if (field === "correo") {
      setErrores((prev) => ({
        ...prev,
        correo: validarCorreo(value, registroAlumno.rol)
          ? ""
          : registroAlumno.rol === "alumno"
          ? "Solo se permiten correos @alumno.ipn.mx"
          : "Solo se permiten correos @ipn.mx",
      }));
    }
    if (field === "contraseña") {
      setErrores((prev) => ({
        ...prev,
        contraseña: validarContraseña(value)
          ? ""
          : "Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.",
      }));
    }
  };

  // Enviar código al correo
  const enviarCodigo = async () => {
    setLoading(true);
    setMensaje("");
    try {
      await axios.post(`${API_URL}/enviar-codigo`, {
        correo: registroAlumno.correo,
      });
      setCodigoEnviado(true);
      setMensaje("Código enviado. Revisa tu correo.");
    } catch (err) {
      setMensaje("Error al enviar el código.");
    }
    setLoading(false);
  };

  // Verificar código ingresado
  const verificarCodigo = async () => {
    setLoading(true);
    setMensaje("");
    try {
      const res = await axios.post(`${API_URL}/verificar-codigo`, {
        correo: registroAlumno.correo,
        codigo,
      });
      if (res.data.verificado) {
        setVerificado(true);
        setMensaje("Correo verificado correctamente.");
      } else {
        setMensaje("Código incorrecto.");
      }
    } catch {
      setMensaje("Código incorrecto.");
    }
    setLoading(false);
  };

  // Modifica el submit para requerir verificación
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!verificado) {
      setMensaje("Verifica tu correo antes de registrarte.");
      return;
    }
    if (errores.boleta || errores.correo) {
      setMensaje("Corrige los errores antes de continuar.");
      return;
    }
    try {
      await onRegister(e); // tu función de registro
    } catch (error) {
      // Si el backend responde con el mensaje de correo ya registrado
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setMensaje(error.response.data.message);
      } else {
        setMensaje("Ocurrió un error al registrar.");
      }
    }
  };

  // Limpiar campos cada vez que se abre el diálogo
  useEffect(() => {
    if (open) {
      setRegistroAlumno(initialAlumno);
      setCodigo("");
      setCodigoEnviado(false);
      setVerificado(false);
      setLoading(false);
      setMensaje("");
      setErrores({ boleta: "", correo: "" });
    }
    // eslint-disable-next-line
  }, [open]);

  return (
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
          maxWidth: { xs: "100%", sm: 480, md: 600 },
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
            Registro
          </DialogTitle>
          <Divider sx={{ my: 2 }} />
          <DialogContent sx={{ p: 0 }}>
            <Box
              component="form"
              onSubmit={handleRegister}
              autoComplete="off"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt: 1,
              }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Nombre"
                  fullWidth
                  value={registroAlumno.nombre_s}
                  onChange={(e) =>
                    setRegistroAlumno({
                      ...registroAlumno,
                      nombre_s: e.target.value,
                    })
                  }
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 1 }}>
                        <Avatar
                          sx={{ bgcolor: "#7c3aed", width: 28, height: 28 }}
                        >
                          <PersonIcon fontSize="small" />
                        </Avatar>
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="given-name"
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Apellido Paterno"
                  fullWidth
                  value={registroAlumno.apellidoP}
                  onChange={(e) =>
                    setRegistroAlumno({
                      ...registroAlumno,
                      apellidoP: e.target.value,
                    })
                  }
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 1 }}>
                        <Avatar
                          sx={{ bgcolor: "#7c3aed", width: 28, height: 28 }}
                        >
                          <PersonIcon fontSize="small" />
                        </Avatar>
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="family-name"
                />
                <TextField
                  label="Apellido Materno"
                  fullWidth
                  value={registroAlumno.apellidoM}
                  onChange={(e) =>
                    setRegistroAlumno({
                      ...registroAlumno,
                      apellidoM: e.target.value,
                    })
                  }
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 1 }}>
                        <Avatar
                          sx={{ bgcolor: "#7c3aed", width: 28, height: 28 }}
                        >
                          <PersonIcon fontSize="small" />
                        </Avatar>
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="additional-name"
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                {registroAlumno.rol === "alumno" && (
                  <TextField
                    label="Boleta"
                    fullWidth
                    value={registroAlumno.boleta}
                    onChange={(e) => handleChange("boleta", e.target.value)}
                    required
                    error={!!errores.boleta}
                    helperText={errores.boleta}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mr: 1 }}>
                          <Avatar
                            sx={{ bgcolor: "#a21caf", width: 28, height: 28 }}
                          >
                            <BadgeIcon fontSize="small" />
                          </Avatar>
                        </InputAdornment>
                      ),
                    }}
                    autoComplete="off"
                  />
                )}

                {registroAlumno.rol === "maestro" && (
                  <TextField
                    label="Número de empleado"
                    fullWidth
                    value={registroAlumno.numeroEmpleado}
                    onChange={(e) =>
                      handleChange("numeroEmpleado", e.target.value)
                    }
                    required
                    error={!!errores.numeroEmpleado}
                    helperText={errores.numeroEmpleado}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mr: 1 }}>
                          <Avatar
                            sx={{ bgcolor: "#a21caf", width: 28, height: 28 }}
                          >
                            <BadgeIcon fontSize="small" />
                          </Avatar>
                        </InputAdornment>
                      ),
                    }}
                    autoComplete="off"
                  />
                )}

                {/* Código de grupo solo para alumno y opcional */}
                {registroAlumno.rol === "alumno" && (
                  <TextField
                    label="Código del Grupo (opcional)"
                    fullWidth
                    value={registroAlumno.codigoClase}
                    onChange={(e) =>
                      setRegistroAlumno({
                        ...registroAlumno,
                        codigoClase: e.target.value,
                      })
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mr: 1 }}>
                          <Avatar
                            sx={{ bgcolor: "#a21caf", width: 28, height: 28 }}
                          >
                            <GroupIcon fontSize="small" />
                          </Avatar>
                        </InputAdornment>
                      ),
                    }}
                    autoComplete="off"
                  />
                )}
              </Stack>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="rol-label">Rol</InputLabel>
                <Select
                  labelId="rol-label"
                  value={registroAlumno.rol}
                  label="Rol"
                  onChange={(e) =>
                    setRegistroAlumno({
                      ...registroAlumno,
                      rol: e.target.value,
                    })
                  }
                  startAdornment={
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <Avatar
                        sx={{ bgcolor: "#7c3aed", width: 28, height: 28 }}
                      >
                        <SchoolIcon fontSize="small" />
                      </Avatar>
                    </InputAdornment>
                  }
                >
                  <MenuItem value="alumno">Estudiante</MenuItem>
                  <MenuItem value="maestro">Docente</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Correo"
                type="email"
                fullWidth
                value={registroAlumno.correo}
                onChange={(e) => handleChange("correo", e.target.value)}
                required
                disabled={codigoEnviado}
                error={!!errores.correo}
                helperText={errores.correo}
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
                autoComplete="new-email"
              />
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
              >
                {!codigoEnviado && (
                  <Button
                    onClick={enviarCodigo}
                    variant="outlined"
                    disabled={!registroAlumno.correo || loading}
                    sx={{ flex: 1, fontWeight: 600 }}
                    startIcon={<EmailIcon />}
                  >
                    Enviar código de verificación
                  </Button>
                )}
                {codigoEnviado && !verificado && (
                  <>
                    <TextField
                      label="Código de verificación"
                      fullWidth
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ mr: 1 }}>
                            <Avatar
                              sx={{ bgcolor: "#a21caf", width: 28, height: 28 }}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </Avatar>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ flex: 2 }}
                    />
                    <Button
                      onClick={verificarCodigo}
                      variant="outlined"
                      disabled={!codigo || loading}
                      sx={{ flex: 1, fontWeight: 600, mt: { xs: 2, sm: 0 } }}
                      startIcon={<CheckCircleIcon />}
                    >
                      Verificar
                    </Button>
                  </>
                )}
              </Stack>
              {mensaje && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: verificado ? "success.main" : "error.main",
                    mb: 1,
                    gap: 1,
                    fontWeight: 500,
                  }}
                >
                  {verificado ? <CheckCircleIcon /> : <ErrorIcon />}
                  <Typography variant="body2">{mensaje}</Typography>
                </Box>
              )}
              <TextField
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={registroAlumno.contraseña}
                onChange={(e) => handleChange("contraseña", e.target.value)}
                required
                error={!!errores.contraseña}
                helperText={errores.contraseña}
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

              <DialogActions sx={{ px: 0, justifyContent: "flex-end" }}>
                <Button onClick={onClose} color="secondary" variant="outlined">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!verificado}
                  sx={{ ml: 2 }}
                >
                  Registrar
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Paper>
      </Box>
    </Dialog>
  );
};

export default RegisterDialog;
