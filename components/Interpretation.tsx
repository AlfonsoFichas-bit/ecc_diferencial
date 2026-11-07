export interface InterpretationProps {
  text: string;
  isAlert?: boolean;
  threshold?: number;
  finalConcentration?: number;
  betterMethod?: string;
  timeToAlert?: number | null;
}

export function Interpretation(props: InterpretationProps) {
  const isAlert = props.isAlert ?? false;

  return (
    <div
      class={`rounded-xl border p-5 transition-all duration-200 ${
        isAlert
          ? "bg-amber-950/20 border-amber-500/40 text-amber-100"
          : "bg-emerald-950/20 border-emerald-500/40 text-emerald-100"
      }`}
    >
      <div class="flex items-start gap-3.5">
        <div
          class={`p-2 rounded-lg shrink-0 ${
            isAlert
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          }`}
        >
          {isAlert
            ? (
              <svg
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )
            : (
              <svg
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
        </div>

        <div class="flex flex-col gap-2 flex-1">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="text-sm font-semibold tracking-wide uppercase">
              {isAlert
                ? "Alerta Sanitaria Preventiva · Nivel Crítico"
                : "Condición Sanitaria Aceptable · Nivel Seguro"}
            </h3>
            <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-700/60 text-slate-300">
              Criterio Normativo ICA La Paz
            </span>
          </div>

          <p class="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {props.text}
          </p>

          <div class="mt-2 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span class="text-slate-400 block text-[11px]">
                Método Más Preciso:
              </span>
              <span class="text-cyan-400 font-semibold font-mono text-sm">
                {props.betterMethod ?? "RK4 Clásico"}
              </span>
            </div>
            <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span class="text-slate-400 block text-[11px]">
                Concentración Final:
              </span>
              <span class="text-slate-100 font-semibold font-mono text-sm">
                {props.finalConcentration !== undefined
                  ? `${props.finalConcentration.toFixed(2)} µg/m³`
                  : "—"}
              </span>
            </div>
            <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span class="text-slate-400 block text-[11px]">
                Cruce del Umbral:
              </span>
              <span
                class={`font-semibold font-mono text-sm ${
                  isAlert ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {props.timeToAlert !== null && props.timeToAlert !== undefined
                  ? props.timeToAlert === 0
                    ? "Inicia sobre el umbral"
                    : `t ≈ ${props.timeToAlert.toFixed(2)} h`
                  : "No cruza umbral"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
