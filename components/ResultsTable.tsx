import type { SimulationResult } from "../lib/model.ts";

export interface ResultsTableProps {
  result: SimulationResult;
  stepSizeName?: string;
}

export function ResultsTable(props: ResultsTableProps) {
  const { t, exact, heun, rk4 } = props.result;

  return (
    <div class="w-full flex flex-col gap-2">
      <div class="flex items-center justify-between text-xs text-slate-400">
        <span>
          Mostrando <strong class="text-slate-200">{t.length}</strong>{" "}
          puntos de discretización{" "}
          {props.stepSizeName ? `(${props.stepSizeName})` : ""}
        </span>
        <span class="text-[11px] text-slate-500">
          Valores numéricos expresados con precisión a 4 decimales
        </span>
      </div>

      <div class="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/60 shadow-inner max-h-96">
        <table class="min-w-full text-xs text-left border-collapse font-mono">
          <thead class="bg-slate-950/90 sticky top-0 border-b border-slate-800 z-10 backdrop-blur">
            <tr class="text-slate-400">
              <th class="px-3 py-2.5 font-semibold text-slate-300">t (h)</th>
              <th class="px-3 py-2.5 font-semibold text-slate-200">
                C_exacta (µg/m³)
              </th>
              <th class="px-3 py-2.5 font-semibold text-cyan-400">
                C_Heun (µg/m³)
              </th>
              <th class="px-3 py-2.5 font-semibold text-emerald-400">
                C_RK4 (µg/m³)
              </th>
              <th class="px-3 py-2.5 font-semibold text-cyan-300">
                ErrAbs Heun
              </th>
              <th class="px-3 py-2.5 font-semibold text-emerald-300">
                ErrAbs RK4
              </th>
              <th class="px-3 py-2.5 font-semibold text-slate-400">
                ErrRel% Heun
              </th>
              <th class="px-3 py-2.5 font-semibold text-slate-400">
                ErrRel% RK4
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            {t.map((ti, i) => {
              const eh = Math.abs(heun[i] - exact[i]);
              const er = Math.abs(rk4[i] - exact[i]);
              const rph = exact[i] === 0
                ? "—"
                : ((eh / Math.abs(exact[i])) * 100).toFixed(4) + "%";
              const rpr = exact[i] === 0
                ? "—"
                : ((er / Math.abs(exact[i])) * 100).toFixed(4) + "%";

              return (
                <tr
                  key={i}
                  class="hover:bg-slate-800/40 transition-colors odd:bg-slate-900/20 even:bg-slate-950/30"
                >
                  <td class="px-3 py-2 text-slate-300 font-medium">
                    {ti.toFixed(2)}
                  </td>
                  <td class="px-3 py-2 text-slate-100 font-medium">
                    {exact[i].toFixed(4)}
                  </td>
                  <td class="px-3 py-2 text-cyan-300">{heun[i].toFixed(4)}</td>
                  <td class="px-3 py-2 text-emerald-300 font-semibold">
                    {rk4[i].toFixed(4)}
                  </td>
                  <td class="px-3 py-2 text-cyan-400/90">{eh.toFixed(5)}</td>
                  <td class="px-3 py-2 text-emerald-400 font-semibold bg-emerald-950/20">
                    {er.toFixed(6)}
                  </td>
                  <td class="px-3 py-2 text-slate-400">{rph}</td>
                  <td class="px-3 py-2 text-emerald-300/80">{rpr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
