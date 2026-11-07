import { useEffect, useRef, useState } from "preact/hooks";
import { Chart, registerables } from "chart.js";

import {
  compareTwoSteps,
  simulate,
  type SimulationResult,
  type StepMetrics,
  timeToThreshold,
  validateInputs,
} from "../lib/model.ts";
import { InputField } from "../components/InputField.tsx";
import { Interpretation } from "../components/Interpretation.tsx";
import { ResultsTable } from "../components/ResultsTable.tsx";

Chart.register(...registerables);

interface Preset {
  id: string;
  name: string;
  subtitle: string;
  c0: string;
  E: string;
  k: string;
  T: string;
  h1: string;
  h2: string;
  threshold: string;
}

const PRESETS: Preset[] = [
  {
    id: "base",
    name: "Lavado por Lluvia Nocturna",
    subtitle: "Caso Base Rúbrica (E=0, depuración k=0.10)",
    c0: "150",
    E: "0",
    k: "0.1",
    T: "24",
    h1: "1",
    h2: "0.5",
    threshold: "50",
  },
  {
    id: "chaqueo",
    name: "Episodio de Chaqueo / Humo",
    subtitle: "Emisión sostenida severa en la cuenca",
    c0: "160",
    E: "22",
    k: "0.08",
    T: "24",
    h1: "1",
    h2: "0.5",
    threshold: "50",
  },
  {
    id: "trafico",
    name: "Hora Pico y Dispersión",
    subtitle: "Emisiones vehiculares en día despejado",
    c0: "40",
    E: "14",
    k: "0.18",
    T: "24",
    h1: "1",
    h2: "0.5",
    threshold: "50",
  },
  {
    id: "inversion",
    name: "Inversión Térmica en Cuenca",
    subtitle: "Atrapamiento atmosférico con baja dispersión",
    c0: "85",
    E: "18",
    k: "0.04",
    T: "36",
    h1: "1",
    h2: "0.5",
    threshold: "50",
  },
];

