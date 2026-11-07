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
}

export function InputField(props: InputFieldProps) {
  return (
    <div class="flex flex-col gap-1">
      <label for={props.id} class="text-sm font-medium text-gray-700">
        {props.label} <span class="text-gray-500">({props.unit})</span>
      </label>
      <input
        id={props.id}
        type="number"
        value={props.value}
        min={props.min}
        step={props.step ?? "any"}
        onInput={(e) =>
          props.onChange((e.currentTarget as HTMLInputElement).value)}
        class={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          props.error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {props.help && <p class="text-xs text-gray-500">{props.help}</p>}
      {props.error && <p class="text-xs text-red-600">{props.error}</p>}
    </div>
  );
}
