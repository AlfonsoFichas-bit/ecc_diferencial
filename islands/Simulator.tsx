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

export default function Simulator() {
  const [c0, setC0] = useState("150");
  const [E, setE] = useState("0");
  const [k, setK] = useState("0.1");
  const [T, setT] = useState("24");
  const [h1, setH1] = useState("1");
  const [h2, setH2] = useState("0.5");
  const [threshold, setThreshold] = useState("50");

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [m1, setM1] = useState<StepMetrics | null>(null);
  const [m2, setM2] = useState<StepMetrics | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [interpretation, setInterpretation] = useState("");

  const concRef = useRef<HTMLCanvasElement>(null);
  const errRef = useRef<HTMLCanvasElement>(null);
  const concChart = useRef<Chart | null>(null);
  const errChart = useRef<Chart | null>(null);

  function run() {
    const nC0 = Number(c0);
    const nE = Number(E);
    const nK = Number(k);
    const nT = Number(T);
    const nH1 = Number(h1);
    const nH2 = Number(h2);
    const nThreshold = Number(threshold);

    const errs = validateInputs(nC0, nE, nK, nT, nH1, nH2, nThreshold);
    setErrors(errs);
    if (errs.length > 0) {
      setResult(null);
      setM1(null);
      setM2(null);
      setInterpretation("");
      return;
    }

    const r1 = simulate(nC0, nE, nK, nT, nH1);
    setResult(r1);

    const [mm1, mm2] = compareTwoSteps(nC0, nE, nK, nT, nH1, nH2);
    setM1(mm1);
    setM2(mm2);

    const tThresh = timeToThreshold(r1.t, r1.exact, nThreshold);
    const betterMethod = mm1.maxAbsErrorHeun <= mm1.maxAbsErrorRk4
      ? "Heun"
      : "RK4";
    let text = `Concentracion final a t=${nT} h: exacta ${
      mm1.finalExact.toFixed(2)
    } µg/m³, Heun ${mm1.finalHeun.toFixed(2)} µg/m³, RK4 ${
      mm1.finalRk4.toFixed(2)
    } µg/m³. `;
    if (tThresh === null) {
      text +=
        `En el intervalo simulado la concentracion no cruza el umbral de ${nThreshold} µg/m³. `;
    } else {
      text +=
        `Se alcanza el umbral de ${nThreshold} µg/m³ aproximadamente a las ${
          tThresh.toFixed(2)
        } h. `;
    }
    text += `El metodo con menor error maximo absoluto fue ${betterMethod}. `;
    if (mm1.finalExact > nThreshold) {
      text +=
        "La concentracion final supera el umbral: se recomienda restringir actividad fisica intensa al aire libre para grupos sensibles (ninos, adultos mayores, personas con asma).";
    } else {
      text +=
        "La concentracion final se mantiene por debajo del umbral en el horizonte simulado.";
    }
    setInterpretation(text);
  }

  useEffect(() => {
    if (!result || !concRef.current) return;
    if (concChart.current) concChart.current.destroy();
    const ctx = concRef.current.getContext("2d");
    if (!ctx) return;
    concChart.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: result.t.map((v) => v.toFixed(2)),
        datasets: [
          {
            label: "Exacta",
            data: result.exact,
            borderColor: "#111827",
            backgroundColor: "transparent",
            tension: 0.2,
            pointRadius: 0,
          },
          {
            label: "Heun",
            data: result.heun,
            borderColor: "#2563eb",
            backgroundColor: "transparent",
            tension: 0.2,
            pointRadius: 0,
          },
          {
            label: "RK4",
            data: result.rk4,
            borderColor: "#16a34a",
            backgroundColor: "transparent",
            tension: 0.2,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: "t (h)" } },
          y: { title: { display: true, text: "C (µg/m³)" } },
        },
      },
    });
    return () => {
      concChart.current?.destroy();
      concChart.current = null;
    };
  }, [result]);

  useEffect(() => {
    if (!result || !errRef.current) return;
    if (errChart.current) errChart.current.destroy();
    const ctx = errRef.current.getContext("2d");
    if (!ctx) return;
    const errHeun = result.heun.map((v, i) => Math.abs(v - result.exact[i]));
    const errRk4 = result.rk4.map((v, i) => Math.abs(v - result.exact[i]));
    errChart.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: result.t.map((v) => v.toFixed(2)),
        datasets: [
          {
            label: "ErrAbs Heun",
            data: errHeun,
            borderColor: "#2563eb",
            backgroundColor: "transparent",
            tension: 0.2,
            pointRadius: 0,
          },
          {
            label: "ErrAbs RK4",
            data: errRk4,
            borderColor: "#16a34a",
            backgroundColor: "transparent",
            tension: 0.2,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: "t (h)" } },
          y: { title: { display: true, text: "Error absoluto (µg/m³)" } },
        },
      },
    });
    return () => {
      errChart.current?.destroy();
      errChart.current = null;
    };
  }, [result]);

  return (
    <div class="flex flex-col gap-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InputField
          id="c0"
          label="C0 (condicion inicial)"
          unit="µg/m³"
          value={c0}
          onChange={setC0}
          min={0}
          help="Concentracion inicial de PM2.5"
        />
        <InputField
          id="E"
          label="E (emision/entrada)"
          unit="µg/(m³·h)"
          value={E}
          onChange={setE}
          min={0}
          help="Tasa de emision de contaminantes"
        />
        <InputField
          id="k"
          label="k (eliminacion)"
          unit="h⁻¹"
          value={k}
          onChange={setK}
          min={0}
          step="0.001"
          help="Dispersión, deposicion y lavado"
        />
        <InputField
          id="T"
          label="T (tiempo de simulacion)"
          unit="h"
          value={T}
          onChange={setT}
          min={0}
          help="Horizonte de simulacion"
        />
        <InputField
          id="h1"
          label="h1 (paso 1)"
          unit="h"
          value={h1}
          onChange={setH1}
          min={0}
          step="0.01"
        />
        <InputField
          id="h2"
          label="h2 (paso 2)"
          unit="h"
          value={h2}
          onChange={setH2}
          min={0}
          step="0.01"
        />
        <InputField
          id="threshold"
          label="Umbral de calidad"
          unit="µg/m³"
          value={threshold}
          onChange={setThreshold}
          min={0}
          help="Nivel de alerta (ej. 50)"
        />
      </div>

      {errors.length > 0 && (
        <div class="bg-red-50 border border-red-300 rounded p-3 text-sm text-red-700">
          <ul class="list-disc pl-5">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      <button
        onClick={run}
        class="self-start px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Ejecutar simulacion
      </button>

      {result && (
        <>
          <section class="flex flex-col gap-2">
            <h2 class="text-xl font-semibold">Grafica de concentracion</h2>
            <div class="h-72">
              <canvas ref={concRef} />
            </div>
          </section>

          <section class="flex flex-col gap-2">
            <h2 class="text-xl font-semibold">Grafica de error absoluto</h2>
            <div class="h-72">
              <canvas ref={errRef} />
            </div>
          </section>

          <section class="flex flex-col gap-2">
            <h2 class="text-xl font-semibold">Tabla comparativa (paso h1)</h2>
            <ResultsTable result={result} />
          </section>

          {m1 && m2 && (
            <section class="flex flex-col gap-2">
              <h2 class="text-xl font-semibold">
                Comparacion de dos tamanos de paso
              </h2>
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm border border-gray-200">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="px-2 py-1 border">Metrica</th>
                      <th class="px-2 py-1 border">h = {m1.h}</th>
                      <th class="px-2 py-1 border">h = {m2.h}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="px-2 py-1 border">Pasos (n)</td>
                      <td class="px-2 py-1 border">{m1.steps}</td>
                      <td class="px-2 py-1 border">{m2.steps}</td>
                    </tr>
                    <tr>
                      <td class="px-2 py-1 border">ErrAbs max Heun</td>
                      <td class="px-2 py-1 border">
                        {m1.maxAbsErrorHeun.toFixed(6)}
                      </td>
                      <td class="px-2 py-1 border">
                        {m2.maxAbsErrorHeun.toFixed(6)}
                      </td>
                    </tr>
                    <tr>
                      <td class="px-2 py-1 border">ErrAbs max RK4</td>
                      <td class="px-2 py-1 border">
                        {m1.maxAbsErrorRk4.toFixed(6)}
                      </td>
                      <td class="px-2 py-1 border">
                        {m2.maxAbsErrorRk4.toFixed(6)}
                      </td>
                    </tr>
                    <tr>
                      <td class="px-2 py-1 border">RMSE Heun</td>
                      <td class="px-2 py-1 border">{m1.rmseHeun.toFixed(6)}</td>
                      <td class="px-2 py-1 border">{m2.rmseHeun.toFixed(6)}</td>
                    </tr>
                    <tr>
                      <td class="px-2 py-1 border">RMSE RK4</td>
                      <td class="px-2 py-1 border">{m1.rmseRk4.toFixed(6)}</td>
                      <td class="px-2 py-1 border">{m2.rmseRk4.toFixed(6)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {interpretation && (
            <section class="flex flex-col gap-2">
              <h2 class="text-xl font-semibold">Interpretacion</h2>
              <Interpretation text={interpretation} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
