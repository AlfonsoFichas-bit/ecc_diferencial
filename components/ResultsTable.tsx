import type { SimulationResult } from "../lib/model.ts";

export interface ResultsTableProps {
  result: SimulationResult;
}

export function ResultsTable(props: ResultsTableProps) {
  const { t, exact, heun, rk4 } = props.result;
  return (
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm border border-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-2 py-1 border">t (h)</th>
            <th class="px-2 py-1 border">C_exacta (µg/m³)</th>
            <th class="px-2 py-1 border">C_Heun (µg/m³)</th>
            <th class="px-2 py-1 border">C_RK4 (µg/m³)</th>
            <th class="px-2 py-1 border">ErrAbs Heun</th>
            <th class="px-2 py-1 border">ErrAbs RK4</th>
            <th class="px-2 py-1 border">ErrRel% Heun</th>
            <th class="px-2 py-1 border">ErrRel% RK4</th>
          </tr>
        </thead>
        <tbody>
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
              <tr key={i} class="odd:bg-white even:bg-gray-50">
                <td class="px-2 py-1 border">{ti.toFixed(3)}</td>
                <td class="px-2 py-1 border">{exact[i].toFixed(4)}</td>
                <td class="px-2 py-1 border">{heun[i].toFixed(4)}</td>
                <td class="px-2 py-1 border">{rk4[i].toFixed(4)}</td>
                <td class="px-2 py-1 border">{eh.toFixed(4)}</td>
                <td class="px-2 py-1 border">{er.toFixed(4)}</td>
                <td class="px-2 py-1 border">{rph}</td>
                <td class="px-2 py-1 border">{rpr}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
