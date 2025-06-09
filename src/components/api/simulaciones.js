export async function guardarSimulacion(simulacion) {
  const res = await fetch("https://backend-tt-209366905887.us-central1.run.app/simulaciones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(simulacion),
  });
  return res.json();
}

export async function obtenerSimulaciones(alumno_id) {
  const res = await fetch(`https://backend-tt-209366905887.us-central1.run.app/simulaciones/${alumno_id}`);
  //console.log("Respuesta de obtenerSimulaciones:", res);
  return res.json();
}

export async function eliminarSimulacion(id) {
  const res = await fetch(`https://backend-tt-209366905887.us-central1.run.app/simulaciones/${id}`, {
    method: "DELETE",
  });
  return res.json();
}