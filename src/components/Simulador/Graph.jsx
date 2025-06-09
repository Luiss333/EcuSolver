import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { Snackbar, Alert } from "@mui/material";
const nerdamer = require("nerdamer/all.min");
const colorRecta1 = "#1f77b4";
const colorRecta2 = "#ff7f0e";
const colorPunto = "#d62728";

const Graph = ({ equations, solution, isDarkMode }) => {
  const [xView, setXView] = useState([-10, 10]);
  const [yView, setYView] = useState([-10, 10]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    if (
      solution &&
      typeof solution.x === "number" &&
      typeof solution.y === "number" &&
      solution.result &&
      !["No hay solución", "Soluciones infinitas"].includes(solution.result)
    ) {
      // Si la solución está cerca del origen, usa un margen mínimo más pequeño
      const nearOrigin = Math.abs(solution.x) < 2 && Math.abs(solution.y) < 2;
      const minMargin = nearOrigin ? 0.3 : 1.5;
      const marginFactor = 0.7;
      const marginX = Math.max(Math.abs(solution.x) * marginFactor, minMargin);
      const marginY = Math.max(Math.abs(solution.y) * marginFactor, minMargin);

      const xMin = Math.min(-marginX, solution.x - marginX, 0);
      const xMax = Math.max(marginX, solution.x + marginX, 0);
      const yMin = Math.min(-marginY, solution.y - marginY, 0);
      const yMax = Math.max(marginY, solution.y + marginY, 0);

      setXView([xMin, xMax]);
      setYView([yMin, yMax]);
    }
  }, [solution?.x, solution?.y, solution?.result]);

  useEffect(() => {
    if (solution?.result === "No hay solución") {
      setSnackbar({
        open: true,
        message: "El sistema no tiene solución.",
        severity: "warning",
      });
    }
    if (solution?.result === "Soluciones infinitas") {
      setSnackbar({
        open: true,
        message: "El sistema tiene soluciones infinitas.",
        severity: "info",
      });
    }
  }, [solution]);

  const [equation1, equation2] = equations;
  const yEq1Formatted = solution?.yEq1Formatted;
  const yEq2Formatted = solution?.yEq2Formatted;

  // Margen dinámico respecto al rango visible
  const margin = (xView[1] - xView[0]) * 2;
  const xMin =
    solution && !isNaN(solution.x)
      ? Math.min(xView[0], solution.x - margin)
      : xView[0];
  const xMax =
    solution && !isNaN(solution.x)
      ? Math.max(xView[1], solution.x + margin)
      : xView[1];

  const xValues = Array.from(
    { length: 101 },
    (_, i) => xMin + (i / 100) * (xMax - xMin)
  );

  let data = [];

  function isHorizontalEquation(equation) {
    // Elimina espacios
    const eq = equation.replace(/\s/g, "");
    // Busca patrones tipo 0x+ay=b, ay=b, y=b
    return (
      /^0x[+\-]?[\d./()*πa-zA-Z]*y=/.test(eq) ||
      /^[+\-]?[\d./()*πa-zA-Z]*y=/.test(eq) ||
      /^y=/.test(eq)
    );
  }

  // Auxiliar para extraer coeficiente de x y término independiente de ax+0y=b
  function extractCoefficients(equation, variable = "x") {
    const eq = equation.replace(/\s/g, "");
    let match;

    if (variable === "x") {
      match = eq.match(
        /^([+-]?[\d./()*πa-zA-Z]*)x([+-][\d./()*πa-zA-Z]*)y=([+-]?[\d./()*πa-zA-Z]+)$/i
      );
      if (
        match &&
        (match[2] === "+0" || match[2] === "-0" || match[2] === "0")
      ) {
        return {
          a: match[1] || "1",
          b: match[2],
        };
      }
      match = eq.match(/^x=([+-]?[\d./()*πa-zA-Z]+)$/i);
      if (match) {
        return {
          a: "1",
          b: match[1],
        };
      }
    } else if (variable === "y") {
      // Acepta: 0x+ay=b, 0x-ay=b, 0xay=b, ay=b, y=b
      match =
        eq.match(
          /^0x([+-]?[\d./()*πa-zA-Z]*)y=([+-]?(?:\([^)]+\)|[^()]+))$/i
        ) ||
        eq.match(/^0x([\d./()*πa-zA-Z]+)y=([+-]?(?:\([^)]+\)|[^()]+))$/i) ||
        eq.match(/^([+-]?[\d./()*πa-zA-Z]*)y=([+-]?(?:\([^)]+\)|[^()]+))$/i);
      if (match) {
        let coef = match[1];
        if (coef === "" || coef === "+") coef = "1";
        if (coef === "-") coef = "-1";
        return {
          a: coef,
          b: match[2],
        };
      }
      match = eq.match(/^y=([+-]?(?:\([^)]+\)|[\d./*a-zA-Zπ]+))$/i);
      if (match) {
        return {
          a: "1",
          b: match[1],
        };
      }
    }

    return null;
  }

  const isSpecialEq1 =
    /([+-]?[\d./*\sπ]+)x\s*\+\s*0\s*y\s*=\s*([+-]?[\d./*\sπ]+)/i.test(
      equation1
    ) ||
    /0\s*\*?\s*x\s*[\+\-]\s*([+-]?(?:\([^)]+\)|[\d./*a-zA-Zπ]+))y\s*=\s*([+-]?(?:\([^)]+\)|[\d./*a-zA-Zπ]+))/i.test(
      equation1
    );

  // --- Graficar ecuación 1 ---
  if (equation1) {
    // Detecta si es horizontal: 0x+ay=b, ay=b, y=b
    const eq1 = equation1.replace(/\s/g, "");

    const matchY =
      eq1.match(/^0x(.+)y=(.+)$/i) ||
      eq1.match(/^(.+)y=(.+)$/i) ||
      eq1.match(/^y=(.+)$/i);

    const matchY2 =
      eq1.match(
        /^0x([+\-]?[\d./()*πa-zA-Z+\-]+)y=([+\-]?[\d./()*πa-zA-Z+\-]+)$/i
      ) ||
      eq1.match(/^([+\-]?[\d./()*πa-zA-Z]*)y=([+\-]?[\d./()*πa-zA-Z]+)$/i) ||
      eq1.match(/^y=([+\-]?[\d./()*πa-zA-Z]+)$/i);

    // console.log("matchy:", matchY);
    // console.log("matchy2:", matchY2);
    if (matchY && matchY2) {
      let a = matchY[1];
      let b = matchY[2] || matchY[1]; // Para el caso y=b
      if (typeof b === "undefined") b = matchY[1];
      if (a === "" || a === "+" || typeof a === "undefined") a = "1";
      if (a === "-") a = "-1";
      if (typeof a === "string") {
        // Quita "+" iniciales
        a = a.replace(/^\++/, "");
        // Normaliza múltiples signos al inicio
        while (/^(\+\-|\-\+|\-\-|\+\+)/.test(a)) {
          a = a
            .replace(/^\+\-/, "-")
            .replace(/^\-\+/, "-")
            .replace(/^\-\-/, "+")
            .replace(/^\+\+/, "+");
        }
        // Si después de normalizar queda "+" al inicio, quítalo
        a = a.replace(/^\+/, "");
        // Si solo queda un signo, conviértelo a 1 o -1
        if (a === "" || a === "+") a = "1";
        if (a === "-") a = "-1";
      }
      // Encierra TODO el coeficiente entre paréntesis para nerdamer
      a = parseFloat(
        nerdamer(`(${a.replace(/π/g, "pi")})`)
          .evaluate()
          .text()
      );
      b = parseFloat(
        nerdamer(`(${b.replace(/π/g, "pi")})`)
          .evaluate()
          .text()
      );
      //console.log("ECUACION 1:", { a, b, equation1, matchY });

      if (a !== 0 && isFinite(a) && isFinite(b)) {
        const ycte = b / a;
        data.push({
          x: [xView[0], xView[1]],
          y: [ycte, ycte],
          type: "scatter",
          mode: "lines",
          line: { color: colorRecta1, width: 3 },
          name: `Ecuación 1: ${equation1}`,
        });
      }
    } else if (!yEq1Formatted || isSpecialEq1) {
      let xcte = null;
      let ycte = null;
      const coefX = extractCoefficients(equation1, "x");
      const coefY = extractCoefficients(equation1, "y");
      try {
        if (
          coefX &&
          coefX.b &&
          coefX.a &&
          (coefX.b === "+0" || coefX.b === "-0" || coefX.b === "0")
        ) {
          // Ecuación vertical: ax + 0y = b  => x = b/a
          let a = parseFloat(
            nerdamer(coefX.a.replace(/π/g, "pi")).evaluate().text()
          );
          let b = parseFloat(
            nerdamer(equation1.split("=")[1].replace(/π/g, "pi"))
              .evaluate()
              .text()
          );
          xcte = b / a;
        } else if (coefY) {
          // Ecuación horizontal: 0x + ay = b  => y = b/a
          let a = parseFloat(
            nerdamer(`(${coefY.a.replace(/π/g, "pi")})`)
              .evaluate()
              .text()
          );
          let b = parseFloat(
            nerdamer(`(${coefY.b.replace(/π/g, "pi")})`)
              .evaluate()
              .text()
          );
          ycte = b / a;
        }
        if (xcte !== null && isFinite(xcte)) {
          data.push({
            x: [xcte, xcte],
            y: [yView[0], yView[1]],
            type: "scatter",
            mode: "lines",
            line: { color: colorRecta1, width: 3 },
            name: `Ecuación 1: ${equation1}`,
          });
        }
        if (ycte !== null && isFinite(ycte)) {
          data.push({
            x: [xView[0], xView[1]],
            y: [ycte, ycte],
            type: "scatter",
            mode: "lines",
            line: { color: colorRecta1, width: 3 },
            name: `Ecuación 1: ${equation1}`,
          });
        }
      } catch (e) {
        console.error("Error evaluando ecuación 1:", e, equation1);
      }
    } else if (yEq1Formatted && yEq1Formatted !== "") {
      try {
        const yValues1 = xValues.map((x) => {
          const y = nerdamer(yEq1Formatted.replace(/π/g, "pi"), { x })
            .evaluate()
            .text();
          return parseFloat(y);
        });
        data.push({
          x: xValues,
          y: yValues1,
          type: "scatter",
          mode: "lines",
          line: { color: colorRecta1, width: 3 },
          name: `Ecuación 1: ${equation1}`,
        });
      } catch (error) {
        // No graficar si hay error
      }
    }
  }

  const isSpecialEq2 =
    /([+-]?[\d./*\sπ]+)x\s*\+\s*0\s*y\s*=\s*([+-]?[\d./*\sπ]+)/i.test(
      equation2
    ) ||
    /0\s*\*?\s*x\s*[\+\-]\s*([+-]?(?:\([^)]+\)|[\d./*a-zA-Zπ]+))y\s*=\s*([+-]?(?:\([^)]+\)|[\d./*a-zA-Zπ]+))/i.test(
      equation2
    );

  // --- Graficar ecuación 2 ---
  if (equation2) {
    // Detecta si es horizontal: 0x+ay=b, ay=b, y=b
    const eq2 = equation2.replace(/\s/g, "");

    const matchY =
      eq2.match(/^0x(.+)y=(.+)$/i) ||
      eq2.match(/^(.+)y=(.+)$/i) ||
      eq2.match(/^y=(.+)$/i);

    const matchY2 =
      eq2.match(
        /^0x([+\-]?[\d./()*πa-zA-Z+\-]+)y=([+\-]?[\d./()*πa-zA-Z+\-]+)$/i
      ) ||
      eq2.match(/^([+\-]?[\d./()*πa-zA-Z]*)y=([+\-]?[\d./()*πa-zA-Z]+)$/i) ||
      eq2.match(/^y=([+\-]?[\d./()*πa-zA-Z]+)$/i);

    if (matchY && matchY2) {
      let a = matchY[1];
      let b = matchY[2] || matchY[1]; // Para el caso y=b
      if (typeof b === "undefined") b = matchY[1];
      if (a === "" || a === "+" || typeof a === "undefined") a = "1";
      if (a === "-") a = "-1";
      if (typeof a === "string") {
        // Quita "+" iniciales
        a = a.replace(/^\++/, "");
        // Normaliza múltiples signos al inicio
        while (/^(\+\-|\-\+|\-\-|\+\+)/.test(a)) {
          a = a
            .replace(/^\+\-/, "-")
            .replace(/^\-\+/, "-")
            .replace(/^\-\-/, "+")
            .replace(/^\+\+/, "+");
        }
        // Si después de normalizar queda "+" al inicio, quítalo
        a = a.replace(/^\+/, "");
        // Si solo queda un signo, conviértelo a 1 o -1
        if (a === "" || a === "+") a = "1";
        if (a === "-") a = "-1";
      }
      // Encierra TODO el coeficiente entre paréntesis para nerdamer
      a = parseFloat(
        nerdamer(`(${a.replace(/π/g, "pi")})`)
          .evaluate()
          .text()
      );
      b = parseFloat(
        nerdamer(`(${b.replace(/π/g, "pi")})`)
          .evaluate()
          .text()
      );
      if (a !== 0 && isFinite(a) && isFinite(b)) {
        const ycte = b / a;
        data.push({
          x: [xView[0], xView[1]],
          y: [ycte, ycte],
          type: "scatter",
          mode: "lines",
          line: { color: colorRecta2, width: 3 },
          name: `Ecuación 2: ${equation2}`,
        });
      }
    } else if (!yEq2Formatted || isSpecialEq2) {
      let xcte = null;
      let ycte = null;
      const coefX = extractCoefficients(equation2, "x");
      const coefY = extractCoefficients(equation2, "y");
      try {
        if (
          coefX &&
          coefX.b &&
          coefX.a &&
          (coefX.b === "+0" || coefX.b === "-0" || coefX.b === "0")
        ) {
          // Ecuación vertical: ax + 0y = b  => x = b/a
          let a = parseFloat(
            nerdamer(coefX.a.replace(/π/g, "pi")).evaluate().text()
          );
          let b = parseFloat(
            nerdamer(equation2.split("=")[1].replace(/π/g, "pi"))
              .evaluate()
              .text()
          );
          xcte = b / a;
        } else if (coefY) {
          // Ecuación horizontal: 0x + ay = b  => y = b/a
          let a = parseFloat(
            nerdamer(`(${coefY.a.replace(/π/g, "pi")})`)
              .evaluate()
              .text()
          );
          let b = parseFloat(
            nerdamer(`(${coefY.b.replace(/π/g, "pi")})`)
              .evaluate()
              .text()
          );
          ycte = b / a;
        }
        if (xcte !== null && isFinite(xcte)) {
          data.push({
            x: [xcte, xcte],
            y: [yView[0], yView[1]],
            type: "scatter",
            mode: "lines",
            line: { color: colorRecta2, width: 3 },
            name: `Ecuación 2: ${equation2}`,
          });
        }
        if (ycte !== null && isFinite(ycte)) {
          data.push({
            x: [xView[0], xView[1]],
            y: [ycte, ycte],
            type: "scatter",
            mode: "lines",
            line: { color: colorRecta2, width: 3 },
            name: `Ecuación 2: ${equation2}`,
          });
        }
      } catch (e) {
        console.error("Error evaluando ecuación 2:", e, equation2);
      }
    } else if (yEq2Formatted && yEq2Formatted !== "") {
      try {
        const yValues2 = xValues.map((x) => {
          const y = nerdamer(yEq2Formatted.replace(/π/g, "pi"), { x })
            .evaluate()
            .text();
          return parseFloat(y);
        });
        data.push({
          x: xValues,
          y: yValues2,
          type: "scatter",
          mode: "lines",
          line: { color: colorRecta2, width: 3 },
          name: `Ecuación 2: ${equation2}`,
        });
      } catch (error) {
        // No graficar si hay error
      }
    }
  }

  // Solo mostrar punto y líneas punteadas si hay solución única
  const isUniqueSolution =
    solution &&
    typeof solution.x === "number" &&
    typeof solution.y === "number" &&
    isFinite(solution.x) &&
    isFinite(solution.y) &&
    solution.result &&
    !["No hay solución", "Soluciones infinitas"].includes(solution.result);

  if (isUniqueSolution) {
    const isOrigin =
      Math.abs(solution.x) < 1e-10 && Math.abs(solution.y) < 1e-10;
    // Determina el cuadrante para ajustar la posición de las etiquetas
    let xTextPos, yTextPos;
    if (solution.x >= 0 && solution.y >= 0) {
      xTextPos = "top right";
      yTextPos = "top right";
    } else if (solution.x < 0 && solution.y >= 0) {
      xTextPos = "top left";
      yTextPos = "top left";
    } else if (solution.x < 0 && solution.y < 0) {
      xTextPos = "top right";
      yTextPos = "bottom left";
    } else {
      xTextPos = "top right";
      yTextPos = "top right";
    }

    data.push({
      x: [solution.x],
      y: [solution.y],
      type: "scatter",
      mode: "markers+text",
      marker: {
        color: colorPunto,
        size: 30,
        symbol: "circle-open-dot",
        line: { color: colorPunto, width: 6 },
        opacity: 1,
        shadow: true,
      },
      name: "Solución: " + solution.result,
      text: [
        `(${parseFloat(solution.x.toFixed(4))}, ${parseFloat(
          solution.y.toFixed(4)
        )})`,
      ],
      textposition: "top right",
      textfont: { color: colorPunto, size: 20, family: "Arial Black" },
      customdata: [[solution.x, solution.y]],
      hovertemplate:
        "(%{customdata[0]:.4f}, %{customdata[1]:.4f})<br>" +
        "x = %{customdata[0]:.4f}<br>" +
        "y = %{customdata[1]:.4f}<extra></extra>",
    });

    // Solo dibuja líneas punteadas si la solución NO es el origen
    if (!isOrigin) {
      data.push(
        // Línea punteada vertical (del eje X al punto)
        {
          x: [solution.x, solution.x],
          y: [0, solution.y],
          type: "scatter",
          mode: "lines+text",
          line: {
            color: isDarkMode ? "#bbb" : "#565656",
            width: 2,
            dash: "dot",
          },
          showlegend: false,
          text: [`x=${parseFloat(solution.x.toFixed(6)).toString()}`],
          textposition: xTextPos,
          textfont: { size: 18, color: isDarkMode ? "#fff" : "#222" },
        },
        // Línea punteada horizontal (del eje Y al punto)
        {
          x: [0, solution.x],
          y: [solution.y, solution.y],
          type: "scatter",
          mode: "lines+text",
          line: {
            color: isDarkMode ? "#bbb" : "#565656",
            width: 2,
            dash: "dot",
          },
          showlegend: false,
          text: [`y=${parseFloat(solution.y.toFixed(6)).toString()}`],
          textposition: yTextPos,
          textfont: { size: 18, color: isDarkMode ? "#fff" : "#222" },
        }
      );
    }
  }

  // --- Ejemplo de soluciones infinitas (fuera de anotaciones) ---
  if (solution?.result === "Soluciones infinitas") {
    // Ecuación 1: x = 0 => y = ?
    if (equation1) {
      let y0 = null;
      try {
        if (yEq1Formatted && yEq1Formatted !== "") {
          y0 = parseFloat(
            nerdamer(yEq1Formatted.replace(/π/g, "pi"), { x: 0 })
              .evaluate()
              .text()
          );
        }
        if ((isNaN(y0) || !isFinite(y0)) && equation1.includes("y")) {
          const expr = equation1.replace(/x/g, "(0)");
          const sol = nerdamer.solve(expr.replace(/π/g, "pi"), "y");
          let solVal = null;
          if (
            Array.isArray(sol) &&
            sol.length > 0 &&
            typeof sol[0].evaluate === "function"
          ) {
            solVal = sol[0].evaluate().text();
          } else if (sol && typeof sol.evaluate === "function") {
            solVal = sol.evaluate().text();
          } else if (typeof sol === "string" || typeof sol === "number") {
            solVal = sol;
          }
          y0 = parseFloat(solVal);
        }
      } catch {}
      if (typeof y0 === "number" && isFinite(y0)) {
        const eq1Sust = equation1.replace(/x/g, "(0)");
        data.push({
          x: [0],
          y: [y0],
          type: "scatter",
          mode: "markers+text",
          marker: { color: colorRecta1, size: 18, symbol: "diamond" },
          name: `Ejemplo solución en ecuación 1: ${eq1Sust.replace(
            / /g,
            ""
          )} → (x=0, y=${parseFloat(y0.toFixed(4))})`,
          text: [`(0, ${parseFloat(y0.toFixed(4))})`],
          textposition: "bottom center",
          showlegend: true,
        });
      }
    }
    // Ecuación 2: y = 0 => x = ?
    if (equation2) {
      let x0 = null;
      try {
        const eq2 = equation2
          .replace(/π\s*\*/g, "pi*")
          .replace(/π(?=[a-zA-Z])/g, "pi*")
          .replace(/π/g, "pi");
        let leftEval, rightEval;
        if (eq2.includes("=")) {
          const [left, right] = eq2.split("=");
          leftEval = nerdamer(left, { y: 0 }).toString();
          rightEval = nerdamer(right, { y: 0 }).toString();
        } else {
          leftEval = nerdamer(eq2, { y: 0 }).toString();
          rightEval = "0";
        }
        // Resuelve leftEval = rightEval para x
        const sol = nerdamer.solve(`${leftEval} = ${rightEval}`, "x");
        let solVal = null;
        if (
          Array.isArray(sol) &&
          sol.length > 0 &&
          typeof sol[0].evaluate === "function"
        ) {
          solVal = sol[0].evaluate().text();
        } else if (sol && typeof sol.evaluate === "function") {
          const arr = sol.symbol.elements;
          if (Array.isArray(arr) && arr.length > 0) {
            if (arr[0] && typeof arr[0].evaluate === "function") {
              solVal = arr[0].evaluate().text();
            } else {
              solVal = arr[0];
            }
          } else {
            solVal = sol.evaluate().text();
          }
        } else if (typeof sol === "string" || typeof sol === "number") {
          solVal = sol;
        }
        let solValStr =
          typeof solVal === "object" &&
          solVal !== null &&
          typeof solVal.text === "function"
            ? solVal.text()
            : solVal;

        if (typeof solValStr === "string" && solValStr.includes("/")) {
          x0 = parseFloat(nerdamer(solValStr).evaluate().text());
        } else {
          x0 = parseFloat(solValStr);
        }
        console.log("EJEMPLO ECUACION 2:", {
          leftEval,
          rightEval,
          sol,
          solVal,
          x0,
        });
      } catch (e) {
        console.log("ERROR ECUACION 2:", e);
      }
      if (typeof x0 === "number" && isFinite(x0)) {
        const eq2Sust = equation2.replace(/y/g, "(0)");
        data.push({
          x: [x0],
          y: [0],
          type: "scatter",
          mode: "markers+text",
          marker: { color: colorRecta2, size: 18, symbol: "diamond" },
          name: `Ejemplo solución en ecuación 2: ${eq2Sust.replace(
            / /g,
            ""
          )} → (x=${parseFloat(x0.toFixed(4))}, y=0)`,
          text: [`(${parseFloat(x0.toFixed(4))}, 0)`],
          textposition: "bottom center",
          showlegend: true,
        });
      }
    }
  }

  let generalSolution = "";
  if (solution?.result === "Soluciones infinitas") {
    let expr = "";
    if (yEq1Formatted && yEq1Formatted !== "") {
      expr = yEq1Formatted;
    } else if (yEq2Formatted && yEq2Formatted !== "") {
      expr = yEq2Formatted;
    }
    if (expr) {
      // Simplifica la expresión antes de mostrarla
      let simplified = "";
      try {
        simplified = nerdamer(expr.replace(/π/g, "pi"))
          .expand()
          .toString()
          .replace(/\*\*/g, "^");
      } catch {
        simplified = expr.replace(/\*\*/g, "^");
      }
      generalSolution = `Solución general: y = ${simplified}`;
    } else if (
      equation1 &&
      equation1.includes("y") &&
      equation1.includes("x")
    ) {
      generalSolution = `Solución general: x = f(y)`;
    }
  }

  let annotations = [];
  if (
    solution?.result === "No hay solución" ||
    solution?.result === "Soluciones infinitas"
  ) {
    annotations.push({
      text: solution.result + (generalSolution ? `<br>${generalSolution}` : ""),
      xref: "paper",
      yref: "paper",
      x: 0.5,
      y: 1.0,
      showarrow: false,
      font: {
        size: 22,
        color: isDarkMode ? "#fff" : "#d62728",
        family: "Arial Black",
      },
      bgcolor: isDarkMode ? "#23272f" : "#fffbe6",
      bordercolor: "#d62728",
      borderwidth: 2,
      borderpad: 6,
    });
  }

  const layout = {
    plot_bgcolor: isDarkMode ? "#232526" : "#f9f9fa",
    paper_bgcolor: isDarkMode ? "#232526" : "#f9f9fa",
    xaxis: {
      range: xView,
      title: { text: "Eje X", font: { color: isDarkMode ? "#fff" : "#222" } },
      zeroline: true,
      zerolinewidth: 2,
      color: isDarkMode ? "#fff" : "#222",
      gridcolor: isDarkMode ? "#444" : "#e0e0e0",
    },
    yaxis: {
      range: yView,
      title: { text: "Eje Y", font: { color: isDarkMode ? "#fff" : "#222" } },
      zeroline: true,
      zerolinewidth: 2,
      color: isDarkMode ? "#fff" : "#222",
      gridcolor: isDarkMode ? "#444" : "#e0e0e0",
    },
    title: {
      text: "Gráfica de las Ecuaciones",
      font: { color: isDarkMode ? "#fff" : "#222" },
    },
    legend: {
      orientation: "h",
      y: -0.3,
      x: 0.5,
      xanchor: "center",
      font: { color: isDarkMode ? "#fff" : "#222" },
    },
    margin: { t: 90, l: 50, r: 50, b: 50 },
    dragmode: "pan",
    annotations,
  };

  //console.log("DATA PARA PLOT:", data);

  return (
    <>
      <Plot
        data={data}
        layout={layout}
        config={{
          scrollZoom: true,
          displayModeBar: true,
          modeBarButtonsToRemove: [
            "select2d",
            "lasso2d",
            "sendDataToCloud",
            "autoScale2d",
          ],
          showSendToCloud: false,
          displaylogo: false,
        }}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler={true}
        onRelayout={(event) => {
          if (event["xaxis.range[0]"] && event["xaxis.range[1]"]) {
            setXView([event["xaxis.range[0]"], event["xaxis.range[1]"]]);
          }
          if (event["yaxis.range[0]"] && event["yaxis.range[1]"]) {
            setYView([event["yaxis.range[0]"], event["yaxis.range[1]"]]);
          }
        }}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Graph;
