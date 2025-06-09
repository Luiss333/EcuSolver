import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
const nerdamer = require("nerdamer/all.min");

const isAllowedInputRealtime = (value) => {
  // Permite números, -, ., /, π y vacío (en cualquier parte)
  // Permite - en numerador y denominador (ej: -5/-5)
  if (value.includes("ππ")) return false; // No permitir ππ en tiempo real
  return /^-?[\d.π]*(\/-?[\d.π]*)?$/.test(value);
};

const isAllowedInputStrict = (value) => {
  // Permite expresiones como 1π/2π, -2.5π/3.1π, etc.
  if (
    !/^(-?\d*\.?\d*π{0,2}|-?\d*\.?\d*)(\/-?\d*\.?\d*π{0,2}|\/-?\d*\.?\d*)?$/.test(
      value
    )
  )
    return false;
  if ((value.match(/\//g) || []).length > 1) return false;
  if ((value.match(/π/g) || []).length > 4) return false; // máx 2 en num y 2 en den
  if (value.startsWith(".") || value.startsWith("/")) return false;
  if (value.startsWith("-.")) return false;
  if (value.startsWith("-/")) return false;
  if (value.endsWith("./")) return false;
  if (value.includes("π.")) return false;
  if (/π\d/.test(value)) return false;
  if (/\/0(?!\d)/.test(value)) return false;
  if (value === "-") return false;
  if (value.includes("/")) {
    const [num, den] = value.split("/");
    if (!num || !den) return false;
    // No permitir numerador o denominador que termine en punto decimal
    if (/\.\s*$/.test(num) || /\.\s*$/.test(den)) return false;
    if (den === "0" || den === "-0" || den === "+0") return false;
    if (den.endsWith(".") || den.startsWith(".")) return false;
    if (den.includes("π.")) return false;
    if (/π\d/.test(den)) return false;
    if (den.trim() === "") return false;
  }
  if (value.endsWith(".")) return false;
  return true;
};

// Normaliza valores que son variantes de cero
const isZero = (val) => {
  if (!val) return false;
  // Quita espacios y normaliza
  const v = val.trim().replace(/^[-+]?0+(\.0+)?$/, "0");
  return v === "0";
};

// Convierte la expresión a una forma evaluable por nerdamer
// ...existing code...
const normalizeInput = (value) => {
  if (!value) return "0";
  let v = value.trim();
  // Normaliza variantes de cero
  if (/^[-+]?0+(\.0+)?$/.test(v)) return "0";
  // -0/a => 0
  if (/^[-+]?0+(\.0+)?\/.+$/.test(v)) return "0";
  // -π/π => (-1*π)/(π)
  v = v.replace(/^-(π)\/π$/, "(-1*π)/(π)");
  // -π/-π => (-1*π)/(-1*π)
  v = v.replace(/^-(π)\/-(π)$/, "(-1*π)/(-1*π)");
  // π/-π => (π)/(-1*π)
  v = v.replace(/^(π)\/-(π)$/, "(π)/(-1*π)");
  // ππ => π*π
  v = v.replace(/ππ/g, "π*π");
  // -2/-8π => -2/(-8*π)
  v = v.replace(
    /^(-?\d*\.?\d*)\/(-?\d*\.?\d*)π$/,
    (m, n, d) => `${n}/(${d}*π)`
  );
  // 1π/3π => (1*π)/(3*π)
  v = v.replace(/^(-?\d*\.?\d*)π\/(-?\d*\.?\d*)π$/, (m, n, d) =>
    `(${n ? n + "*" : ""}π)/(${d ? d + "*" : ""}π)`.replace(/\*\)/g, ")")
  );
  // 1/3π => 1/(3*π)
  v = v.replace(/(\d+)\s*\/\s*(\d*\.?\d*)π/g, "$1/($2*π)");
  // 1π/3 => (1*π)/3
  v = v.replace(/(\d+)π\/(\d+)/g, "($1*π)/$2");
  // 2π => 2*π (pero no 2/3π)
  v = v.replace(/(\d)π/g, "$1*π");
  // 2/π => 2/(π)
  v = v.replace(/(\d+)\/π/g, "$1/(π)");
  return v;
};

// --- Componente reutilizable para campos de ecuación ---
const EquationField = ({
  value,
  setValue,
  placeholder,
  label,
  theme,
  sx,
  setError,
}) => (
  <TextField
    size="small"
    type="text"
    inputMode="decimal"
    value={value}
    onChange={(e) => {
      const val = e.target.value;
      if (isAllowedInputRealtime(val)) {
        setValue(val);
        setError && setError(false);
      }
    }}
    error={setError ? value && !isAllowedInputStrict(value) : false}
    placeholder={placeholder}
    label={label}
    autoComplete="off"
    sx={{
      width: 70,
      mx: 1,
      ...sx,
      "& .MuiInputBase-root": {
        color: theme.palette.mode === "dark" ? "#fff" : undefined,
        background: theme.palette.mode === "dark" ? "#23272f" : undefined,
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.mode === "dark" ? "#555" : undefined,
      },
    }}
    variant="outlined"
    InputLabelProps={{
      style: {
        color: theme.palette.mode === "dark" ? "#bbb" : undefined,
      },
    }}
  />
);

// --- Renderiza una ecuación (para evitar repetición) ---
const EquationRow = ({ values, setters, theme, labels, setErrors }) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    mb={2}
    sx={{
      background: theme.palette.mode === "dark" ? "#23272f" : "#fff",
      borderRadius: 2,
      p: 2,
      boxShadow: "0 2px 8px rgba(44,62,80,0.04)",
      flexDirection: "row",
      gap: 0,
      overflowX: "auto",
      minWidth: 0,
    }}
  >
    <EquationField
      value={values[0]}
      setValue={setters[0]}
      placeholder={labels[0]}
      label={labels[0]}
      theme={theme}
      sx={{ width: { xs: 45, sm: 70 } }}
      setError={setErrors ? setErrors[0] : undefined}
    />
    <Typography
      variant="body1"
      sx={{
        mx: 0.5,
        fontWeight: 500,
        color: theme.palette.mode === "dark" ? "#bbb" : "#607d8b",
        fontSize: { xs: 16, sm: 18 },
        whiteSpace: "nowrap",
      }}
    >
      x +
    </Typography>
    <EquationField
      value={values[1]}
      setValue={setters[1]}
      placeholder={labels[1]}
      label={labels[1]}
      theme={theme}
      sx={{ width: { xs: 45, sm: 70 } }}
      setError={setErrors ? setErrors[1] : undefined}
    />
    <Typography
      variant="body1"
      sx={{
        mx: 0.5,
        fontWeight: 500,
        color: theme.palette.mode === "dark" ? "#bbb" : "#607d8b",
        fontSize: { xs: 16, sm: 18 },
        whiteSpace: "nowrap",
      }}
    >
      y =
    </Typography>
    <EquationField
      value={values[2]}
      setValue={setters[2]}
      placeholder={labels[2]}
      label={labels[2]}
      theme={theme}
      sx={{ width: { xs: 45, sm: 70 } }}
      setError={setErrors ? setErrors[2] : undefined}
    />
  </Box>
);

// --- Componente principal ---
const InputForm = ({ onSubmit, defaultValues = {}, onValidate, ejercicioId  }) => {
  const theme = useTheme();
  const [x1, setX1] = useState(defaultValues.x1 || "");
  const [y1, setY1] = useState(defaultValues.y1 || "");
  const [b1, setB1] = useState(defaultValues.b1 || "");
  const [x2, setX2] = useState(defaultValues.x2 || "");
  const [y2, setY2] = useState(defaultValues.y2 || "");
  const [b2, setB2] = useState(defaultValues.b2 || "");
  const [openDialog, setOpenDialog] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errors1, setErrors1] = useState([false, false, false]);
  const [errors2, setErrors2] = useState([false, false, false]);

  const setError1 = (idx) => (err) => {
    setErrors1((prev) => {
      const arr = [...prev];
      arr[idx] = err;
      return arr;
    });
  };
  const setError2 = (idx) => (err) => {
    setErrors2((prev) => {
      const arr = [...prev];
      arr[idx] = err;
      return arr;
    });
  };

  

  const handleSubmit = () => {
    // Validar que ningún campo esté vacío
    if (
      !x1.trim() ||
      !y1.trim() ||
      !b1.trim() ||
      !x2.trim() ||
      !y2.trim() ||
      !b2.trim()
    ) {
      setErrorMsg("Ningún campo puede estar vacío.");
      setOpenDialog(true);
      onSubmit("", "", null);
      if (onValidate) onValidate(false);
      return;
    }

    // Validaciones de ecuaciones
    const allZeroEq1 = isZero(x1) && isZero(y1) && isZero(b1);
    const allZeroEq2 = isZero(x2) && isZero(y2) && isZero(b2);
    const onlyB1 = isZero(x1) && isZero(y1) && !isZero(b1) && b1.trim() !== "";
    const onlyB2 = isZero(x2) && isZero(y2) && !isZero(b2) && b2.trim() !== "";

    // Validar errores de campos
    if (
      errors1.some(Boolean) ||
      errors2.some(Boolean) ||
      !isAllowedInputStrict(x1) ||
      !isAllowedInputStrict(y1) ||
      !isAllowedInputStrict(b1) ||
      !isAllowedInputStrict(x2) ||
      !isAllowedInputStrict(y2) ||
      !isAllowedInputStrict(b2)
    ) {
      setErrorMsg("Alguno de los valores ingresados no es válido.");
      setOpenDialog(true);
      onSubmit("", "", null);
      if (onValidate) onValidate(false);
      return;
    }

    if (allZeroEq1 || allZeroEq2 || onlyB1 || onlyB2) {
      setErrorMsg("Alguna ecuación está vacía o incompleta.");
      setOpenDialog(true);
      onSubmit("", "", null);
      if (onValidate) onValidate(false);
      return;
    }

    // Construcción de ecuaciones y cálculo
    const nx1 = normalizeInput(x1);
    const ny1 = normalizeInput(y1);
    const nb1 = normalizeInput(b1);
    const nx2 = normalizeInput(x2);
    const ny2 = normalizeInput(y2);
    const nb2 = normalizeInput(b2);

    const equation1 = `${nx1}x + ${ny1}y = ${nb1}`;
    const equation2 = `${nx2}x + ${ny2}y = ${nb2}`;
    let solution = null;

    try {
      const a1 = parseFloat(nerdamer(nx1).evaluate().text());
      const b1n = parseFloat(nerdamer(ny1).evaluate().text());
      const c1 = parseFloat(nerdamer(nb1).evaluate().text());
      const a2 = parseFloat(nerdamer(nx2).evaluate().text());
      const b2n = parseFloat(nerdamer(ny2).evaluate().text());
      const c2 = parseFloat(nerdamer(nb2).evaluate().text());

      // Validar números demasiado pequeños
      const minAbs = 1e-8;
      if (
        [a1, b1n, c1, a2, b2n, c2].some(
          (n) => Math.abs(n) > 0 && Math.abs(n) < minAbs
        )
      ) {
        setErrorMsg(
          "Uno de los números es demasiado pequeño y puede ser considerado como 0. Por favor intenta ingresando numeros de mayor valor."
        );
        setOpenDialog(true);
        onSubmit("", "", null);
        return;
      }

      const det = a1 * b2n - a2 * b1n;
      const detX = c1 * b2n - c2 * b1n;
      const detY = a1 * c2 - a2 * c1;

      // Despejes para graficar
      let yEq1Formatted = "";
      let yEq2Formatted = "";
      try {
        yEq1Formatted =
          `${nx1}` === "0" && `${ny1}` !== "0"
            ? `${nb1}/${ny1}`
            : `${ny1}` === "0" && `${nx1}` !== "0"
            ? null
            : nerdamer(`${nx1}*x+${ny1}*y=${nb1}`).solveFor("y")[0].text();
        yEq2Formatted =
          `${nx2}` === "0" && `${ny2}` !== "0"
            ? `${nb2}/${ny2}`
            : `${ny2}` === "0" && `${nx2}` !== "0"
            ? null
            : nerdamer(`${nx2}*x+${ny2}*y=${nb2}`).solveFor("y")[0].text();
      } catch {
        yEq1Formatted = "";
        yEq2Formatted = "";
      }

      if (isNaN(det) || isNaN(detX) || isNaN(detY)) {
        solution = null;
      } else if (det === 0) {
        solution =
          detX === 0 && detY === 0
            ? { result: "Soluciones infinitas", yEq1Formatted, yEq2Formatted }
            : { result: "No hay solución", yEq1Formatted, yEq2Formatted };
      } else {
        const x = detX / det;
        const y = detY / det;
        solution = {
          x,
          y,
          result: `x = ${x.toFixed(4)}, y = ${y.toFixed(4)}`,
          yEq1Formatted,
          yEq2Formatted,
        };
      }
      if (onValidate) onValidate(true);
    } catch {
      solution = null;
      if (onValidate) onValidate(false);
    }
    onSubmit(equation1, equation2, solution);
  };

  useEffect(() => {
    
  setX1(defaultValues.x1 || "");
  setY1(defaultValues.y1 || "");
  setB1(defaultValues.b1 || "");
  setX2(defaultValues.x2 || "");
  setY2(defaultValues.y2 || "");
  setB2(defaultValues.b2 || "");
// Solo depende de ejercicioId si existe, si no depende de defaultValues
// eslint-disable-next-line
}, [ejercicioId ? ejercicioId : defaultValues]);

  return (
    <>
      <Paper
        elevation={6}
        sx={{
          p: 4,
          maxWidth: 440,
          mx: "auto",
          mt: 6,
          borderRadius: 4,
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #23272f 0%, #3a4250 100%)"
              : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          boxShadow: "0 8px 24px rgba(44,62,80,0.08)",
          border: theme.palette.mode === "dark" ? "1px solid #444a" : undefined,
        }}
      >
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: theme.palette.mode === "dark" ? "#fff" : "#2d3a4a",
            letterSpacing: 1,
          }}
        >
          Ingresa las ecuaciones
        </Typography>
        <Divider
          sx={{
            mb: 3,
            borderColor: theme.palette.mode === "dark" ? "#888" : undefined,
          }}
        />
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: theme.palette.mode === "dark" ? "#90caf9" : "#1976d2",
            mb: 1,
            ml: 1,
          }}
        >
          Ecuación 1:
        </Typography>
        <EquationRow
          values={[x1, y1, b1]}
          setters={[setX1, setY1, setB1]}
          theme={theme}
          labels={["x₁", "y₁", "b₁"]}
          setErrors={[setError1(0), setError1(1), setError1(2)]}
        />
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: theme.palette.mode === "dark" ? "#90caf9" : "#1976d2",
            mb: 1,
            ml: 1,
          }}
        >
          Ecuación 2:
        </Typography>
        <EquationRow
          values={[x2, y2, b2]}
          setters={[setX2, setY2, setB2]}
          theme={theme}
          labels={["x₂", "y₂", "b₂"]}
          setErrors={[setError2(0), setError2(1), setError2(2)]}
        />
      </Paper>
      <Box display="flex" justifyContent="center" mt={2}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Calcular
        </Button>
      </Box>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Datos inválidos</DialogTitle>
        <DialogContent>
          {errorMsg ||
            "Verifique sus datos. Alguno de los valores ingresados no es válido."}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InputForm;
