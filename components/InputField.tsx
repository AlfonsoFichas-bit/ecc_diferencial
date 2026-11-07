export interface InputFieldProps {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  min?: number;
  step?: string;
  help?: string;
  symbol?: string;
}

export function InputField(props: InputFieldProps) {
  return (
    <div class="flex flex-col gap-1.5 group">
      <div class="flex items-center justify-between text-xs font-medium">
        <label for={props.id} class="text-slate-200 flex items-center gap-1.5">
          {props.symbol && (
            <span class="font-mono font-semibold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50 text-[11px]">
              {props.symbol}
            </span>
          )}
          <span>{props.label}</span>
        </label>
        <span class="font-mono text-slate-400 text-[11px] bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
          {props.unit}
        </span>
      </div>

      <div class="relative">
        <input
          id={props.id}
          type="number"
          value={props.value}
          min={props.min}
          step={props.step ?? "any"}
          onInput={(e) =>
            props.onChange((e.currentTarget as HTMLInputElement).value)}
          class={`w-full bg-slate-900/90 text-slate-100 font-mono text-sm px-3 py-2 rounded-lg border transition-all duration-150 outline-none focus:ring-2 ${
            props.error
              ? "border-rose-500/80 focus:ring-rose-500/30 text-rose-200"
              : "border-slate-800 hover:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20"
          }`}
        />
      </div>

      {props.help && !props.error && (
        <p class="text-[11px] text-slate-400 leading-tight">
          {props.help}
        </p>
      )}

      {props.error && (
        <p class="text-[11px] text-rose-400 font-medium flex items-center gap-1">
          <svg
            class="w-3.5 h-3.5 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {props.error}
        </p>
      )}
    </div>
  );
}
