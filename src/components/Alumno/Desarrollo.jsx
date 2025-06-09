import React, { useState } from "react";
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

const Desarrollo = ({ onSubmit }) => {
  const [metodo, setMetodo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [desarrollo, setDesarrollo] = useState("");
  const [evaluacion, setEvaluacion] = useState("");
  const [loading, setLoading] = useState(false);

  const evaluarDesarrollo = async (metodo, desarrollo) => {
    setLoading(true);
    setEvaluacion("");
    const prompt = `Evalúa si el siguiente desarrollo para resolver un sistema de ecuaciones es correcto usando el método "${metodo}".
Descripción del problema: ${descripcion}
Desarrollo del estudiante: ${desarrollo}
Responde solo "Correcto" o "Incorrecto" y una breve explicación.`;

    const data = await response.json();
    setLoading(false);
    if (data.choices && data.choices[0]) {
      setEvaluacion(data.choices[0].message.content);
    } else {
      setEvaluacion("No se pudo evaluar el desarrollo.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ metodo, descripcion, desarrollo });
    }
    if (metodo && desarrollo) {
      await evaluarDesarrollo(metodo, desarrollo);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl fullWidth style={{ marginBottom: "20px" }}>
        <InputLabel id="metodo-label">Método</InputLabel>
        <Select
          labelId="metodo-label"
          value={metodo}
          label="Método"
          onChange={(e) => setMetodo(e.target.value)}
        >
          <MenuItem value="sustitucion">Sustitución</MenuItem>
          <MenuItem value="igualacion">Igualación</MenuItem>
          <MenuItem value="reduccion">Reducción</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Descripción del problema"
        multiline
        minRows={2}
        variant="outlined"
        fullWidth
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        style={{ marginBottom: "20px" }}
      />
      <Typography variant="subtitle1" style={{ marginBottom: "8px" }}>
        Desarrollo
      </Typography>
      <TextField
        label="Desarrollo"
        multiline
        minRows={4}
        variant="outlined"
        fullWidth
        value={desarrollo}
        onChange={(e) => setDesarrollo(e.target.value)}
        style={{ marginBottom: "20px" }}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Enviar Desarrollo"}
      </Button>
      {evaluacion && (
        <Typography variant="body1" style={{ marginTop: "20px" }}>
          <b>Evaluación:</b> {evaluacion}
        </Typography>
      )}
    </form>
  );
};

export default Desarrollo;