export default function Simulator() {
  const [c0, setC0] = useState("150");
  const [E, setE] = useState("0");
  const [k, setK] = useState("0.1");
  const [T, setT] = useState("24");
  const [h1, setH1] = useState("1");
  const [h2, setH2] = useState("0.5");
  const [threshold, setThreshold] = useState("50");

  const [activePreset, setActivePreset] = useState("base");
  const [activeTab, setActiveTab] = useState<"charts" | "table" | "comparison">(
    "charts",
  );
  const [tableStepView, setTableStepView] = useState<"h1" | "h2">("h1");

  const [result1, setResult1] = useState<SimulationResult | null>(null);
  const [result2, setResult2] = useState<SimulationResult | null>(null);
  const [m1, setM1] = useState<StepMetrics | null>(null);
  const [m2, setM2] = useState<StepMetrics | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [interpretation, setInterpretation] = useState("");
  const [timeToAlert, setTimeToAlert] = useState<number | null>(null);

  const concRef = useRef<HTMLCanvasElement>(null);
  const errRef = useRef<HTMLCanvasElement>(null);
  const concChart = useRef<Chart | null>(null);
  const errChart = useRef<Chart | null>(null);

  function executeSimulation(
    valC0 = c0,
    valE = E,
    valK = k,
    valT = T,
    valH1 = h1,
    valH2 = h2,
    valThresh = threshold,
  ) {
    const nC0 = Number(valC0);
    const nE = Number(valE);
    const nK = Number(valK);
    const nT = Number(valT);
    const nH1 = Number(valH1);
    const nH2 = Number(valH2);
    const nThreshold = Number(valThresh);

    const errs = validateInputs(nC0, nE, nK, nT, nH1, nH2, nThreshold);
    setErrors(errs);
    if (errs.length > 0) {
      setResult1(null);
      setResult2(null);
      setM1(null);
      setM2(null);
      setInterpretation("");
      setTimeToAlert(null);
      return;
    }

    const r1 = simulate(nC0, nE, nK, nT, nH1);
    const r2 = simulate(nC0, nE, nK, nT, nH2);
    setResult1(r1);
    setResult2(r2);

    const [mm1, mm2] = compareTwoSteps(nC0, nE, nK, nT, nH1, nH2);
    setM1(mm1);
    setM2(mm2);

    const tThresh = timeToThreshold(r1.t, r1.exact, nThreshold);
    setTimeToAlert(tThresh);

    const betterMethod = mm1.maxAbsErrorHeun <= mm1.maxAbsErrorRk4
      ? "Heun (RK2)"
      : "RK4 Clásico";
    const gainRatio = (mm1.maxAbsErrorHeun / (mm1.maxAbsErrorRk4 || 1e-12))
      .toFixed(0);

    let text = `Concentración final a t = ${nT} h:\n• Exacta: ${
      mm1.finalExact.toFixed(4)
    } µg/m³\n• RK4: ${mm1.finalRk4.toFixed(4)} µg/m³ (ErrAbs: ${
      mm1.maxAbsErrorRk4.toExponential(3)
    })\n• Heun: ${mm1.finalHeun.toFixed(4)} µg/m³ (ErrAbs: ${
      mm1.maxAbsErrorHeun.toExponential(3)
    }).\n\n`;

    if (tThresh === null) {
      text +=
        `En el horizonte de simulación (${nT} h), la concentración permanece ${
          mm1.finalExact > nThreshold ? "por encima" : "por debajo"
        } del umbral de alerta de ${nThreshold} µg/m³. `;
    } else if (tThresh === 0) {
      text +=
        `La concentración inicial de ${nC0} µg/m³ ya supera el umbral de alerta sanitaria (${nThreshold} µg/m³). `;
    } else {
      text +=
        `Se alcanza el umbral de alerta de ${nThreshold} µg/m³ aproximadamente a las t ≈ ${
          tThresh.toFixed(2)
        } horas. `;
    }

    text +=
      `El método con menor error global es ${betterMethod}, con un orden de precisión superior de RK4 frente a Heun (RK4 es ~${gainRatio}x más preciso en este escenario). `;

    if (mm1.finalExact > nThreshold) {
      text +=
        `Recomendación para la comunidad de La Paz: Como la concentración final (${
          mm1.finalExact.toFixed(2)
        } µg/m³) supera el umbral normativo, se recomienda restringir actividad física intensa al aire libre para grupos vulnerables (niños, adultos mayores y personas con afecciones asmáticas o respiratorias).`;
    } else {
      text +=
        `Recomendación para la comunidad de La Paz: La concentración desciende a niveles considerados aceptables en el horizonte simulado, permitiendo actividades comunitarias habituales con monitoreo continuo.`;
    }

    setInterpretation(text);
  }

  function applyPreset(preset: Preset) {
    setActivePreset(preset.id);
    setC0(preset.c0);
    setE(preset.E);
    setK(preset.k);
    setT(preset.T);
    setH1(preset.h1);
    setH2(preset.h2);
    setThreshold(preset.threshold);
    executeSimulation(
      preset.c0,
      preset.E,
      preset.k,
      preset.T,
      preset.h1,
      preset.h2,
      preset.threshold,
    );
  }

  // Auto-run on mount so page is never empty
  useEffect(() => {
    executeSimulation();
  }, []);

  // Update concentration chart
  useEffect(() => {
    if (!result1 || !concRef.current) return;
    if (concChart.current) concChart.current.destroy();

    const ctx = concRef.current.getContext("2d");
    if (!ctx) return;

    const nThreshold = Number(threshold);
    const thresholdData = new Array(result1.t.length).fill(nThreshold);

    concChart.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: result1.t.map((v) => `${v.toFixed(1)}h`),
        datasets: [
          {
            label: "Solución Exacta C(t)",
            data: result1.exact,
            borderColor: "#f8fafc",
            backgroundColor: "transparent",
            borderWidth: 2.5,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
          {
            label: "RK4 Clásico",
            data: result1.rk4,
            borderColor: "#10b981",
            backgroundColor: "transparent",
            borderWidth: 2,
            borderDash: [4, 4],
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
          {
            label: "Heun (RK2)",
            data: result1.heun,
            borderColor: "#06b6d4",
            backgroundColor: "transparent",
            borderWidth: 1.8,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
          {
            label: `Umbral Alerta (${nThreshold} µg/m³)`,
            data: thresholdData,
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245, 158, 11, 0.05)",
            borderWidth: 1.5,
            borderDash: [6, 6],
            fill: false,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400 },
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: "#cbd5e1",
              boxWidth: 14,
              font: { family: "JetBrains Mono", size: 11 },
            },
          },
          tooltip: {
            backgroundColor: "#0f172a",
            borderColor: "#334155",
            borderWidth: 1,
            titleFont: { family: "JetBrains Mono", size: 12 },
            bodyFont: { family: "JetBrains Mono", size: 11 },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Tiempo t (horas)",
              color: "#94a3b8",
              font: { size: 11, family: "JetBrains Mono" },
            },
            ticks: {
              color: "#64748b",
              font: { family: "JetBrains Mono", size: 10 },
            },
            grid: { color: "rgba(255, 255, 255, 0.05)" },
          },
          y: {
            title: {
              display: true,
              text: "Concentración C (µg/m³)",
              color: "#94a3b8",
              font: { size: 11, family: "JetBrains Mono" },
            },
            ticks: {
              color: "#64748b",
              font: { family: "JetBrains Mono", size: 10 },
            },
            grid: { color: "rgba(255, 255, 255, 0.05)" },
          },
        },
      },
    });

    return () => {
      concChart.current?.destroy();
      concChart.current = null;
    };
  }, [result1, threshold]);

  // Update absolute error chart
  useEffect(() => {
    if (!result1 || !errRef.current) return;
    if (errChart.current) errChart.current.destroy();

    const ctx = errRef.current.getContext("2d");
    if (!ctx) return;

    const errHeun = result1.heun.map((v, i) => Math.abs(v - result1.exact[i]));
    const errRk4 = result1.rk4.map((v, i) => Math.abs(v - result1.exact[i]));

    errChart.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: result1.t.map((v) => `${v.toFixed(1)}h`),
        datasets: [
          {
            label: "Error Absoluto Heun (RK2)",
            data: errHeun,
            borderColor: "#06b6d4",
            backgroundColor: "rgba(6, 182, 212, 0.05)",
            borderWidth: 2,
            tension: 0.1,
            pointRadius: 0,
            fill: true,
          },
          {
            label: "Error Absoluto RK4",
            data: errRk4,
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderWidth: 2,
            tension: 0.1,
            pointRadius: 0,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400 },
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: "#cbd5e1",
              boxWidth: 14,
              font: { family: "JetBrains Mono", size: 11 },
            },
          },
          tooltip: {
            backgroundColor: "#0f172a",
            borderColor: "#334155",
            borderWidth: 1,
            titleFont: { family: "JetBrains Mono", size: 12 },
            bodyFont: { family: "JetBrains Mono", size: 11 },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Tiempo t (horas)",
              color: "#94a3b8",
              font: { size: 11, family: "JetBrains Mono" },
            },
            ticks: {
              color: "#64748b",
              font: { family: "JetBrains Mono", size: 10 },
            },
            grid: { color: "rgba(255, 255, 255, 0.05)" },
          },
          y: {
            title: {
              display: true,
              text: "Error Absoluto |C_num - C_exacta| (µg/m³)",
              color: "#94a3b8",
              font: { size: 11, family: "JetBrains Mono" },
            },
            ticks: {
              color: "#64748b",
              font: { family: "JetBrains Mono", size: 10 },
              callback: (value) => Number(value).toExponential(1),
            },
            grid: { color: "rgba(255, 255, 255, 0.05)" },
          },
        },
      },
    });

    return () => {
      errChart.current?.destroy();
      errChart.current = null;
    };
  }, [result1]);

  const activeResultForTable = tableStepView === "h1" ? result1 : result2;
  const isFinalAlert = m1 ? m1.finalExact > Number(threshold) : false;

  return (
    <div class="flex flex-col gap-8">
      {/* 1. Presets Toolbar */}
      <div class="flex flex-col gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-2">
            <svg
              class="w-4 h-4 text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Escenarios de Simulación Rápida (La Paz)
          </span>
          <span class="text-[11px] text-slate-500 font-mono">
            Un clic para cargar parámetros contextuales
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESETS.map((p) => {
            const isSelected = activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                class={`text-left p-3 rounded-lg border transition-all text-xs flex flex-col gap-1 btn-press ${
                  isSelected
                    ? "bg-cyan-950/40 border-cyan-500/80 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100"
                }`}
              >
                <div class="font-medium text-slate-100 flex items-center justify-between">
                  <span>{p.name}</span>
                  {isSelected && (
                    <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse">
                    </span>
                  )}
                </div>
                <span class="text-[11px] text-slate-400 line-clamp-1">
                  {p.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Input Matrix */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        {/* Block A: Initial condition & Threshold */}
        <div class="flex flex-col gap-3">
          <div class="border-b border-slate-800 pb-2">
            <h3 class="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              1. Condiciones Iniciales & Alerta
            </h3>
            <p class="text-[11px] text-slate-400">
              Estado inicial y punto de inflexión normativo
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <InputField
              id="c0"
              symbol="C₀"
              label="Concentración Inicial"
              unit="µg/m³"
              value={c0}
              onChange={(v) => {
                setC0(v);
                setActivePreset("");
              }}
              min={0}
              help="Nivel base de PM2.5 en t=0 (al inicio del evento)"
            />
            <InputField
              id="threshold"
              symbol="Umbral"
              label="Nivel de Alerta Sanitaria"
              unit="µg/m³"
              value={threshold}
              onChange={(v) => {
                setThreshold(v);
                setActivePreset("");
              }}
              min={0}
              help="Límite máximo recomendado para la salud (ICA La Paz: 50)"
            />
          </div>
        </div>

        {/* Block B: Atmospheric Dynamics */}
        <div class="flex flex-col gap-3">
          <div class="border-b border-slate-800 pb-2">
            <h3 class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              2. Dinámica Atmosférica (EDO)
            </h3>
            <p class="text-[11px] text-slate-400">
              Parámetros del balance de masa: dC/dt = E - kC
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <InputField
              id="E"
              symbol="E"
              label="Tasa de Emisión / Entrada"
              unit="µg/(m³·h)"
              value={E}
              onChange={(v) => {
                setE(v);
                setActivePreset("");
              }}
              min={0}
              help="Entrada continua (tráfico vehicular, quemas o industrias)"
            />
            <InputField
              id="k"
              symbol="k"
              label="Coeficiente de Eliminación"
              unit="h⁻¹"
              value={k}
              onChange={(v) => {
                setK(v);
                setActivePreset("");
              }}
              min={0}
              step="0.005"
              help="Velocidad de depuración por viento, deposición y lluvia"
            />
          </div>
        </div>

        {/* Block C: Numerical Discretization */}
        <div class="flex flex-col gap-3">
          <div class="border-b border-slate-800 pb-2">
            <h3 class="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              3. Discretización y Pasos (Rúbrica)
            </h3>
            <p class="text-[11px] text-slate-400">
              Horizonte temporal y comparación de pasos h₁ y h₂
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            <InputField
              id="T"
              symbol="T"
              label="Tiempo de Simulación"
              unit="horas"
              value={T}
              onChange={(v) => {
                setT(v);
                setActivePreset("");
              }}
              min={1}
              help="Horizonte temporal del pronóstico numérico"
            />
            <div class="grid grid-cols-2 gap-2">
              <InputField
                id="h1"
                symbol="h₁"
                label="Paso 1"
                unit="h"
                value={h1}
                onChange={(v) => {
                  setH1(v);
                  setActivePreset("");
                }}
                min={0.01}
                step="0.05"
                help="Paso base"
              />
              <InputField
                id="h2"
                symbol="h₂"
                label="Paso 2"
                unit="h"
                value={h2}
                onChange={(v) => {
                  setH2(v);
                  setActivePreset("");
                }}
                min={0.01}
                step="0.05"
                help="Paso fino"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div class="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-200 text-xs">
          <div class="font-semibold mb-1 flex items-center gap-1.5 text-rose-300">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            Se encontraron errores en los parámetros:
          </div>
          <ul class="list-disc pl-5 space-y-0.5">
            {errors.map((e, idx) => <li key={idx}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* Action Row */}
      <div class="flex items-center justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={() => executeSimulation()}
          class="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-sm rounded-lg shadow-lg shadow-cyan-500/20 btn-press flex items-center gap-2 cursor-pointer"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Recalcular Simulación y Convergencia
        </button>

        <span class="text-xs text-slate-400 font-mono">
          EDO: dC/dt = {E} - ({k})·C(t) · C(0) = {c0} µg/m³
        </span>
      </div>

      {/* 3. Real-Time KPI Cards */}
      {m1 && (
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 card-hover flex flex-col justify-between">
            <div class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Concentración Final C(T)
            </div>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-bold font-mono text-slate-100">
                {m1.finalExact.toFixed(2)}
              </span>
              <span class="text-xs text-slate-400 font-mono">µg/m³</span>
            </div>
            <div class="mt-2 text-[11px] flex items-center gap-1.5">
              <span
                class={`w-2 h-2 rounded-full ${
                  isFinalAlert ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                }`}
              >
              </span>
              <span
                class={isFinalAlert
                  ? "text-amber-300 font-medium"
                  : "text-emerald-300"}
              >
                {isFinalAlert
                  ? "Supera umbral de alerta"
                  : "Bajo umbral de alerta"}
              </span>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 card-hover flex flex-col justify-between">
            <div class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Cruce del Umbral ({threshold} µg/m³)
            </div>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-bold font-mono text-cyan-400">
                {timeToAlert !== null ? `${timeToAlert.toFixed(2)}` : "—"}
              </span>
              <span class="text-xs text-slate-400 font-mono">
                {timeToAlert !== null ? "horas" : ""}
              </span>
            </div>
            <div class="mt-2 text-[11px] text-slate-400">
              {timeToAlert === null
                ? "Sin cruce en el horizonte"
                : timeToAlert === 0
                ? "Inicia sobre el umbral"
                : `Tiempo hasta alcanzar ${threshold} µg/m³`}
            </div>
          </div>

          <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 card-hover flex flex-col justify-between">
            <div class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Error Máximo RK4 (h₁)
            </div>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-bold font-mono text-emerald-400">
                {m1.maxAbsErrorRk4.toExponential(3)}
              </span>
            </div>
            <div class="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Heun: {m1.maxAbsErrorHeun.toExponential(2)}</span>
              <span class="text-emerald-400 font-mono text-[10px] bg-emerald-950/60 px-1 rounded border border-emerald-800/40">
                O(h⁴)
              </span>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 card-hover flex flex-col justify-between">
            <div class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Ganancia Precisión RK4
            </div>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-bold font-mono text-indigo-400">
                ~{(m1.maxAbsErrorHeun / (m1.maxAbsErrorRk4 || 1e-12)).toFixed(
                  0,
                )}x
              </span>
              <span class="text-xs text-slate-400 font-mono">más exacto</span>
            </div>
            <div class="mt-2 text-[11px] text-slate-400">
              Frente a Heun con paso h₁ = {m1.h} h
            </div>
          </div>
        </div>
      )}

      {/* 4. Data Studio / Tab Navigation */}
      {result1 && (
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
            <div class="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("charts")}
                class={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === "charts"
                    ? "bg-cyan-500 text-slate-950 font-semibold shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Gráficas Comparativas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("table")}
                class={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === "table"
                    ? "bg-cyan-500 text-slate-950 font-semibold shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Tabla por Pasos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("comparison")}
                class={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === "comparison"
                    ? "bg-cyan-500 text-slate-950 font-semibold shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Comparación h₁ vs h₂
              </button>
            </div>

            {activeTab === "table" && (
              <div class="flex items-center gap-2 text-xs">
                <span class="text-slate-400">Paso:</span>
                <div class="flex items-center rounded border border-slate-800 bg-slate-900 p-0.5">
                  <button
                    type="button"
                    onClick={() => setTableStepView("h1")}
                    class={`px-2.5 py-1 rounded text-xs font-mono ${
                      tableStepView === "h1"
                        ? "bg-slate-800 text-cyan-300 font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    h₁ = {h1} h
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableStepView("h2")}
                    class={`px-2.5 py-1 rounded text-xs font-mono ${
                      tableStepView === "h2"
                        ? "bg-slate-800 text-cyan-300 font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    h₂ = {h2} h
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* TAB 1: Charts */}
          {activeTab === "charts" && (
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div class="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                    Evolución de Concentración C(t)
                  </h3>
                  <span class="text-xs text-slate-400 font-mono">µg/m³</span>
                </div>
                <div class="h-80 w-full relative">
                  <canvas ref={concRef} />
                </div>
                <p class="text-[11px] text-slate-400 leading-tight">
                  Superposición de la solución analítica exacta frente a Heun
                  (RK2) y RK4 clásico, con el umbral preventivo trazado a{" "}
                  {threshold} µg/m³.
                </p>
              </div>

              <div class="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400">
                    </span>
                    Error Absoluto Frente a Analítica
                  </h3>
                  <span class="text-xs text-slate-400 font-mono">
                    |C_num - C_exacta|
                  </span>
                </div>
                <div class="h-80 w-full relative">
                  <canvas ref={errRef} />
                </div>
                <p class="text-[11px] text-slate-400 leading-tight">
                  Comportamiento del error acumulado en el tiempo: el método RK4
                  exhibe una cota de error notablemente inferior al orden de
                  magnitud de Heun.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Results Table */}
          {activeTab === "table" && activeResultForTable && (
            <div class="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <h3 class="text-sm font-semibold text-slate-100">
                  Tabla Detallada por Iteración ({tableStepView === "h1"
                    ? `h₁ = ${h1} h`
                    : `h₂ = ${h2} h`})
                </h3>
                <span class="text-xs text-slate-400 font-mono">
                  Errores calculados punto a punto contra C_exacta
                </span>
              </div>
              <ResultsTable
                result={activeResultForTable}
                stepSizeName={tableStepView === "h1"
                  ? `h₁ = ${h1} h`
                  : `h₂ = ${h2} h`}
              />
            </div>
          )}

          {/* TAB 3: Step Size Comparison */}
          {activeTab === "comparison" && m1 && m2 && (
            <div class="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 class="text-sm font-semibold text-slate-100">
                    Análisis Comparativo Multiescala (Rúbrica Sección e)
                  </h3>
                  <p class="text-xs text-slate-400">
                    Verificación de orden de convergencia al reducir el tamaño
                    de paso
                  </p>
                </div>
                <span class="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                  Razón de paso: {(m1.h / m2.h).toFixed(2)}x
                </span>
              </div>

              <div class="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60">
                <table class="min-w-full text-xs text-left border-collapse font-mono">
                  <thead class="bg-slate-950 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th class="px-4 py-3 font-semibold text-slate-300">
                        Métrica Evaluada
                      </th>
                      <th class="px-4 py-3 font-semibold text-cyan-400">
                        Paso h₁ = {m1.h} h
                      </th>
                      <th class="px-4 py-3 font-semibold text-emerald-400">
                        Paso h₂ = {m2.h} h
                      </th>
                      <th class="px-4 py-3 font-semibold text-slate-300">
                        Factor de Mejora
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/60">
                    <tr class="hover:bg-slate-900/40">
                      <td class="px-4 py-2.5 text-slate-300 font-medium font-sans">
                        Número de Puntos / Pasos (n)
                      </td>
                      <td class="px-4 py-2.5 text-slate-100">{m1.steps}</td>
                      <td class="px-4 py-2.5 text-slate-100">{m2.steps}</td>
                      <td class="px-4 py-2.5 text-slate-400">
                        {(m2.steps / m1.steps).toFixed(1)}x más pasos
                      </td>
                    </tr>
                    <tr class="hover:bg-slate-900/40">
                      <td class="px-4 py-2.5 text-slate-300 font-medium font-sans">
                        Error Absoluto Máximo Heun (RK2)
                      </td>
                      <td class="px-4 py-2.5 text-cyan-300">
                        {m1.maxAbsErrorHeun.toFixed(6)}
                      </td>
                      <td class="px-4 py-2.5 text-cyan-300 font-semibold">
                        {m2.maxAbsErrorHeun.toFixed(6)}
                      </td>
                      <td class="px-4 py-2.5 text-cyan-400">
                        ~{(m1.maxAbsErrorHeun / m2.maxAbsErrorHeun).toFixed(1)}x
                        reducción (~O(h²))
                      </td>
                    </tr>
                    <tr class="hover:bg-slate-900/40">
                      <td class="px-4 py-2.5 text-slate-300 font-medium font-sans">
                        Error Absoluto Máximo RK4 Clásico
                      </td>
                      <td class="px-4 py-2.5 text-emerald-300">
                        {m1.maxAbsErrorRk4.toExponential(4)}
                      </td>
                      <td class="px-4 py-2.5 text-emerald-300 font-semibold">
                        {m2.maxAbsErrorRk4.toExponential(4)}
                      </td>
                      <td class="px-4 py-2.5 text-emerald-400">
                        ~{(m1.maxAbsErrorRk4 / m2.maxAbsErrorRk4).toFixed(1)}x
                        reducción (~O(h⁴))
                      </td>
                    </tr>
                    <tr class="hover:bg-slate-900/40">
                      <td class="px-4 py-2.5 text-slate-300 font-medium font-sans">
                        RMSE Heun
                      </td>
                      <td class="px-4 py-2.5 text-slate-300">
                        {m1.rmseHeun.toFixed(6)}
                      </td>
                      <td class="px-4 py-2.5 text-slate-200">
                        {m2.rmseHeun.toFixed(6)}
                      </td>
                      <td class="px-4 py-2.5 text-slate-400">
                        ~{(m1.rmseHeun / m2.rmseHeun).toFixed(1)}x menor
                      </td>
                    </tr>
                    <tr class="hover:bg-slate-900/40">
                      <td class="px-4 py-2.5 text-slate-300 font-medium font-sans">
                        RMSE RK4
                      </td>
                      <td class="px-4 py-2.5 text-emerald-300">
                        {m1.rmseRk4.toExponential(4)}
                      </td>
                      <td class="px-4 py-2.5 text-emerald-300 font-semibold">
                        {m2.rmseRk4.toExponential(4)}
                      </td>
                      <td class="px-4 py-2.5 text-emerald-400">
                        ~{(m1.rmseRk4 / m2.rmseRk4).toFixed(1)}x menor
                      </td>
                    </tr>
                    <tr class="hover:bg-slate-900/40 bg-slate-900/30">
                      <td class="px-4 py-2.5 text-slate-200 font-semibold font-sans">
                        Concentración Final Estimada
                      </td>
                      <td class="px-4 py-2.5 text-slate-200">
                        {m1.finalRk4.toFixed(4)} µg/m³
                      </td>
                      <td class="px-4 py-2.5 text-slate-100 font-semibold">
                        {m2.finalRk4.toFixed(4)} µg/m³
                      </td>
                      <td class="px-4 py-2.5 text-emerald-400 font-semibold">
                        Analítica: {m1.finalExact.toFixed(4)} µg/m³
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <strong class="text-slate-100">
                  Deducción de convergencia:
                </strong>{" "}
                Al reducir el tamaño de paso de h₁ a h₂, el error de Heun
                disminuye aproximadamente con factor cuadrático, mientras que
                RK4 disminuye con factor de orden superior (cuarto orden),
                corroborando la teoría de métodos numéricos para EDOs de primer
                orden.
              </div>
            </div>
          )}

          {/* 5. Interpretation Card */}
          {interpretation && (
            <div class="mt-2">
              <Interpretation
                text={interpretation}
                isAlert={isFinalAlert}
                threshold={Number(threshold)}
                finalConcentration={m1.finalExact}
                betterMethod="RK4 Clásico"
                timeToAlert={timeToAlert}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
